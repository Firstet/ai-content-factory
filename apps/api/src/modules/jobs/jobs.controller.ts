import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private service: JobsService) {}

  @Get() findAll(@Query() q: any) { return this.service.findAll(q); }
  @Get('stats') stats() { return this.service.getStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
}
