import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callTextProvider } from '../shared/ai-helper';
import { CryptoService } from '../shared/crypto-helper';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

createWorker(QUEUE_NAMES.SEO, async (job: Job) => {
  const { videoId, brandId, metadata } = job.data;
  await emitJobProgress(videoId, PipelineStep.SEO, 10, 'Optimizing for SEO...');

  const video = await prisma.video.findUniqueOrThrow({ where: { id: videoId }, include: { script: true } });
  const scriptContent = video.script?.content as any;

  const provider = await prisma.provider.findFirst({
    where: { enabled: true, capabilities: { has: 'TEXT' } },
    include: { apiKeys: { where: { isActive: true }, take: 1 } },
  });

  let seoData = { title: video.title, description: '', tags: [] as string[], keywords: [] as string[], seoScore: 80 };

  if (provider && provider.apiKeys.length > 0) {
    const apiKey = CryptoService.decrypt(provider.apiKeys[0].encryptedKey);

    const prompt = `Optimize this YouTube video for SEO. Return JSON: { title, description, tags: string[], keywords: string[], seoScore: number }
Video title: ${video.title}
Script summary: ${JSON.stringify(scriptContent?.sections?.slice(0, 2) || []).substring(0, 1000)}`;

    const response = await callTextProvider(provider.name, apiKey, prompt).catch(() => '{}');

    try {
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim());
      seoData = { ...seoData, ...parsed };
    } catch { /* use defaults */ }
  }

  await prisma.video.update({
    where: { id: videoId },
    data: {
      title: seoData.title || video.title,
      description: seoData.description,
      tags: seoData.tags || [],
      seoTitle: seoData.title,
      seoDescription: seoData.description,
      seoKeywords: seoData.keywords || [],
      pipelineStep: PipelineStep.STORYBOARD,
    },
  });

  await prisma.script.update({ where: { videoId }, data: { seoScore: seoData.seoScore || 80 } });

  await emitJobProgress(videoId, PipelineStep.SEO, 100, 'SEO done! Creating storyboard...');

  await enqueueNextStep(QUEUE_NAMES.STORYBOARD, videoId, brandId, 'storyboard', { seoData, scriptContent });
  await prisma.job.create({ data: { queue: QUEUE_NAMES.STORYBOARD, videoId, payload: {} } });

  return { success: true, seoData };
});
