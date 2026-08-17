// ============================================================
// Image Worker — Step 7: Generate visuals for each scene
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import axios from 'axios';
import * as Minio from 'minio';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callImageProvider, resolveKeyForTask } from '../shared/ai-helper';
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

  await emitJobProgress(videoId, PipelineStep.IMAGE, 5, 'Starting scene image generation...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  const scriptContent = script?.content as any;
  const allSections: any[] = sections.length ? sections : (scriptContent?.sections || []);

  const resolvedKey = await resolveKeyForTask(prisma, 'image');

  const imageUrls: string[] = [];

  for (let i = 0; i < allSections.length; i++) {
    const section = allSections[i];
    const progress = Math.round(10 + (i / allSections.length) * 75);
    const prompt = section.imagePrompt || `Professional, high quality visual scene for: ${section.heading}. Cinematic, 16:9, highly detailed.`;

    await emitJobProgress(videoId, PipelineStep.IMAGE, progress, `Generating image ${i + 1}/${allSections.length}...`);

    let imageBuffer: Buffer | null = null;

    try {
      const seed = Math.floor(Math.random() * 1000000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true`;
      
      let url = pollinationsUrl;
      let key = `videos/${videoId}/images/scene-${i + 1}.jpg`;

      try {
        if (resolvedKey && resolvedKey.providerName === 'OPENAI') {
          const urls = await callImageProvider(resolvedKey.providerName, resolvedKey.apiKey, prompt, resolvedKey.model);
          if (urls.length > 0) {
            const imgResponse = await axios.get(urls[0], { responseType: 'arraybuffer', timeout: 15000 });
            imageBuffer = Buffer.from(imgResponse.data);
          }
        }

        if (!imageBuffer) {
          const imgResponse = await axios.get(pollinationsUrl, { responseType: 'arraybuffer', timeout: 15000 });
          imageBuffer = Buffer.from(imgResponse.data);
        }

        if (imageBuffer) {
          await minioClient.putObject(bucket, key, imageBuffer, imageBuffer.length, { 'Content-Type': 'image/jpeg' });
          url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${bucket}/${key}`;
        }
      } catch (uploadErr: any) {
        console.warn(`MinIO storage unavailable, using direct Pollinations AI image URL: ${uploadErr.message}`);
      }

      imageUrls.push(url);

      await prisma.asset.create({
        data: {
          videoId,
          type: 'IMAGE',
          url,
          key,
          mimeType: 'image/jpeg',
          sizeBytes: BigInt(imageBuffer ? imageBuffer.length : 1024),
          metadata: { sectionId: section.id, sectionIndex: i, prompt },
        },
      });
    } catch (err: any) {
      console.error(`Image generation warning for section ${i}: ${err.message}`);
    }
  }

  await emitJobProgress(videoId, PipelineStep.IMAGE, 90, 'Images done! Starting video rendering...');

  await prisma.video.update({ where: { id: videoId }, data: { pipelineStep: PipelineStep.VIDEO } });

  // Chain to video assembly
  await enqueueNextStep(QUEUE_NAMES.VIDEO, videoId, brandId, 'video', { imageUrls });
  await prisma.job.create({ data: { queue: QUEUE_NAMES.VIDEO, videoId, payload: { imageCount: imageUrls.length } } });

  return { success: true, imageCount: imageUrls.length };
});
