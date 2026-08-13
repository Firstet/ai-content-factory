import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('overview') getOverview() { return this.service.getOverview(); }
  @Get('video/:videoId') getVideo(@Param('videoId') id: string) { return this.service.getVideoAnalytics(id); }
  @Get('brand/:brandId') getBrand(@Param('brandId') id: string) { return this.service.getBrandAnalytics(id); }
}
