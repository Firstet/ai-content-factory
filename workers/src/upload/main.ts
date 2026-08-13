import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

createWorker(QUEUE_NAMES.UPLOAD, async (job: Job) => {
  const { videoId, metadata } = job.data;
  const { channelId, scheduledAt } = metadata || {};

  await emitJobProgress(videoId, PipelineStep.PUBLISHING, 10, 'Starting upload...');

  if (!channelId) {
    console.log(`No channel specified for ${videoId} — skipping auto-upload`);
    return { success: true, skipped: true };
  }

  // Call the API publishing endpoint internally
  // (In production this worker would directly call PublishingService)
  // For now, we log it and let the user trigger manually or via scheduler
  await prisma.log.create({
    data: {
      level: 'INFO',
      message: `Upload queued for video ${videoId} to channel ${channelId}`,
      context: 'UploadWorker',
      metadata: { videoId, channelId, scheduledAt },
    },
  });

  await prisma.video.update({
    where: { id: videoId },
    data: { scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined },
  });

  await emitJobProgress(videoId, PipelineStep.PUBLISHING, 100, 'Upload queued!');

  // Chain to analytics sync (after publishing)
  if (channelId) {
    await enqueueNextStep(QUEUE_NAMES.ANALYTICS, videoId, '', 'analytics', { channelId });
  }

  return { success: true };
});
