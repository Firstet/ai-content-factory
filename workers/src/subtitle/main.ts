import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress } from '../shared/worker.base';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

// Subtitle worker uses Whisper-compatible API to transcribe audio
createWorker(QUEUE_NAMES.SUBTITLE, async (job: Job) => {
  const { videoId } = job.data;
  await emitJobProgress(videoId, PipelineStep.SUBTITLE, 10, 'Generating subtitles...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  if (!script) return { success: false, error: 'No script found' };

  // Build SRT from script sections (time-based)
  const sections = (script.content as any)?.sections || [];
  let srt = '';
  let currentTime = 0;

  const hook = (script.content as any)?.hook || '';
  if (hook) {
    const duration = 30;
    srt += `1\n${formatSRTTime(currentTime)} --> ${formatSRTTime(currentTime + duration)}\n${hook.substring(0, 100)}\n\n`;
    currentTime += duration;
  }

  sections.forEach((section: any, i: number) => {
    const duration = section.durationSeconds || 30;
    const words = section.content.split(' ');
    const chunkSize = 10;
    const chunks = [];
    for (let j = 0; j < words.length; j += chunkSize) {
      chunks.push(words.slice(j, j + chunkSize).join(' '));
    }
    const chunkDuration = duration / Math.max(chunks.length, 1);

    chunks.forEach((chunk, k) => {
      const idx = i * 100 + k + 2;
      const start = currentTime + k * chunkDuration;
      srt += `${idx}\n${formatSRTTime(start)} --> ${formatSRTTime(start + chunkDuration)}\n${chunk}\n\n`;
    });

    currentTime += duration;
  });

  // Save as asset (simplified — would use Whisper in production)
  await prisma.asset.create({
    data: {
      videoId,
      type: 'SUBTITLE',
      url: `subtitle-placeholder-${videoId}`,
      key: `videos/${videoId}/subtitles/subtitles.srt`,
      mimeType: 'text/srt',
      sizeBytes: BigInt(Buffer.byteLength(srt, 'utf8')),
      metadata: { srtContent: srt.substring(0, 1000) },
    },
  });

  await emitJobProgress(videoId, PipelineStep.SUBTITLE, 100, 'Subtitles generated!');
  return { success: true };
});

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}
