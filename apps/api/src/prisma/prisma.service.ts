import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Soft-delete helper — sets deletedAt timestamp instead of hard delete.
   * Uses a Prisma extension approach for soft deletes.
   */
  async softDelete(model: string, id: string) {
    // @ts-ignore — dynamic model access
    return this[model].update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
