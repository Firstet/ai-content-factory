import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucket: string;
  private readonly uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.bucket = this.config.get('MINIO_BUCKET') || 'acf-assets';
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    this.minioClient = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT') || 'minio',
      port: parseInt(this.config.get('MINIO_PORT') || '9000'),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY') || '',
      secretKey: this.config.get('MINIO_SECRET_KEY') || '',
    });
  }

  /**
   * Upload a Buffer to MinIO or fallback to local disk storage.
   */
  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    videoId?: string,
    isPublic = true,
  ): Promise<{ url: string; key: string }> {
    const safeName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const key = `${videoId ? `videos/${videoId}/` : 'general/'}${safeName}`;
    let url = '';

    try {
      await this.minioClient.putObject(this.bucket, key, buffer, buffer.length, {
        'Content-Type': mimeType,
      });
      url = await this.getPublicUrl(key);
    } catch (err: any) {
      this.logger.warn(`MinIO upload failed (${err.message}). Saving to local disk storage.`);
      const localFilePath = path.join(this.uploadDir, safeName);
      fs.writeFileSync(localFilePath, buffer);
      const appUrl = this.config.get('APP_URL') || 'http://localhost:3001';
      url = `${appUrl}/uploads/${safeName}`;
    }

    await this.prisma.asset.create({
      data: {
        videoId,
        type: this.getMimeType(mimeType),
        url,
        key,
        mimeType,
        sizeBytes: BigInt(buffer.length),
        isPublic,
      },
    });

    this.logger.debug(`Uploaded asset: ${url}`);
    return { url, key };
  }

  async getPublicUrl(key: string): Promise<string> {
    const endpoint = this.config.get('MINIO_ENDPOINT') || 'localhost';
    const port = this.config.get('MINIO_PORT') || '9000';
    return `http://${endpoint}:${port}/${this.bucket}/${key}`;
  }

  async getPresignedUploadUrl(fileName: string, mimeType: string): Promise<{ uploadUrl: string; key: string }> {
    const safeName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const key = `uploads/${safeName}`;
    try {
      const uploadUrl = await this.minioClient.presignedPutObject(this.bucket, key, 3600);
      return { uploadUrl, key };
    } catch (e) {
      const appUrl = this.config.get('APP_URL') || 'http://localhost:3001';
      return { uploadUrl: `${appUrl}/api/assets/upload`, key };
    }
  }

  findAll(videoId?: string) {
    return this.prisma.asset.findMany({
      where: videoId ? { videoId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const asset = await this.prisma.asset.findUniqueOrThrow({ where: { id } });
    try {
      await this.minioClient.removeObject(this.bucket, asset.key);
    } catch (e) {
      // Ignore minio delete error for local files
    }
    return this.prisma.asset.delete({ where: { id } });
  }

  private getMimeType(mimeType: string): 'AUDIO' | 'IMAGE' | 'VIDEO' | 'THUMBNAIL' | 'SUBTITLE' | 'DOCUMENT' {
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType === 'text/vtt' || mimeType === 'text/srt') return 'SUBTITLE';
    return 'DOCUMENT';
  }
}
