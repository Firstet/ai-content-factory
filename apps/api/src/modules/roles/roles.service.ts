import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.role.findMany({ include: { permissions: true } }); }
  create(data: { name: string; description?: string }) { return this.prisma.role.create({ data }); }
  addPermission(roleId: string, action: string, resource: string) {
    return this.prisma.permission.create({ data: { roleId, action, resource } });
  }
  removePermission(id: string) { return this.prisma.permission.delete({ where: { id } }); }
}
