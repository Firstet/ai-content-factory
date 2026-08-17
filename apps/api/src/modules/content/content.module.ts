import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentProjectService } from './content-project.service';
import { PlatformAdaptationService } from './platform-adaptation.service';
import { ContentQAService } from './content-qa.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [PrismaModule, ProvidersModule],
  controllers: [ContentController],
  providers: [ContentProjectService, PlatformAdaptationService, ContentQAService],
  exports: [ContentProjectService],
})
export class ContentModule {}
