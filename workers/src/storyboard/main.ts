import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

createWorker(QUEUE_NAMES.STORYBOARD, async (job: Job) => {
  const { videoId, brandId, metadata } = job.data;
  await emitJobProgress(videoId, PipelineStep.STORYBOARD, 20, 'Creating storyboard...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  const scriptContent = script?.content as any;
  const sections = scriptContent?.sections || [];

  const storyboard = sections.map((section: any, i: number) => ({
    id: `frame-${i}`,
    sectionId: section.id,
    imagePrompt: section.imagePrompt || `Professional visual for: ${section.heading}`,
    duration: section.durationSeconds || 30,
    transition: i % 3 === 0 ? 'fade' : i % 3 === 1 ? 'slide' : 'cut',
    voiceText: section.content,
  }));

  await prisma.log.create({
    data: {
      level: 'INFO',
      message: `Storyboard created: ${storyboard.length} frames`,
      context: 'StoryboardWorker',
      metadata: { videoId, frameCount: storyboard.length },
    },
  });

  await prisma.video.update({ where: { id: videoId }, data: { pipelineStep: PipelineStep.VOICE } });

  await emitJobProgress(videoId, PipelineStep.STORYBOARD, 100, 'Storyboard done! Generating voice...');

  await enqueueNextStep(QUEUE_NAMES.VOICE, videoId, brandId, 'voice', { storyboard, sections });
  await prisma.job.create({ data: { queue: QUEUE_NAMES.VOICE, videoId, payload: { frameCount: storyboard.length } } });

  return { success: true, frameCount: storyboard.length };
});
