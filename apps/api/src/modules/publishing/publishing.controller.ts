import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PublishingService } from './publishing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Publishing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('publishing')
export class PublishingController {
  constructor(private service: PublishingService) {}

  @Post(':videoId/:channelId')
  publish(
    @Param('videoId') videoId: string,
    @Param('channelId') channelId: string,
    @Body() opts?: { scheduledAt?: string },
  ) {
    return this.service.publishVideo(videoId, channelId, {
      scheduledAt: opts?.scheduledAt ? new Date(opts.scheduledAt) : undefined,
    });
  }

  @Get()
  findAll(@Query('videoId') videoId?: string) { return this.service.findAll(videoId); }
}
