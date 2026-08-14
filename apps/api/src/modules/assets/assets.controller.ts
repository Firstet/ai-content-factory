import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private service: AssetsService) {}

  @Get()
  findAll(@Query('videoId') videoId?: string) {
    return this.service.findAll(videoId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('upload-url')
  getUploadUrl(@Query('fileName') f: string, @Query('mimeType') m: string) {
    return this.service.getPresignedUploadUrl(f, m);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Query('videoId') videoId?: string) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.service.uploadBuffer(file.buffer, file.originalname, file.mimetype, videoId);
  }
}
