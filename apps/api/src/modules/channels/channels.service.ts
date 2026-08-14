import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import axios from 'axios';

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  findAll(brandId?: string) {
    return this.prisma.channel.findMany({
      where: brandId ? { brandId } : {},
      include: {
        brand: { select: { id: true, name: true } },
        _count: { select: { videos: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.channel.findUniqueOrThrow({ where: { id } });
  }

  create(data: { brandId: string; platform: string; name: string; platformChannelId?: string }) {
    return this.prisma.channel.create({ data: data as any });
  }

  update(id: string, data: object) {
    return this.prisma.channel.update({ where: { id }, data });
  }

  /**
   * Store OAuth tokens encrypted.
   */
  async storeTokens(id: string, accessToken: string, refreshToken: string, expiresAt?: Date) {
    return this.prisma.channel.update({
      where: { id },
      data: {
        accessToken: this.crypto.encrypt(accessToken),
        refreshToken: refreshToken ? this.crypto.encrypt(refreshToken) : undefined,
        tokenExpiresAt: expiresAt,
        isConnected: true,
      },
    });
  }

  async getDecryptedTokens(id: string) {
    const channel = await this.prisma.channel.findUniqueOrThrow({ where: { id } });
    const accessToken = channel.accessToken
      ? this.crypto.decrypt(channel.accessToken)
      : process.env[`${channel.platform}_ACCESS_TOKEN`] || process.env[`${channel.platform}_CLIENT_SECRET`];

    const refreshToken = channel.refreshToken
      ? this.crypto.decrypt(channel.refreshToken)
      : process.env[`${channel.platform}_REFRESH_TOKEN`];

    return {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    };
  }

  getYouTubeOAuthUrl(redirectUri?: string) {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    if (!clientId) {
      return { configured: false, error: 'YOUTUBE_CLIENT_ID is not configured in .env' };
    }
    const rUri = redirectUri || process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/channels/oauth/youtube/callback';
    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile'
    );
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(rUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    return { configured: true, url };
  }

  async handleYouTubeOAuthCallback(code: string, redirectUri?: string) {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const rUri = redirectUri || process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/channels/oauth/youtube/callback';

    if (!clientId || !clientSecret) {
      throw new Error('YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET is missing in .env');
    }

    // Exchange authorization code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: rUri,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

    // Fetch YouTube channel info
    let channelName = 'YouTube Channel';
    let platformChannelId = 'UC_default';
    try {
      const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (channelRes.data.items && channelRes.data.items.length > 0) {
        const ch = channelRes.data.items[0];
        channelName = ch.snippet?.title || channelName;
        platformChannelId = ch.id || platformChannelId;
      }
    } catch (e) {
      // Fallback
    }

    // Get default brand or first brand
    const brand = await this.prisma.brand.findFirst();
    if (!brand) {
      throw new Error('No brand found to attach YouTube channel to');
    }

    // Find existing channel or create new one
    const existing = await this.prisma.channel.findFirst({
      where: { brandId: brand.id, platform: 'YOUTUBE', platformChannelId },
    });

    if (existing) {
      return this.storeTokens(existing.id, access_token, refresh_token, expiresAt);
    } else {
      const newChannel = await this.prisma.channel.create({
        data: {
          brandId: brand.id,
          platform: 'YOUTUBE',
          name: channelName,
          platformChannelId,
          isConnected: true,
          accessToken: this.crypto.encrypt(access_token),
          refreshToken: refresh_token ? this.crypto.encrypt(refresh_token) : undefined,
          tokenExpiresAt: expiresAt,
        },
      });
      return newChannel;
    }
  }

  delete(id: string) {
    return this.prisma.channel.delete({ where: { id } });
  }
}
