import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; voiceTone?: string; styleGuide?: string }) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return this.prisma.brand.create({ data: { ...data, slug } });
  }

  findAll() {
    return this.prisma.brand.findMany({
      include: { channels: true, _count: { select: { videos: true, users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.brand.findUniqueOrThrow({
      where: { id },
      include: { channels: true, prompts: true },
    });
  }

  update(id: string, data: object) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
