import { Global, Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderRouterService } from './provider-registry.service';
import { ProviderDiscoveryService } from './provider-discovery.service';
import { CryptoModule } from '../../common/crypto/crypto.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [CryptoModule, PrismaModule],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    ProviderRouterService,
    ProviderDiscoveryService,
    { provide: 'ProviderRegistry', useExisting: ProviderRouterService },
  ],
  exports: [ProviderRouterService, 'ProviderRegistry', ProvidersService, ProviderDiscoveryService],
})
export class ProvidersModule {}


