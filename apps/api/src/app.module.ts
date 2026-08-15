import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PublishingModule } from './modules/publishing/publishing.module';
import { VideosModule } from './modules/videos/videos.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { EventsModule } from './modules/events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { VoiceModule } from './modules/voice/voice.module';
import { QUEUE_NAMES } from '@acf/shared';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // ─── Cron Schedules ─────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Rate Limiting ───────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 100, // max 100 requests per window
      },
    ]),

    // ─── BullMQ Queues ───────────────────────────────────────
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.RESEARCH },
      { name: QUEUE_NAMES.SCRIPT },
      { name: QUEUE_NAMES.FACT_CHECK },
      { name: QUEUE_NAMES.SEO },
      { name: QUEUE_NAMES.STORYBOARD },
      { name: QUEUE_NAMES.VOICE },
      { name: QUEUE_NAMES.IMAGE },
      { name: QUEUE_NAMES.SUBTITLE },
      { name: QUEUE_NAMES.VIDEO },
      { name: QUEUE_NAMES.THUMBNAIL },
      { name: QUEUE_NAMES.UPLOAD },
      { name: QUEUE_NAMES.ANALYTICS },
    ),

    // ─── Application Modules ─────────────────────────────────
    PrismaModule,
    HealthModule,
    EventsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    BrandsModule,
    ChannelsModule,
    ProvidersModule,
    ApiKeysModule,
    PromptsModule,
    VideosModule,
    PipelineModule,
    JobsModule,
    AssetsModule,
    AnalyticsModule,
    PublishingModule,
    AdminModule,
    VoiceModule,
  ],
})
export class AppModule {}
