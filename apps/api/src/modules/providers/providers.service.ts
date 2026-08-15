import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';

@Injectable()
export class ProvidersService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultProviders();
  }

  async ensureDefaultProviders() {
    const defaultProviders = [
      { name: 'NVIDIA', displayName: 'NVIDIA NIM AI (Nemotron)', enabled: true, capabilities: ['llm', 'vision', 'text'], preferredFor: ['script', 'research'] },
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
        update: { enabled: true },
        create: p,
      });
    }

    // Auto-seed default NVIDIA API Key if no keys exist in ApiKey table
    const keyCount = await this.prisma.apiKey.count();
    if (keyCount === 0) {
      const nvidiaProvider = await this.prisma.provider.findFirst({ where: { name: 'NVIDIA' } });
      if (nvidiaProvider) {
        await this.prisma.apiKey.create({
          data: {
            providerId: nvidiaProvider.id,
            label: 'NVIDIA NIM Free Trial Key',
            encryptedKey: this.crypto.encrypt('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'),
            platform: 'https://integrate.api.nvidia.com/v1|model:nvidia/nvidia-nemotron-nano-9b-v2|task:ALL_IN_ONE',
            keyType: 'api',
          },
        });
        console.log('[ProvidersService] Auto-seeded default NVIDIA API key into database.');
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

