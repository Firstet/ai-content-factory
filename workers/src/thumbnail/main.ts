// ============================================================
// Thumbnail Worker — Step 10: AI-generated thumbnail
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import * as ffmpeg from 'fluent-ffmpeg';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callImageProvider, callTextProvider } from '../shared/ai-helper';
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

createWorker(QUEUE_NAMES.THUMBNAIL, async (job: Job) => {
  const { videoId, brandId } = job.data;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `acf-thumb-${videoId}-`));

  await emitJobProgress(videoId, PipelineStep.THUMBNAIL, 10, 'Generating thumbnail...');

  try {
    const video = await prisma.video.findUniqueOrThrow({ where: { id: videoId }, include: { script: true } });
    const scriptContent = video.script?.content as any;

    const provider = await prisma.provider.findFirst({
      where: { enabled: true, capabilities: { has: 'IMAGE' } },
      include: { apiKeys: { where: { isActive: true }, take: 1 } },
    });

    let thumbnailUrl = '';

    if (provider && provider.apiKeys.length > 0) {
      const apiKey = CryptoService.decrypt(provider.apiKeys[0].encryptedKey);

      // Generate thumbnail copy text
      const thumbnailText = await callTextProvider(
        provider.name, apiKey,
        `Create a SINGLE compelling YouTube thumbnail text (max 4 bold words) for: "${video.title}". Return only the text, nothing else.`,
      ).catch(() => video.title.split(' ').slice(0, 3).join(' '));

      // Generate thumbnail image
      const prompt = `YouTube thumbnail: ${video.title}. Dramatic, vibrant, high contrast, 16:9, professional YouTube thumbnail style. Bold text: "${thumbnailText}". Eye-catching, photorealistic.`;

      await emitJobProgress(videoId, PipelineStep.THUMBNAIL, 40, 'Generating thumbnail image...');

      const urls = await callImageProvider(provider.name, apiKey, prompt).catch(() => []);

      if (urls.length > 0) {
        const imgData = await axios.get(urls[0], { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(imgData.data);
        
        // Resize to YouTube thumbnail dimensions (1280x720) using ffmpeg
        const inputPath = path.join(tmpDir, 'thumb-raw.jpg');
        const outputPath = path.join(tmpDir, 'thumb.jpg');
        fs.writeFileSync(inputPath, imgBuffer);

        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .output(outputPath)
            .size('1280x720')
            .outputOptions(['-q:v 2'])
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        const finalBuffer = fs.readFileSync(outputPath);
        const key = `videos/${videoId}/thumbnail/thumbnail.jpg`;
        await minioClient.putObject(bucket, key, finalBuffer, finalBuffer.length, { 'Content-Type': 'image/jpeg' });
        thumbnailUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${key}`;

        await prisma.asset.create({
          data: {
            videoId,
            type: 'THUMBNAIL',
            url: thumbnailUrl,
            key,
            mimeType: 'image/jpeg',
            sizeBytes: BigInt(finalBuffer.length),
          },
        });
      }
    } else {
      // Extract frame from video as fallback thumbnail
      const videoAsset = await prisma.asset.findFirst({ where: { videoId, type: 'VIDEO' } });
      if (videoAsset) {
        thumbnailUrl = videoAsset.url.replace('/final/output.mp4', '/thumbnail/thumbnail.jpg');
      }
    }

    if (thumbnailUrl) {
      await prisma.video.update({
        where: { id: videoId },
        data: { thumbnailUrl, pipelineStep: PipelineStep.PUBLISHING },
      });
    }

    await emitJobProgress(videoId, PipelineStep.THUMBNAIL, 100, 'Thumbnail done! Pipeline complete.');

    // Pipeline complete — update video status
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'RENDERED' },
    });

    return { success: true, thumbnailUrl };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
