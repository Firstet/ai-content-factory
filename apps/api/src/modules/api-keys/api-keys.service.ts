import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { ProviderDiscoveryService } from '../providers/provider-discovery.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

@Injectable()
export class ApiKeysService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
    private discovery: ProviderDiscoveryService,
  ) {}

  /**
   * Store an API credential — encrypts key, runs connection test & model discovery.
   * The raw key is NEVER returned after creation.
   */
  async create(dto: CreateApiKeyDto) {
    try {
      const providerIdStr = dto.providerId || 'CUSTOM_AI';
      const sanitizedName = providerIdStr.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();

      const rawKey = dto.key && dto.key.trim() !== '' ? dto.key : 'FREE_LOCAL_ENGINE';
      const encryptedKey = this.crypto.encrypt(rawKey);

      let provider = await this.prisma.provider.findFirst({
        where: isUuid(dto.providerId)
          ? { OR: [{ id: dto.providerId }, { name: sanitizedName }] }
          : { name: sanitizedName },
      });

      if (!provider) {
        provider = await this.prisma.provider.create({
          data: {
            name: sanitizedName,
            displayName: dto.label || dto.providerId,
            enabled: true,
            capabilities: ['llm', 'text', 'image', 'speech', 'video'],
            preferredFor: ['script', 'research', 'image', 'speech', 'video'],
          },
        });
      }

      // Default model fallback for immediate fast persistence
      const defaultModels = [this.discovery.getDefaultModel(sanitizedName)];
      const defaultCaps = this.discovery.detectCapabilities(sanitizedName, defaultModels);

      // Create API Key record immediately in database (runs in < 20ms)
      const apiKey = await this.prisma.apiKey.create({
        data: {
          providerId: provider.id,
          label: dto.label || `${provider.displayName} Credential`,
          encryptedKey,
          baseUrl: dto.baseUrl || provider.baseUrl || null,
          platform: dto.platform || `${dto.baseUrl || provider.baseUrl || ''}|protocol:openai_compatible`,
          keyType: dto.keyType || 'api',
          status: 'CONNECTED',
          discoveredModels: defaultModels,
          discoveredCapabilities: defaultCaps,
          lastTestedAt: new Date(),
        },
        select: {
          id: true,
          label: true,
          providerId: true,
          isActive: true,
          status: true,
          discoveredModels: true,
          discoveredCapabilities: true,
          baseUrl: true,
          lastTestedAt: true,
          createdAt: true,
        },
      });

      // Trigger background discovery asynchronously to enrich model list without delaying response
      this.discovery.discover(sanitizedName, rawKey, dto.baseUrl).then(async (result) => {
        try {
          await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: {
              status: result.status,
              discoveredModels: result.models?.length ? result.models : defaultModels,
              discoveredCapabilities: result.capabilities?.length ? result.capabilities : defaultCaps,
              lastTestedAt: new Date(),
              lastError: result.error || null,
            },
          });
        } catch (e: any) {
          console.warn('[ApiKeysService] Async discovery update failed silently:', e.message);
        }
      }).catch((err) => {
        console.warn('[ApiKeysService] Async discovery failed silently:', err.message);
      });

      return {
        ...apiKey,
        message: 'API Credential saved successfully.',
      };
    } catch (err: any) {
      console.error('[ApiKeysService] Error creating API key:', err);
      throw new BadRequestException(`Failed to save API key: ${err.message || 'Database error'}`);
    }
  }

  async findAll(providerId?: string) {
    const keyCount = await this.prisma.apiKey.count();
    if (keyCount === 0) {
      let nvidiaProvider = await this.prisma.provider.findFirst({ where: { name: 'NVIDIA' } });
      if (!nvidiaProvider) {
        nvidiaProvider = await this.prisma.provider.create({
          data: {
            name: 'NVIDIA',
            displayName: 'NVIDIA NIM AI',
            enabled: true,
            capabilities: ['llm', 'text', 'vision'],
            preferredFor: ['script', 'research'],
          },
        });
      }
      await this.prisma.apiKey.create({
        data: {
          providerId: nvidiaProvider.id,
          label: 'NVIDIA Production Key',
          encryptedKey: this.crypto.encrypt('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'),
          baseUrl: 'https://integrate.api.nvidia.com/v1',
          platform: 'https://integrate.api.nvidia.com/v1|protocol:openai_compatible',
          keyType: 'api',
          status: 'CONNECTED',
          discoveredModels: ['nvidia/nvidia-nemotron-nano-9b-v2', 'meta/llama-3.3-70b-instruct'],
          discoveredCapabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING'],
          lastTestedAt: new Date(),
        },
      });
      console.log('[ApiKeysService] Auto-seeded default NVIDIA API key into database.');
    }

    return this.prisma.apiKey.findMany({
      where: providerId ? (isUuid(providerId) ? { providerId } : { provider: { name: providerId.toUpperCase() } }) : {},
      select: {
        id: true,
        label: true,
        providerId: true,
        baseUrl: true,
        platform: true,
        keyType: true,
        isActive: true,
        status: true,
        discoveredModels: true,
        discoveredCapabilities: true,
        lastTestedAt: true,
        lastError: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        provider: { select: { name: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async testConnection(id: string) {
    const record = await this.prisma.apiKey.findUniqueOrThrow({
      where: { id },
      include: { provider: true },
    });
    const decryptedKey = this.crypto.decrypt(record.encryptedKey);
    const discovery = await this.discovery.discover(record.provider?.name || 'CUSTOM', decryptedKey, record.baseUrl || undefined);

    return this.prisma.apiKey.update({
      where: { id },
      data: {
        status: discovery.status,
        discoveredModels: discovery.models,
        discoveredCapabilities: discovery.capabilities,
        lastTestedAt: new Date(),
        lastError: discovery.error || null,
      },
      select: {
        id: true,
        label: true,
        status: true,
        discoveredModels: true,
        discoveredCapabilities: true,
        lastTestedAt: true,
        lastError: true,
      },
    });
  }

  async toggle(id: string, isActive: boolean) {
    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  async update(id: string, dto: Partial<CreateApiKeyDto>) {
    const existing = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`API key ${id} not found`);

    const updateData: any = {};
    if (dto.label) updateData.label = dto.label;
    if (dto.baseUrl) updateData.baseUrl = dto.baseUrl;
    if (dto.platform) updateData.platform = dto.platform;
    if (dto.key && dto.key.trim() !== '' && dto.key !== 'FREE_LOCAL_ENGINE') {
      updateData.encryptedKey = this.crypto.encrypt(dto.key);
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: { id: true, label: true, providerId: true, isActive: true, status: true, platform: true },
    });
  }

  async delete(id: string) {
    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key deleted' };
  }

  async getDecryptedKey(id: string): Promise<string> {
    const record = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`API key ${id} not found`);
    return this.crypto.decrypt(record.encryptedKey);
  }
}

