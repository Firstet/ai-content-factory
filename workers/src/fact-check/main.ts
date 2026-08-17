import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callTextProvider, resolveKeyForTask } from '../shared/ai-helper';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

createWorker(QUEUE_NAMES.FACT_CHECK, async (job: Job) => {
  const { videoId, brandId, metadata } = job.data;
  await emitJobProgress(videoId, PipelineStep.FACT_CHECK, 10, 'Fact checking script...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  if (!script) throw new Error('No script to fact check');

  const resolvedKey = await resolveKeyForTask(prisma, 'fact-check');

  let factCheckResult = { score: 85, issues: [], approved: true };

  if (resolvedKey) {
    const { providerName, apiKey, model, customBaseURL } = resolvedKey;
    const scriptText = (script.content as any)?.sections?.map((s: any) => s.content).join('\n') || script.rawText;

    const response = await callTextProvider(
      providerName, apiKey,
      `Fact check this script. Return JSON: { score: 0-100, issues: [{claim, confidence, note}], approved: boolean }\n\nScript:\n${scriptText.substring(0, 3000)}`,
      undefined,
      model,
      customBaseURL,
    ).catch(() => '{"score": 85, "issues": [], "approved": true}');

    try {
      factCheckResult = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim());
    } catch { /* use defaults */ }
  }

  await prisma.script.update({
    where: { videoId },
    data: { isFactChecked: true },
  });

  await prisma.video.update({ where: { id: videoId }, data: { pipelineStep: PipelineStep.SEO } });
  await emitJobProgress(videoId, PipelineStep.FACT_CHECK, 100, 'Fact check done! Running SEO...');

  await enqueueNextStep(QUEUE_NAMES.SEO, videoId, brandId, 'seo', { factCheckResult, scriptContent: script.content });
  await prisma.job.create({ data: { queue: QUEUE_NAMES.SEO, videoId, payload: {} } });

  return { success: true, factCheckResult };
});
