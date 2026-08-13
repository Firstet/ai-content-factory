import { Global, Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderRegistry } from './provider-registry.service';
import { CryptoModule } from '../../common/crypto/crypto.module';

@Global()
@Module({
  imports: [CryptoModule],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProviderRegistry],
  exports: [ProviderRegistry, ProvidersService],
})
export class ProvidersModule {}
