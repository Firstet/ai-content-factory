import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProvidersService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultProviders();
  }

  async ensureDefaultProviders() {
    const count = await this.prisma.provider.count();
    if (count === 0) {
      const defaultProviders = [
        { name: 'OPENAI', displayName: 'OpenAI (Official)', enabled: true, capabilities: ['llm', 'image', 'voice'], preferredFor: ['llm'] },
        { name: 'OPENAI_COMPATIBLE', displayName: 'OpenAI Compatible (DeepSeek / Groq / Custom API)', enabled: true, capabilities: ['llm'], preferredFor: [] },
        { name: 'GEMINI', displayName: 'Google Gemini', enabled: true, capabilities: ['llm'], preferredFor: ['llm'] },
        { name: 'ANTHROPIC', displayName: 'Anthropic Claude', enabled: true, capabilities: ['llm'], preferredFor: ['llm'] },
        { name: 'OPENROUTER', displayName: 'OpenRouter', enabled: true, capabilities: ['llm'], preferredFor: [] },
        { name: 'ELEVENLABS', displayName: 'ElevenLabs Voice', enabled: true, capabilities: ['voice'], preferredFor: ['voice'] },
        { name: 'OLLAMA', displayName: 'Ollama Local LLM', enabled: true, capabilities: ['llm'], preferredFor: [] },
      ];

      for (const p of defaultProviders) {
        await this.prisma.provider.upsert({
          where: { name: p.name },
          update: {},
          create: p,
        });
      }

      // Auto-seed NVIDIA API Key if ApiKey table is empty
      const keyCount = await this.prisma.apiKey.count();
      if (keyCount === 0) {
        const nvidiaProvider = await this.prisma.provider.findFirst({ where: { name: 'NVIDIA' } });
        if (nvidiaProvider) {
          // Import CryptoService or simple mock encryption for seeding
          const { CryptoService } = await import('../../common/crypto/crypto.service');
          const crypto = new CryptoService();
          await this.prisma.apiKey.create({
            data: {
              providerId: nvidiaProvider.id,
              label: 'NVIDIA NIM Free Trial Key',
              encryptedKey: crypto.encrypt('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'),
              platform: 'https://integrate.api.nvidia.com/v1|model:nvidia/nvidia-nemotron-nano-9b-v2|task:ALL_IN_ONE',
              keyType: 'api',
            },
          });
        }
      }
    }
  }

  async findAll() {
    await this.ensureDefaultProviders();
    return this.prisma.provider.findMany({
      include: { apiKeys: { select: { id: true, label: true, isActive: true, lastUsedAt: true, usageCount: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.provider.findUniqueOrThrow({ where: { id } });
  }

  async toggle(id: string, enabled: boolean) {
    return this.prisma.provider.update({ where: { id }, data: { enabled } });
  }

  async updateConfig(id: string, data: { modelConfig?: object; preferredFor?: string[]; baseUrl?: string }) {
    return this.prisma.provider.update({ where: { id }, data });
  }
}

