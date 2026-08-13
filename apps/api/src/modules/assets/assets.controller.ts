import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private service: AssetsService) {}
  @Get() findAll(@Query('videoId') videoId?: string) { return this.service.findAll(videoId); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(id); }
  @Get('upload-url') getUploadUrl(@Query('fileName') f: string, @Query('mimeType') m: string) {
    return this.service.getPresignedUploadUrl(f, m);
  }
}
