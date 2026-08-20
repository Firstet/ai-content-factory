// ============================================================
// Video Worker — Step 9: FFmpeg assembly (Strategy A)
// Assembles: voice audio + images + transitions → final MP4
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const bucket = process.env.MINIO_BUCKET || 'acf-assets';

createWorker(QUEUE_NAMES.VIDEO, async (job: Job) => {
  const { videoId, brandId } = job.data;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `acf-${videoId}-`));

  await emitJobProgress(videoId, PipelineStep.VIDEO, 5, 'Starting video assembly...');

  try {
    // 1. Fetch all image and audio assets for this video
    const assets = await prisma.asset.findMany({
      where: { videoId },
      orderBy: { createdAt: 'asc' },
    });

    const audioAsset = assets.find((a: any) => a.type === 'AUDIO');
    const imageAssets = assets.filter((a: any) => a.type === 'IMAGE');
    const subtitleAsset = assets.find((a: any) => a.type === 'SUBTITLE');

    if (!audioAsset) throw new Error('No audio asset found. Voice step may have failed.');

    await emitJobProgress(videoId, PipelineStep.VIDEO, 15, `Downloading ${imageAssets.length} images...`);

    // 2. Download audio, images, and subtitles to temp directory
    const audioPath = path.join(tmpDir, 'audio.mp3');
    const audioData = await axios.get(audioAsset.url, { responseType: 'arraybuffer' });
    fs.writeFileSync(audioPath, Buffer.from(audioData.data));

    let assPath: string | undefined;
    if (subtitleAsset && subtitleAsset.url) {
      try {
        assPath = path.join(tmpDir, 'subtitles.ass');
        const subData = await axios.get(subtitleAsset.url, { responseType: 'arraybuffer' });
        fs.writeFileSync(assPath, Buffer.from(subData.data));
      } catch (err: any) {
        console.warn('Subtitle asset download failed, proceeding without burn-in:', err.message);
        assPath = undefined;
      }
    }

    const imagePaths: string[] = [];
    for (let i = 0; i < imageAssets.length; i++) {
      const imgPath = path.join(tmpDir, `image-${i}.jpg`);
      const imgData = await axios.get(imageAssets[i].url, { responseType: 'arraybuffer' });
      fs.writeFileSync(imgPath, Buffer.from(imgData.data));
      imagePaths.push(imgPath);
    }

    // Use a fallback black image if no images
    if (imagePaths.length === 0) {
      const blackImg = path.join(tmpDir, 'black.jpg');
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input('color=c=black:size=1920x1080:rate=30')
          .inputFormat('lavfi')
          .output(blackImg)
          .outputOptions(['-frames:v 1'])
          .on('end', () => resolve())
          .on('error', reject)
          .run();
      });
      imagePaths.push(blackImg);
    }

    await emitJobProgress(videoId, PipelineStep.VIDEO, 30, 'Assembling video with FFmpeg...');

    // 3. Get audio duration
    const audioDuration = await getAudioDuration(audioPath);
    const imageDuration = audioDuration / imagePaths.length;

    // 4. Create concat video from images with Ken Burns effect
    const imageVideo = path.join(tmpDir, 'images.mp4');
    await createSlideshow(imagePaths, imageDuration, imageVideo);

    await emitJobProgress(videoId, PipelineStep.VIDEO, 60, 'Adding audio track & burning in ASS subtitles...');

    // 5. Merge audio + video + burn-in ASS subtitles
    const outputPath = path.join(tmpDir, 'output.mp4');
    await mergeAudioVideo(imageVideo, audioPath, outputPath, assPath);

    await emitJobProgress(videoId, PipelineStep.VIDEO, 80, 'Uploading final video...');

    // 6. Upload to MinIO
    const videoBuffer = fs.readFileSync(outputPath);
    const key = `videos/${videoId}/final/output.mp4`;
    await minioClient.putObject(bucket, key, videoBuffer, videoBuffer.length, { 'Content-Type': 'video/mp4' });
    
    const videoUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${key}`;

    // Record asset
    await prisma.asset.create({
      data: {
        videoId,
        type: 'VIDEO',
        url: videoUrl,
        key,
        mimeType: 'video/mp4',
        sizeBytes: BigInt(videoBuffer.length),
      },
    });

    // Update video record
    await prisma.video.update({
      where: { id: videoId },
      data: {
        videoUrl,
        status: 'RENDERED',
        durationSeconds: Math.round(audioDuration),
        pipelineStep: PipelineStep.THUMBNAIL,
      },
    });

    await emitJobProgress(videoId, PipelineStep.VIDEO, 100, 'Video rendered! Generating thumbnail...');

    // Chain to thumbnail
    await enqueueNextStep(QUEUE_NAMES.THUMBNAIL, videoId, brandId, 'thumbnail', { videoUrl });
    await prisma.job.create({ data: { queue: QUEUE_NAMES.THUMBNAIL, videoId, payload: {} } });

    return { success: true, videoUrl, duration: Math.round(audioDuration) };
  } finally {
    // Cleanup temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 60);
    });
  });
}

function createSlideshow(imagePaths: string[], duration: number, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    // Add each image as an input
    imagePaths.forEach(img => cmd.input(img).inputOptions([`-loop 1`, `-t ${duration}`]));

    // Build complex filter for Ken Burns zoom effect on each image
    const filterParts: string[] = [];
    const concatParts: string[] = [];

    imagePaths.forEach((_, i) => {
      const label = `img${i}`;
      filterParts.push(
        `[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,` +
        `zoompan=z='min(zoom+0.0005,1.05)':d=${Math.round(duration * 30)}:s=1920x1080,` +
        `setsar=1[${label}]`
      );
      concatParts.push(`[${label}]`);
    });

    const complexFilter = [
      ...filterParts,
      `${concatParts.join('')}concat=n=${imagePaths.length}:v=1:a=0[v]`,
    ].join(';');

    cmd
      .complexFilter(complexFilter)
      .map('[v]')
      .output(output)
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
      ])
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
}

function mergeAudioVideo(videoPath: string, audioPath: string, output: string, assPath?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg()
      .input(videoPath)
      .input(audioPath);

    const outputOptions = [
      '-c:a aac',
      '-b:a 192k',
      '-shortest',
      '-movflags +faststart',
    ];

    if (assPath && fs.existsSync(assPath)) {
      const sanitizedAss = assPath.replace(/\\/g, '/');
      cmd.videoFilters(`ass=${sanitizedAss}`);
      outputOptions.push('-c:v libx264', '-preset fast', '-crf 22');
    } else {
      outputOptions.push('-c:v copy');
    }

    cmd
      .outputOptions(outputOptions)
      .output(output)
      .on('end', () => resolve())
      .on('error', (err) => {
        console.warn('FFmpeg subtitle burn-in warning:', err.message);
        // Fallback merge without subtitle filter if ASS filter fails
        ffmpeg()
          .input(videoPath)
          .input(audioPath)
          .outputOptions(['-c:v copy', '-c:a aac', '-b:a 192k', '-shortest', '-movflags +faststart'])
          .output(output)
          .on('end', () => resolve())
          .on('error', reject)
          .run();
      })
      .run();
  });
}
