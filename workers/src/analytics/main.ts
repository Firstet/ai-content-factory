import 'dotenv/config';
import { Job } from 'bullmq';
import axios from 'axios';
import { createWorker, prisma, emitJobProgress } from '../shared/worker.base';
import { CryptoService } from '../shared/crypto-helper';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

createWorker(QUEUE_NAMES.ANALYTICS, async (job: Job) => {
  const { videoId, metadata } = job.data;
  const { channelId } = metadata || {};

  await emitJobProgress(videoId, PipelineStep.ANALYTICS, 10, 'Syncing analytics...');

  const upload = await prisma.upload.findFirst({
    where: { videoId, status: 'PUBLISHED' },
    include: { channel: true },
  });

  if (!upload || !upload.platformVideoId) {
    console.log(`No published upload for ${videoId} — skipping analytics`);
    return { success: true, skipped: true };
  }

  // Get channel access token
  const channel = await prisma.channel.findUnique({ where: { id: upload.channelId } });
  if (!channel?.accessToken) return { success: false, error: 'No channel token' };

  const accessToken = CryptoService.decrypt(channel.accessToken);

  // For YouTube — simplified analytics fetch
  if (upload.platform === 'YOUTUBE') {
    try {
      const res = await axios.get(`https://youtubeanalytics.googleapis.com/v2/reports`, {
        params: {
          ids: 'channel==MINE',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          metrics: 'views,likes,comments,shares,estimatedMinutesWatched',
          filters: `video==${upload.platformVideoId}`,
          dimensions: 'video',
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const rows = res.data?.rows?.[0] || [];
      if (rows.length > 0) {
        await prisma.analytics.create({
          data: {
            videoId,
            platform: 'YOUTUBE',
            views: BigInt(rows[0] || 0),
            likes: rows[1] || 0,
            comments: rows[2] || 0,
            shares: rows[3] || 0,
            avgViewDuration: rows[4] ? rows[4] / (rows[0] || 1) : null,
          },
        });
      }
    } catch (err: any) {
      console.error(`Analytics sync failed: ${err.message}`);
    }
  }

  await emitJobProgress(videoId, PipelineStep.ANALYTICS, 100, 'Analytics synced!');
  return { success: true };
});
