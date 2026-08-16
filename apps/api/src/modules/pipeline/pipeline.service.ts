import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderRegistry } from '../providers/provider-registry.service';
import { QUEUE_NAMES, PipelineStep, VideoStatus } from '@acf/shared';
import { StartPipelineDto } from './dto/start-pipeline.dto';

/**
 * PipelineService — Orchestrates the 13-step content creation pipeline.
 * Each step enqueues a BullMQ job; workers process them asynchronously.
 */
@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private prisma: PrismaService,
    private providerRegistry: ProviderRegistry,

    @InjectQueue(QUEUE_NAMES.RESEARCH) private researchQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SCRIPT) private scriptQueue: Queue,
    @InjectQueue(QUEUE_NAMES.FACT_CHECK) private factCheckQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SEO) private seoQueue: Queue,
    @InjectQueue(QUEUE_NAMES.STORYBOARD) private storyboardQueue: Queue,
    @InjectQueue(QUEUE_NAMES.VOICE) private voiceQueue: Queue,
    @InjectQueue(QUEUE_NAMES.IMAGE) private imageQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SUBTITLE) private subtitleQueue: Queue,
    @InjectQueue(QUEUE_NAMES.VIDEO) private videoQueue: Queue,
    @InjectQueue(QUEUE_NAMES.THUMBNAIL) private thumbnailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.UPLOAD) private uploadQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ANALYTICS) private analyticsQueue: Queue,
  ) {}

  /**
   * Start a full content pipeline for a video.
   * Creates the video record and kicks off the Research step.
   */
  async startPipeline(dto: StartPipelineDto, createdById: string) {
    let resolvedBrandId = dto.brandId;

    if (!resolvedBrandId) {
      const existingBrand = await this.prisma.brand.findFirst({ where: { createdById } });
      if (existingBrand) {
        resolvedBrandId = existingBrand.id;
      } else {
        const defaultBrand = await this.prisma.brand.create({
          data: {
            name: 'Primary Studio Brand',
            niche: 'General Content Studio',
            voiceTone: 'High-energy, engaging, educational',
            autoPilotEnabled: true,
            createdById,
          },
        });
        resolvedBrandId = defaultBrand.id;
      }
    }

    // 1. Create the video record
    const video = await this.prisma.video.create({
      data: {
        title: dto.topic,
        status: VideoStatus.PROCESSING,
        brandId: resolvedBrandId,
        channelId: dto.channelId,
        createdById,
        pipelineStep: PipelineStep.RESEARCH,
        tags: dto.tags || [],
      },
    });

    this.logger.log(`🎬 Starting pipeline for video: ${video.id} — "${dto.topic}"`);

    // 2. Enqueue the first step (research)
    const job = await this.researchQueue.add(
      'research',
      {
        videoId: video.id,
        brandId: resolvedBrandId,
        channelId: dto.channelId,
        step: PipelineStep.RESEARCH,
        metadata: {
          topic: dto.topic,
          targetDuration: dto.targetDuration || 10,
          targetAudience: dto.targetAudience,
          language: dto.language || 'English',
          tone: dto.tone,
          runFullPipeline: dto.runFullPipeline !== false,
        },
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    // 3. Record the job in DB
    await this.prisma.job.create({
      data: {
        bullJobId: String(job.id),
        queue: QUEUE_NAMES.RESEARCH,
        videoId: video.id,
        payload: { topic: dto.topic },
      },
    });

    return {
      videoId: video.id,
      jobId: job.id,
      message: 'Pipeline started. Monitor progress at /jobs.',
    };
  }

  /**
   * Enqueue a specific pipeline step for a video (for manual retrigger).
   */
  async triggerStep(videoId: string, step: PipelineStep) {
    const video = await this.prisma.video.findUniqueOrThrow({ where: { id: videoId } });
    
    const queueMap: Record<string, Queue> = {
      [PipelineStep.RESEARCH]: this.researchQueue,
      [PipelineStep.SCRIPT]: this.scriptQueue,
      [PipelineStep.FACT_CHECK]: this.factCheckQueue,
      [PipelineStep.SEO]: this.seoQueue,
      [PipelineStep.STORYBOARD]: this.storyboardQueue,
      [PipelineStep.VOICE]: this.voiceQueue,
      [PipelineStep.IMAGE]: this.imageQueue,
      [PipelineStep.SUBTITLE]: this.subtitleQueue,
      [PipelineStep.VIDEO]: this.videoQueue,
      [PipelineStep.THUMBNAIL]: this.thumbnailQueue,
      [PipelineStep.PUBLISHING]: this.uploadQueue,
      [PipelineStep.ANALYTICS]: this.analyticsQueue,
    };

    const queue = queueMap[step];
    if (!queue) throw new Error(`Unknown pipeline step: ${step}`);

    const job = await queue.add(step.toLowerCase(), {
      videoId,
      brandId: video.brandId,
      step,
      metadata: {},
    });

    return { jobId: job.id, step, videoId };
  }

  /**
   * Get pipeline status for a video — all jobs and their states.
   */
  async getPipelineStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        jobs: { orderBy: { createdAt: 'asc' } },
        script: true,
        assets: true,
      },
    });

    return video;
  }

  /**
   * Get queue statistics for admin dashboard.
   */
  async getQueueStats() {
    const queues = [
      { name: QUEUE_NAMES.RESEARCH, queue: this.researchQueue },
      { name: QUEUE_NAMES.SCRIPT, queue: this.scriptQueue },
      { name: QUEUE_NAMES.VOICE, queue: this.voiceQueue },
      { name: QUEUE_NAMES.IMAGE, queue: this.imageQueue },
      { name: QUEUE_NAMES.VIDEO, queue: this.videoQueue },
      { name: QUEUE_NAMES.THUMBNAIL, queue: this.thumbnailQueue },
      { name: QUEUE_NAMES.UPLOAD, queue: this.uploadQueue },
      { name: QUEUE_NAMES.ANALYTICS, queue: this.analyticsQueue },
    ];

    const stats = await Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);
        return { name, waiting, active, completed, failed, delayed };
      }),
    );

    return stats;
  }
}
