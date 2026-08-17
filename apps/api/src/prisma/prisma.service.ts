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
    let retries = 10;
    let delayMs = 1000;
    while (retries > 0) {
      try {
        await this.$connect();
        console.log('✅ [PrismaService] Connected to PostgreSQL database successfully.');
        return;
      } catch (err: any) {
        retries--;
        console.warn(`⚠️ [PrismaService] Database connection failed (${err.message}). Retrying in ${delayMs}ms... (${retries} retries left)`);
        if (retries === 0) {
          console.error('❌ [PrismaService] Fatal: Failed to connect to database after 10 retries.', err);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * 1.5, 10000);
      }
    }
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
