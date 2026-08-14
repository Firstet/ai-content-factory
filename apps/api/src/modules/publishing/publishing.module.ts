import { Module } from '@nestjs/common';
import { PublishingController } from './publishing.controller';
import { PublishingService } from './publishing.service';
import { YouTubePublisher } from './publishers/youtube.publisher';
import { TikTokPublisher } from './publishers/tiktok.publisher';
import { InstagramPublisher } from './publishers/instagram.publisher';
import { FacebookPublisher } from './publishers/facebook.publisher';
import { TwitterPublisher } from './publishers/twitter.publisher';
import { LinkedInPublisher } from './publishers/linkedin.publisher';
import { ChannelsModule } from '../channels/channels.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CryptoModule } from '../../common/crypto/crypto.module';

@Module({
  imports: [ChannelsModule, PrismaModule, CryptoModule],
  controllers: [PublishingController],
  providers: [
    PublishingService,
    YouTubePublisher,
    TikTokPublisher,
    InstagramPublisher,
    FacebookPublisher,
    TwitterPublisher,
    LinkedInPublisher,
  ],
  exports: [PublishingService],
})
export class PublishingModule {}
