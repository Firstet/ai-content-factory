import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';

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
    return {
      accessToken: channel.accessToken ? this.crypto.decrypt(channel.accessToken) : null,
      refreshToken: channel.refreshToken ? this.crypto.decrypt(channel.refreshToken) : null,
    };
  }

  delete(id: string) {
    return this.prisma.channel.delete({ where: { id } });
  }
}
