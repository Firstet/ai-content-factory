import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { Platform } from '@prisma/client';
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

  async create(data: {
    brandId?: string;
    platform: string;
    name: string;
    platformChannelId?: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    config?: any;
  }) {
    let brandId = data.brandId;
    if (!brandId) {
      let brand = await this.prisma.brand.findFirst();
      if (!brand) {
        brand = await this.prisma.brand.create({
          data: {
            name: 'Primary Studio Brand',
            slug: 'primary-studio-brand',
            niche: 'AI Tools & Tech Automation',
            autoPilotEnabled: true,
            scheduleFrequency: 'TWICE_DAILY',
          },
        });
      }
      brandId = brand.id;
    }

    const platformEnum = (data.platform || 'YOUTUBE').toUpperCase() as Platform;

    const encryptedAccess = data.accessToken ? this.crypto.encrypt(data.accessToken) : null;
    const encryptedRefresh = data.refreshToken ? this.crypto.encrypt(data.refreshToken) : null;

    const configObj = data.config || {};
    if (data.clientId) configObj.clientId = data.clientId;
    if (data.clientSecret) configObj.clientSecret = this.crypto.encrypt(data.clientSecret);

    return this.prisma.channel.create({
      data: {
        brandId,
        platform: platformEnum,
        name: data.name,
        platformChannelId: data.platformChannelId || `ch_${Date.now()}`,
        isConnected: true,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        config: configObj,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.accessToken) {
      updateData.accessToken = this.crypto.encrypt(data.accessToken);
    }
    if (data.refreshToken) {
      updateData.refreshToken = this.crypto.encrypt(data.refreshToken);
    }
    return this.prisma.channel.update({ where: { id }, data: updateData });
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

  getYouTubeOAuthUrl(redirectUri?: string, customClientId?: string) {
    const clientId = customClientId || process.env.YOUTUBE_CLIENT_ID;
    if (!clientId) {
      return { configured: false, error: 'OAuth Client ID not found. Enter your Client ID in the Connect Modal or Settings.' };
    }
    const rUri = redirectUri || process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/channels/oauth/youtube/callback';
    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile'
    );
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(rUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    return { configured: true, url };
  }

  async handleYouTubeOAuthCallback(code: string, redirectUri?: string, customClientId?: string, customClientSecret?: string) {
    const clientId = customClientId || process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = customClientSecret || process.env.YOUTUBE_CLIENT_SECRET;
    const rUri = redirectUri || process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/channels/oauth/youtube/callback';

    if (!clientId || !clientSecret) {
      throw new Error('YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET is missing. Please enter them in the Add Channel Modal.');
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

    // Get default brand or auto-create one
    let brand = await this.prisma.brand.findFirst();
    if (!brand) {
      brand = await this.prisma.brand.create({
        data: {
          name: 'Primary Studio Brand',
          slug: 'primary-studio-brand',
          niche: 'AI Tools & Tech Automation',
          autoPilotEnabled: true,
          scheduleFrequency: 'TWICE_DAILY',
        },
      });
    }

    // Find existing channel or create new one
    const existing = await this.prisma.channel.findFirst({
      where: { brandId: brand.id, platform: Platform.YOUTUBE, platformChannelId },
    });

    if (existing) {
      return this.storeTokens(existing.id, access_token, refresh_token, expiresAt);
    } else {
      const newChannel = await this.prisma.channel.create({
        data: {
          brandId: brand.id,
          platform: Platform.YOUTUBE,
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
