import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { videoId?: string; queue?: string; status?: string; page?: number; limit?: number } = {}) {
    const { videoId, queue, status, page = 1, limit = 50 } = filters;
    return this.prisma.job.findMany({
      where: {
        ...(videoId ? { videoId } : {}),
        ...(queue ? { queue } : {}),
        ...(status ? { status: status as any } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      include: { video: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.job.findUniqueOrThrow({ where: { id }, include: { logs: true } });
  }

  async getStats() {
    const [total, active, completed, failed] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'ACTIVE' } }),
      this.prisma.job.count({ where: { status: 'COMPLETED' } }),
      this.prisma.job.count({ where: { status: 'FAILED' } }),
    ]);
    return { total, active, completed, failed };
  }
}
