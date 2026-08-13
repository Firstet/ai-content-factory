import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { brandId?: string; status?: string; page?: number; limit?: number } = {}) {
    const { brandId, status, page = 1, limit = 20 } = filters;
    return this.prisma.video.findMany({
      where: {
        ...(brandId ? { brandId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        brand: { select: { id: true, name: true } },
        channel: { select: { id: true, name: true, platform: true } },
        _count: { select: { jobs: true, assets: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.video.findUniqueOrThrow({
      where: { id },
      include: {
        brand: true,
        channel: true,
        script: true,
        jobs: { orderBy: { createdAt: 'asc' } },
        assets: true,
        analytics: true,
        uploads: true,
      },
    });
  }

  update(id: string, data: object) {
    return this.prisma.video.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.video.delete({ where: { id } });
  }

  async getDashboardStats() {
    const [total, processing, published, failed] = await Promise.all([
      this.prisma.video.count(),
      this.prisma.video.count({ where: { status: 'PROCESSING' } }),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.video.count({ where: { status: 'FAILED' } }),
    ]);
    return { total, processing, published, failed };
  }
}
