import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@acf/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(page = 1, limit = 20) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, email: true, name: true, role: true, isActive: true, brandId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isActive: true, brandId: true, createdAt: true },
    });
  }

  update(id: string, data: { name?: string; role?: UserRole; isActive?: boolean; brandId?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async count() {
    return this.prisma.user.count();
  }
}
