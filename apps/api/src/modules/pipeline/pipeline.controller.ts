import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { StartPipelineDto } from './dto/start-pipeline.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private service: PipelineService) {}

  @Post('start')
  start(@Body() dto: StartPipelineDto, @Request() req: any) {
    return this.service.startPipeline(dto, req.user.id);
  }

  @Get('status/:videoId')
  status(@Param('videoId') videoId: string) {
    return this.service.getPipelineStatus(videoId);
  }

  @Post('trigger/:videoId/:step')
  trigger(@Param('videoId') videoId: string, @Param('step') step: any) {
    return this.service.triggerStep(videoId, step);
  }

  @Get('queues')
  queues() {
    return this.service.getQueueStats();
  }
}
