import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.provider.findMany({
      include: { apiKeys: { select: { id: true, label: true, isActive: true, lastUsedAt: true, usageCount: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.provider.findUniqueOrThrow({ where: { id } });
  }

  async toggle(id: string, enabled: boolean) {
    return this.prisma.provider.update({ where: { id }, data: { enabled } });
  }

  async updateConfig(id: string, data: { modelConfig?: object; preferredFor?: string[]; baseUrl?: string }) {
    return this.prisma.provider.update({ where: { id }, data });
  }
}
