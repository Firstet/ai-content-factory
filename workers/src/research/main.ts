// ============================================================
// Research Worker — Step 1 of the content pipeline
// Researches the topic and discovers subtopics
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

interface ResearchJobData {
  videoId: string;
  brandId: string;
  step: string;
  metadata: {
    topic: string;
    targetDuration?: number;
    targetAudience?: string;
    language?: string;
    tone?: string;
    runFullPipeline?: boolean;
  };
}

createWorker(QUEUE_NAMES.RESEARCH, async (job: Job<ResearchJobData>) => {
  const { videoId, brandId, metadata } = job.data;
  const { topic, targetAudience, language = 'English', runFullPipeline = true } = metadata;

  console.log(`🔍 Researching: "${topic}" for video ${videoId}`);
  await job.updateProgress(10);
  await emitJobProgress(videoId, PipelineStep.RESEARCH, 10, 'Starting research...');

  // Update job status in DB
  await prisma.job.updateMany({
    where: { videoId, queue: QUEUE_NAMES.RESEARCH },
    data: { status: 'ACTIVE', progress: 10 },
  });

  // 1. Get the research prompt from DB
  const prompt = await prisma.prompt.findFirst({
    where: { category: 'research', isActive: true, OR: [{ brandId }, { isGlobal: true }] },
    orderBy: [{ brandId: 'asc' }, { createdAt: 'desc' }],
  });

  // 2. Get an enabled AI provider for text generation
  const provider = await prisma.provider.findFirst({
    where: { enabled: true, capabilities: { has: 'TEXT' } },
    include: { apiKeys: { where: { isActive: true }, take: 1 } },
    orderBy: [{ preferredFor: 'asc' }],
  });

  let researchSummary = '';
  let suggestedAngles: string[] = [];

  if (provider && provider.apiKeys.length > 0) {
    await emitJobProgress(videoId, PipelineStep.RESEARCH, 30, `Using ${provider.displayName} for research...`);

    try {
      // Decrypt API key
      const { CryptoService } = await import('../shared/crypto-helper');
      const apiKey = CryptoService.decrypt(provider.apiKeys[0].encryptedKey);

      // Build research prompt
      let promptText = prompt?.template || `Research the topic: "${topic}" thoroughly. Provide:
1. A comprehensive summary (500 words)
2. 5-7 key angles to cover
3. Latest statistics and facts
4. Target audience insights
Return as JSON: { summary, angles, facts, audienceInsights }`;

      promptText = promptText
        .replace(/{{topic}}/g, topic)
        .replace(/{{audience}}/g, targetAudience || 'general audience')
        .replace(/{{language}}/g, language);

      // Call AI provider
      const { callTextProvider } = await import('../shared/ai-helper');
      const response = await callTextProvider(provider.name, apiKey, promptText);

      try {
        const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim());
        researchSummary = parsed.summary || response;
        suggestedAngles = parsed.angles || [];
      } catch {
        researchSummary = response;
        suggestedAngles = [];
      }
    } catch (err: any) {
      console.error('Research AI call failed:', err.message);
      researchSummary = `Research for "${topic}": ${topic} is a fascinating subject that warrants deep exploration.`;
    }
  } else {
    console.warn('No AI provider available for research — using placeholder');
    researchSummary = `Research summary for: ${topic}`;
  }

  await job.updateProgress(80);
  await emitJobProgress(videoId, PipelineStep.RESEARCH, 80, 'Research complete, saving...');

  // 3. Save research result to video metadata
  await prisma.video.update({
    where: { id: videoId },
    data: { pipelineStep: PipelineStep.SCRIPT },
  });

  // Store research as a log entry (could be its own model in v2)
  await prisma.log.create({
    data: {
      level: 'INFO',
      message: `Research completed for video ${videoId}`,
      context: 'ResearchWorker',
      metadata: { videoId, topic, researchSummary: researchSummary.substring(0, 2000), suggestedAngles },
    },
  });

  await prisma.job.updateMany({
    where: { videoId, queue: QUEUE_NAMES.RESEARCH },
    data: { status: 'COMPLETED', progress: 100, result: { researchSummary, suggestedAngles } },
  });

  await job.updateProgress(100);
  await emitJobProgress(videoId, PipelineStep.RESEARCH, 100, 'Research done! Starting script...');

  // 4. Chain to next step
  if (runFullPipeline) {
    await enqueueNextStep(QUEUE_NAMES.SCRIPT, videoId, brandId, 'script', {
      topic,
      researchSummary,
      suggestedAngles,
      targetDuration: metadata.targetDuration || 10,
      language,
      tone: metadata.tone,
    });

    // Create script job record
    await prisma.job.create({
      data: {
        queue: QUEUE_NAMES.SCRIPT,
        videoId,
        payload: { topic, researchSummary: researchSummary.substring(0, 500) },
      },
    });
  }

  return { success: true, researchSummary, suggestedAngles };
});
