import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucket: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.bucket = this.config.get('MINIO_BUCKET') || 'acf-assets';
    this.minioClient = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT') || 'minio',
      port: parseInt(this.config.get('MINIO_PORT') || '9000'),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY') || '',
      secretKey: this.config.get('MINIO_SECRET_KEY') || '',
    });
  }

  /**
   * Upload a Buffer to MinIO and return the object URL.
   */
  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    videoId?: string,
    isPublic = true,
  ): Promise<{ url: string; key: string }> {
    const key = `${videoId ? `videos/${videoId}/` : 'general/'}${uuidv4()}-${fileName}`;
    
    await this.minioClient.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    const url = await this.getPublicUrl(key);

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

    this.logger.debug(`Uploaded asset: ${key}`);
    return { url, key };
  }

  async getPublicUrl(key: string): Promise<string> {
    // Return a presigned URL valid for 7 days, or a public URL if bucket is public
    const endpoint = this.config.get('MINIO_ENDPOINT');
    const port = this.config.get('MINIO_PORT') || '9000';
    return `http://${endpoint}:${port}/${this.bucket}/${key}`;
  }

  async getPresignedUploadUrl(fileName: string, mimeType: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `uploads/${uuidv4()}-${fileName}`;
    const uploadUrl = await this.minioClient.presignedPutObject(this.bucket, key, 3600);
    return { uploadUrl, key };
  }

  findAll(videoId?: string) {
    return this.prisma.asset.findMany({
      where: videoId ? { videoId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const asset = await this.prisma.asset.findUniqueOrThrow({ where: { id } });
    await this.minioClient.removeObject(this.bucket, asset.key);
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
