import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private service: ChannelsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query('brandId') brandId?: string) {
    return this.service.findAll(brandId);
  }

  @Get('oauth/youtube/url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getYouTubeOAuthUrl(@Query('redirectUri') redirectUri?: string) {
    return this.service.getYouTubeOAuthUrl(redirectUri);
  }

  @Get('oauth/youtube/callback')
  async handleYouTubeCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: any,
  ) {
    const webUrl = process.env.APP_URL || 'http://localhost:3002';
    if (error || !code) {
      return res.redirect(`${webUrl}/admin/channels?error=${encodeURIComponent(error || 'No authorization code provided')}`);
    }
    try {
      await this.service.handleYouTubeOAuthCallback(code);
      return res.redirect(`${webUrl}/admin/channels?status=connected&platform=YOUTUBE`);
    } catch (err: any) {
      return res.redirect(`${webUrl}/admin/channels?error=${encodeURIComponent(err.message || 'OAuth authentication failed')}`);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
