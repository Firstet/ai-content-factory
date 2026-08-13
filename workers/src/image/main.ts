// ============================================================
// Image Worker — Step 7: Generate visuals for each scene
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import axios from 'axios';
import * as Minio from 'minio';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callImageProvider } from '../shared/ai-helper';
import { CryptoService } from '../shared/crypto-helper';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const bucket = process.env.MINIO_BUCKET || 'acf-assets';

createWorker(QUEUE_NAMES.IMAGE, async (job: Job) => {
  const { videoId, brandId, metadata } = job.data;
  const sections: any[] = metadata.sections || [];

  await emitJobProgress(videoId, PipelineStep.IMAGE, 5, 'Starting image generation...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  const scriptContent = script?.content as any;
  const allSections: any[] = sections.length ? sections : (scriptContent?.sections || []);

  const provider = await prisma.provider.findFirst({
    where: { enabled: true, capabilities: { has: 'IMAGE' } },
    include: { apiKeys: { where: { isActive: true }, take: 1 } },
  });

  const imageUrls: string[] = [];

  if (provider && provider.apiKeys.length > 0) {
    const apiKey = CryptoService.decrypt(provider.apiKeys[0].encryptedKey);
    
    for (let i = 0; i < allSections.length; i++) {
      const section = allSections[i];
      const progress = Math.round(10 + (i / allSections.length) * 70);
      
      await emitJobProgress(videoId, PipelineStep.IMAGE, progress, `Generating image ${i + 1}/${allSections.length}...`);

      try {
        const prompt = section.imagePrompt || `Professional, high quality image for: ${section.heading}. Cinematic, 16:9, photorealistic.`;
        const urls = await callImageProvider(provider.name, apiKey, prompt);
        
        if (urls.length > 0) {
          // Download image from URL and upload to MinIO
          const imgResponse = await axios.get(urls[0], { responseType: 'arraybuffer' });
          const imgBuffer = Buffer.from(imgResponse.data);
          
          const key = `videos/${videoId}/images/scene-${i + 1}.jpg`;
          await minioClient.putObject(bucket, key, imgBuffer, imgBuffer.length, { 'Content-Type': 'image/jpeg' });
          
          const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${key}`;
          imageUrls.push(url);

          await prisma.asset.create({
            data: {
              videoId,
              type: 'IMAGE',
              url,
              key,
              mimeType: 'image/jpeg',
              sizeBytes: BigInt(imgBuffer.length),
              metadata: { sectionId: section.id, sectionIndex: i },
            },
          });
        }
      } catch (err: any) {
        console.error(`Image generation failed for section ${i}: ${err.message}`);
        imageUrls.push(''); // placeholder
      }
    }
  } else {
    console.warn('No image provider available — skipping image generation');
  }

  await emitJobProgress(videoId, PipelineStep.IMAGE, 90, 'Images done! Starting video assembly...');

  await prisma.video.update({ where: { id: videoId }, data: { pipelineStep: PipelineStep.VIDEO } });

  // Chain to video assembly
  await enqueueNextStep(QUEUE_NAMES.VIDEO, videoId, brandId, 'video', { imageUrls });
  await prisma.job.create({ data: { queue: QUEUE_NAMES.VIDEO, videoId, payload: { imageCount: imageUrls.length } } });

  return { success: true, imageCount: imageUrls.length };
});
