import { Controller, Get, Post, Body, Query, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { VoiceService } from './voice.service';

@ApiTags('Voice & TTS')
@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('voices')
  getVoices() {
    return this.voiceService.getVoices();
  }

  @Get('preview')
  @Header('Content-Type', 'audio/mpeg')
  async getPreviewStream(@Query('voiceId') voiceId: string, @Query('text') text: string, @Res() res: Response) {
    const audioBuffer = await this.voiceService.generateVoicePreview(voiceId || 'en_US-lessac-medium', text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audioBuffer);
  }

  @Post('preview')
  @Header('Content-Type', 'audio/mpeg')
  async postPreviewStream(@Body() body: { voiceId?: string; text?: string }, @Res() res: Response) {
    const audioBuffer = await this.voiceService.generateVoicePreview(body.voiceId || 'en_US-lessac-medium', body.text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length.toString());
    return res.send(audioBuffer);
  }
}
