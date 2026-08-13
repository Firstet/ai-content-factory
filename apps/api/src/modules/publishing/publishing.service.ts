import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';
import { YouTubePublisher } from './publishers/youtube.publisher';
import { TikTokPublisher } from './publishers/tiktok.publisher';
import { InstagramPublisher } from './publishers/instagram.publisher';
import { FacebookPublisher } from './publishers/facebook.publisher';
import { TwitterPublisher } from './publishers/twitter.publisher';
import { LinkedInPublisher } from './publishers/linkedin.publisher';
import { SocialPublisher } from './interfaces/publisher.interface';

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  private readonly publishers: Map<string, SocialPublisher>;

  constructor(
    private prisma: PrismaService,
    private channelsService: ChannelsService,
    youtube: YouTubePublisher,
    tiktok: TikTokPublisher,
    instagram: InstagramPublisher,
    facebook: FacebookPublisher,
    twitter: TwitterPublisher,
    linkedin: LinkedInPublisher,
  ) {
    this.publishers = new Map([
      ['YOUTUBE', youtube],
      ['TIKTOK', tiktok],
      ['INSTAGRAM', instagram],
      ['FACEBOOK', facebook],
      ['TWITTER', twitter],
      ['LINKEDIN', linkedin],
    ]);
  }

  /**
   * Publish a video to a channel.
   * Decrypts OAuth tokens, calls the platform publisher, records the upload.
   */
  async publishVideo(videoId: string, channelId: string, options?: { scheduledAt?: Date }) {
    const video = await this.prisma.video.findUniqueOrThrow({
      where: { id: videoId },
      include: { channel: true },
    });

    if (!video.videoUrl) throw new NotFoundException('Video has not been rendered yet');

    const channel = await this.prisma.channel.findUniqueOrThrow({ where: { id: channelId } });
    const tokens = await this.channelsService.getDecryptedTokens(channelId);

    if (!tokens.accessToken) {
      throw new NotFoundException(`Channel ${channelId} has no access token. Please reconnect.`);
    }

    const publisher = this.publishers.get(channel.platform);
    if (!publisher) throw new NotFoundException(`No publisher for platform: ${channel.platform}`);

    this.logger.log(`Publishing ${videoId} to ${channel.platform} channel ${channel.name}`);

    const result = await publisher.publish({
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || undefined,
      title: video.title,
      description: video.description || '',
      tags: video.tags,
      accessToken: tokens.accessToken,
      channelId: channel.platformChannelId || channelId,
      scheduledAt: options?.scheduledAt,
    });

    // Record the upload
    await this.prisma.upload.create({
      data: {
        videoId,
        channelId,
        platform: channel.platform as any,
        title: video.title,
        description: video.description || '',
        tags: video.tags,
        status: result.success ? 'PUBLISHED' : 'FAILED',
        platformVideoId: result.platformVideoId,
        platformUrl: result.platformUrl,
        publishedAt: result.success ? new Date() : undefined,
        scheduledAt: options?.scheduledAt,
        errorMessage: result.error,
      },
    });

    if (result.success) {
      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
    }

    return result;
  }

  findAll(videoId?: string) {
    return this.prisma.upload.findMany({
      where: videoId ? { videoId } : {},
      include: {
        video: { select: { id: true, title: true } },
        channel: { select: { id: true, name: true, platform: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
