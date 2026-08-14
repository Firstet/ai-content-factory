import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PipelineService } from './pipeline.service';

@Injectable()
export class AutoPilotSchedulerService {
  private readonly logger = new Logger(AutoPilotSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private pipelineService: PipelineService,
  ) {}

  /**
   * Runs every 10 minutes to check all active Auto-Pilot brand schedules.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleAutoPilotCron() {
    this.logger.log('⏱️ Checking Auto-Pilot schedules for active brands...');

    try {
      const activeBrands = await this.prisma.brand.findMany({
        where: {
          autoPilotEnabled: true,
          isActive: true,
        },
        include: {
          channels: { where: { isConnected: true } },
          users: { take: 1 },
        },
      });

      if (activeBrands.length === 0) {
        this.logger.log('No brands currently have Auto-Pilot enabled.');
        return;
      }

      const now = new Date();

      for (const brand of activeBrands) {
        // Check if nextAutoRunAt is due (or if it has never run yet)
        if (brand.nextAutoRunAt && brand.nextAutoRunAt > now) {
          continue; // Not due yet
        }

        this.logger.log(`🚀 Auto-Pilot triggered for Brand "${brand.name}" (${brand.id})`);

        // Generate dynamic topic based on brand niche & keywords
        const keywordsList = Array.isArray(brand.keywords) ? brand.keywords : [];
        const keywordSeed = keywordsList.length > 0
          ? keywordsList[Math.floor(Math.random() * keywordsList.length)]
          : 'AI & Automation';

        const topicPrompt = `The Future of ${brand.niche || 'Technology'} with ${keywordSeed} in 2026`;

        // Pick creator (first user in brand or system default)
        const creatorId = brand.users[0]?.id || 'system-admin';

        // Select channel if connected
        const targetChannelId = brand.channels[0]?.id || undefined;

        // Start Pipeline
        const result = await this.pipelineService.startPipeline(
          {
            topic: topicPrompt,
            brandId: brand.id,
            channelId: targetChannelId,
            targetDuration: 5,
            targetAudience: `Audience interested in ${brand.niche || 'Technology'}`,
            language: 'English',
            tone: brand.voiceTone || 'Engaging & high energy',
            runFullPipeline: true,
          },
          creatorId,
        );

        // Calculate next run time based on scheduleFrequency
        const nextRun = this.calculateNextRunTime(brand.scheduleFrequency, now);

        await this.prisma.brand.update({
          where: { id: brand.id },
          data: {
            lastAutoRunAt: now,
            nextAutoRunAt: nextRun,
          },
        });

        this.logger.log(
          `✅ Auto-Pilot job launched for video ${result.videoId}. Next scheduled run: ${nextRun.toISOString()}`,
        );
      }
    } catch (err: any) {
      this.logger.error('Error during Auto-Pilot cron execution:', err.stack || err.message);
    }
  }

  private calculateNextRunTime(frequency: string, currentTime: Date): Date {
    const next = new Date(currentTime);

    switch (frequency) {
      case 'THREE_TIMES_DAILY':
        next.setHours(next.getHours() + 8); // Every 8 hours
        break;
      case 'TWICE_DAILY':
        next.setHours(next.getHours() + 12); // Every 12 hours
        break;
      case 'DAILY_1X':
        next.setHours(next.getHours() + 24); // Every 24 hours
        break;
      case 'EVERY_2_DAYS':
        next.setHours(next.getHours() + 48); // Every 48 hours
        break;
      case 'EVERY_3_DAYS':
        next.setHours(next.getHours() + 72); // Every 72 hours
        break;
      default:
        next.setHours(next.getHours() + 12); // Fallback twice daily
        break;
    }

    return next;
  }
}
