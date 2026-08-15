// ============================================================
// Voice Worker — Step 6: Generate TTS audio for each section
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import axios from 'axios';
import * as Minio from 'minio';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callSpeechProvider } from '../shared/ai-helper';
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

async function generateFreeTTS(text: string): Promise<Buffer> {
  // Truncate or chunk for Google TTS public API
  const cleanText = text.substring(0, 1000);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`;
  const res = await axios.get(ttsUrl, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  return Buffer.from(res.data);
}

createWorker(QUEUE_NAMES.VOICE, async (job: Job) => {
  const { videoId, brandId, metadata } = job.data;
  await emitJobProgress(videoId, PipelineStep.VOICE, 5, 'Starting voice generation...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  if (!script) throw new Error(`No script found for video ${videoId}`);

  const scriptContent = script.content as any;
  const sections: any[] = scriptContent.sections || [];

  // Full narration text
  const fullText = [
    scriptContent.hook,
    ...sections.map((s: any) => s.content),
    scriptContent.callToAction,
  ].filter(Boolean).join('\n\n');

  // Get active provider with API Key
  const provider = await prisma.provider.findFirst({
    where: { enabled: true, apiKeys: { some: { isActive: true } } },
    include: { apiKeys: { where: { isActive: true }, take: 1 } },
  });

  let audioBuffer: Buffer | null = null;

  if (provider && provider.name === 'OPENAI' && provider.apiKeys.length > 0) {
    try {
      await emitJobProgress(videoId, PipelineStep.VOICE, 20, `Generating voice with ${provider.displayName}...`);
      const apiKey = CryptoService.decrypt(provider.apiKeys[0].encryptedKey);
      const voice = (provider.modelConfig as any)?.voice || 'alloy';
      audioBuffer = await callSpeechProvider(provider.name, apiKey, fullText, voice);
    } catch (err: any) {
      console.warn(`OpenAI Speech call warning: ${err.message}. Using free TTS fallback...`);
    }
  }

  // Fallback to Free Voice TTS
  if (!audioBuffer) {
    await emitJobProgress(videoId, PipelineStep.VOICE, 30, 'Using free voice synthesis...');
    audioBuffer = await generateFreeTTS(fullText);
  }

  await emitJobProgress(videoId, PipelineStep.VOICE, 70, 'Uploading audio narration...');

  // Upload to MinIO
  const key = `videos/${videoId}/voice/narration.mp3`;
  await minioClient.putObject(bucket, key, audioBuffer, audioBuffer.length, { 'Content-Type': 'audio/mpeg' });
  
  const audioUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${key}`;

  // Record asset
  await prisma.asset.create({
    data: {
      videoId,
      type: 'AUDIO',
      url: audioUrl,
      key,
      mimeType: 'audio/mpeg',
      sizeBytes: BigInt(audioBuffer.length),
    },
  });

  await prisma.video.update({ where: { id: videoId }, data: { pipelineStep: PipelineStep.IMAGE } });

  await emitJobProgress(videoId, PipelineStep.VOICE, 100, 'Voice complete! Generating scene visuals...');

  // Chain to image generation
  await enqueueNextStep(QUEUE_NAMES.IMAGE, videoId, brandId, 'image', { audioUrl, sections });
  await prisma.job.create({ data: { queue: QUEUE_NAMES.IMAGE, videoId, payload: {} } });

  return { success: true, audioUrl };
});
