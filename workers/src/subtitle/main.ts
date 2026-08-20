import 'dotenv/config';
import { Job } from 'bullmq';
import * as Minio from 'minio';
import { createWorker, prisma, emitJobProgress } from '../shared/worker.base';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const bucket = process.env.MINIO_BUCKET || 'acf-assets';

// Subtitle worker generates timed SRT & professional ASS subtitles
createWorker(QUEUE_NAMES.SUBTITLE, async (job: Job) => {
  const { videoId, brandId } = job.data;
  await emitJobProgress(videoId, PipelineStep.SUBTITLE, 10, 'Generating professional captions & ASS subtitle track...');

  const script = await prisma.script.findUnique({ where: { videoId } });
  if (!script) return { success: false, error: 'No script found' };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { brand: true },
  });

  const captionStyle = video?.brand?.captionStyle || 'HORMOZI_YELLOW';
  const captionPosition = video?.brand?.captionPosition || 'BOTTOM';
  const isVertical = video?.brand?.aspectRatio === '9:16';

  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;

  const sections = (script.content as any)?.sections || [];
  const hook = (script.content as any)?.hook || '';

  let srtContent = '';
  let assEvents = '';
  let currentTime = 0;
  let srtIndex = 1;

  // Process Hook Scene if present
  if (hook) {
    const hookDuration = 5;
    const { srtBlock, assEvent } = generateSubtitleBlock(
      srtIndex++,
      currentTime,
      hookDuration,
      hook
    );
    srtContent += srtBlock;
    assEvents += assEvent;
    currentTime += hookDuration;
  }

  // Process Script Sections
  sections.forEach((section: any) => {
    const duration = section.durationSeconds || 10;
    const text = section.narrationText || section.content || '';
    if (!text) return;

    const words = text.split(/\s+/).filter(Boolean);
    const chunkSize = isVertical ? 5 : 8;
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }

    const chunkDuration = duration / Math.max(chunks.length, 1);

    chunks.forEach((chunk) => {
      const { srtBlock, assEvent } = generateSubtitleBlock(
        srtIndex++,
        currentTime,
        chunkDuration,
        chunk
      );
      srtContent += srtBlock;
      assEvents += assEvent;
      currentTime += chunkDuration;
    });
  });

  // Build full ASS subtitle string
  const assHeader = generateASSHeader(captionStyle, captionPosition, width, height);
  const assContent = assHeader + assEvents;

  // Upload ASS subtitle to MinIO
  const assKey = `videos/${videoId}/subtitles/subtitles.ass`;
  const assBuffer = Buffer.from(assContent, 'utf8');

  try {
    await minioClient.putObject(bucket, assKey, assBuffer, assBuffer.length, {
      'Content-Type': 'text/x-ass',
    });
  } catch (err: any) {
    console.warn('MinIO ASS upload fallback:', err.message);
  }

  const assUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${assKey}`;

  // Create Subtitle Asset Record in Database
  await prisma.asset.create({
    data: {
      videoId,
      type: 'SUBTITLE',
      url: assUrl,
      key: assKey,
      mimeType: 'text/x-ass',
      sizeBytes: BigInt(assBuffer.length),
      metadata: {
        captionStyle,
        captionPosition,
        srtContent: srtContent.substring(0, 2000),
        assContent: assContent.substring(0, 2000),
      },
    },
  });

  await emitJobProgress(videoId, PipelineStep.SUBTITLE, 100, `Subtitles generated (${captionStyle})!`);
  return { success: true, assUrl, captionStyle };
});

function generateSubtitleBlock(index: number, startSec: number, durationSec: number, text: string) {
  const endSec = startSec + durationSec;
  const srtBlock = `${index}\n${formatSRTTime(startSec)} --> ${formatSRTTime(endSec)}\n${text}\n\n`;

  // Build ASS Dialogue line with Karaoke word highlighting
  const words = text.split(/\s+/).filter(Boolean);
  const msPerWord = Math.floor((durationSec * 100) / Math.max(words.length, 1));
  const karaokeText = words.map((w) => `{\\k${msPerWord}}${w}`).join(' ');

  const assEvent = `Dialogue: 0,${formatASSTime(startSec)},${formatASSTime(endSec)},Default,,0,0,0,,${karaokeText}\n`;

  return { srtBlock, assEvent };
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function formatASSTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor(((seconds % 1) * 100) / 1);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

function generateASSHeader(captionStyle: string, captionPosition: string, width: number, height: number): string {
  let alignment = 2; // Bottom Center
  let marginV = 60;

  if (captionPosition === 'MIDDLE') {
    alignment = 5; // Middle Center
    marginV = 0;
  } else if (captionPosition === 'TOP') {
    alignment = 8; // Top Center
    marginV = 100;
  }

  let fontName = 'Arial';
  let fontSize = 42;
  let primaryCol = '&H0000FFFF'; // Yellow (ABGR)
  let secondaryCol = '&H0000A5FF'; // Orange
  let outlineCol = '&H00000000'; // Black
  let backCol = '&H80000000';
  let bold = -1;
  let outline = 3;
  let shadow = 2;

  switch (captionStyle) {
    case 'NEON_CYBERPUNK':
      fontName = 'Trebuchet MS';
      fontSize = 44;
      primaryCol = '&H00FFFF00'; // Cyan
      secondaryCol = '&H00FF00FF'; // Magenta
      outlineCol = '&H00FF0088'; // Neon Purple
      backCol = '&H00000000';
      bold = -1;
      outline = 4;
      shadow = 3;
      break;
    case 'MINIMALIST_DARK':
      fontName = 'Helvetica';
      fontSize = 32;
      primaryCol = '&H00FFFFFF'; // White
      secondaryCol = '&H00E0E0E0';
      outlineCol = '&H00000000';
      backCol = '&HC0111827'; // Dark translucent
      bold = 0;
      outline = 1;
      shadow = 1;
      break;
    case 'BOLD_WHITE':
      fontName = 'Impact';
      fontSize = 48;
      primaryCol = '&H00FFFFFF'; // White
      secondaryCol = '&H0000FFFF'; // Yellow
      outlineCol = '&H00000000';
      backCol = '&H00000000';
      bold = -1;
      outline = 4;
      shadow = 0;
      break;
    case 'HORMOZI_YELLOW':
    default:
      fontName = 'Arial Black';
      fontSize = 46;
      primaryCol = '&H0000FFFF'; // Yellow
      secondaryCol = '&H0000FF00'; // Green highlight
      outlineCol = '&H00000000';
      backCol = '&H80000000';
      bold = -1;
      outline = 3;
      shadow = 2;
      break;
  }

  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryCol},${secondaryCol},${outlineCol},${backCol},${bold},0,0,0,100,100,0,0,1,${outline},${shadow},${alignment},20,20,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
}

