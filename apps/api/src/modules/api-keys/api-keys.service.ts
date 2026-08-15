import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

@Injectable()
export class ApiKeysService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  /**
   * Store an API key — encrypts before writing to DB.
   * The raw key is NEVER returned after creation.
   */
  async create(dto: CreateApiKeyDto) {
    try {
      const encryptedKey = this.crypto.encrypt(dto.key);

      // Safe provider lookup preventing invalid UUID cast errors in PostgreSQL
      const providerName = dto.providerId.toUpperCase();
      let provider = await this.prisma.provider.findFirst({
        where: isUuid(dto.providerId)
          ? { OR: [{ id: dto.providerId }, { name: providerName }] }
          : { name: providerName },
      });

      if (!provider) {
        provider = await this.prisma.provider.create({
          data: {
            name: providerName,
            displayName: dto.providerId,
            enabled: true,
            capabilities: ['llm', 'text'],
            preferredFor: ['script', 'research'],
          },
        });
      }

      const apiKey = await this.prisma.apiKey.create({
        data: {
          providerId: provider.id,
          label: dto.label,
          encryptedKey,
          platform: dto.platform,
          keyType: dto.keyType || 'api',
        },
        select: { id: true, label: true, providerId: true, isActive: true, createdAt: true },
      });

      return { ...apiKey, message: 'API key stored securely.' };
    } catch (err: any) {
      console.error('[ApiKeysService] Error creating API key:', err);
      throw new BadRequestException(`Failed to save API key: ${err.message || 'Database error'}`);
    }
  }

  async findAll(providerId?: string) {
    return this.prisma.apiKey.findMany({
      where: providerId ? (isUuid(providerId) ? { providerId } : { provider: { name: providerId.toUpperCase() } }) : {},
      select: {
        id: true,
        label: true,
        providerId: true,
        platform: true,
        keyType: true,
        isActive: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        provider: { select: { name: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(id: string, isActive: boolean) {
    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  async delete(id: string) {
    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key deleted' };
  }

  /**
   * Decrypt and return a key — for internal use by workers only.
   * Should NEVER be exposed via REST endpoint.
   */
  async getDecryptedKey(id: string): Promise<string> {
    const record = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`API key ${id} not found`);
    return this.crypto.decrypt(record.encryptedKey);
  }
}
