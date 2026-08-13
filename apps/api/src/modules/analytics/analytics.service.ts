import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalViews, totalVideos, totalPublished] = await Promise.all([
      this.prisma.analytics.aggregate({ _sum: { views: true, likes: true, comments: true } }),
      this.prisma.video.count(),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
    ]);
    return { totalViews: totalViews._sum.views || 0, totalLikes: totalViews._sum.likes || 0, totalComments: totalViews._sum.comments || 0, totalVideos, totalPublished };
  }

  getVideoAnalytics(videoId: string) {
    return this.prisma.analytics.findMany({
      where: { videoId },
      orderBy: { syncedAt: 'desc' },
    });
  }

  getBrandAnalytics(brandId: string) {
    return this.prisma.analytics.findMany({
      where: { video: { brandId } },
      include: { video: { select: { id: true, title: true } } },
      orderBy: { syncedAt: 'desc' },
      take: 100,
    });
  }

  async upsertAnalytics(data: {
    videoId: string;
    platform: string;
    views: bigint;
    likes: number;
    comments: number;
    shares?: number;
    avgViewDuration?: number;
    impressions?: bigint;
  }) {
    return this.prisma.analytics.create({ data: data as any });
  }
}
