import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [users, videos, jobs, providers, brands] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.video.count(),
      this.prisma.job.count(),
      this.prisma.provider.count({ where: { enabled: true } }),
      this.prisma.brand.count(),
    ]);

    const [published, processing, failed] = await Promise.all([
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.video.count({ where: { status: 'PROCESSING' } }),
      this.prisma.video.count({ where: { status: 'FAILED' } }),
    ]);

    const recentLogs = await this.prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      counts: { users, videos, jobs, providers, brands },
      videoStats: { published, processing, failed },
      recentLogs,
    };
  }

  getSystemLogs(level?: string, page = 1, limit = 100) {
    return this.prisma.log.findMany({
      where: level ? { level: level as any } : {},
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
