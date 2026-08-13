import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { QUEUE_NAMES } from '@acf/shared';

@Module({
  imports: [
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
  ],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
