import { Module } from '@nestjs/common';
import { NichesController } from './niches.controller';
import { NichesService } from './niches.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [PrismaModule, ProvidersModule],
  controllers: [NichesController],
  providers: [NichesService],
  exports: [NichesService],
})
export class NichesModule {}
