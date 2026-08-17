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

    // Ensure NVIDIA provider and default active API key are present and synchronized
    const nvidiaProvider = await this.prisma.provider.findFirst({ where: { name: 'NVIDIA' } });
    if (nvidiaProvider) {
      const encryptedNvKey = this.crypto.encrypt('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');
      const existingNvKey = await this.prisma.apiKey.findFirst({
        where: { providerId: nvidiaProvider.id },
      });

      let nvApiKeyId = '';

      if (!existingNvKey) {
        const createdKey = await this.prisma.apiKey.create({
          data: {
            providerId: nvidiaProvider.id,
            label: 'NVIDIA NIM Primary Key',
            encryptedKey: encryptedNvKey,
            baseUrl: 'https://integrate.api.nvidia.com/v1',
            platform: 'https://integrate.api.nvidia.com/v1|protocol:openai_compatible',
            keyType: 'api',
            status: 'CONNECTED',
            discoveredModels: ['nvidia/nvidia-nemotron-nano-9b-v2', 'meta/llama-3.3-70b-instruct'],
            discoveredCapabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING'],
            lastTestedAt: new Date(),
          },
        });
        nvApiKeyId = createdKey.id;
        console.log('[ProvidersService] Auto-seeded default NVIDIA API key into database.');
      } else {
        await this.prisma.apiKey.update({
          where: { id: existingNvKey.id },
          data: {
            encryptedKey: encryptedNvKey,
            status: 'CONNECTED',
            baseUrl: 'https://integrate.api.nvidia.com/v1',
            lastTestedAt: new Date(),
          },
        });
        nvApiKeyId = existingNvKey.id;
        console.log('[ProvidersService] Synchronized active NVIDIA API key into database.');
      }

      // Auto-seed default Task Routes for AI Content Operating System
      const defaultTasks = ['RESEARCH', 'SEO_RESEARCH', 'CONTENT_STRATEGY', 'SCRIPTWRITING', 'COPYWRITING'];
      for (const taskName of defaultTasks) {
        await this.prisma.taskRoute.upsert({
          where: { task: taskName },
          update: {
            primaryCredentialId: nvApiKeyId,
            primaryModelId: 'nvidia/nvidia-nemotron-nano-9b-v2',
          },
          create: {
            task: taskName,
            primaryCredentialId: nvApiKeyId,
            primaryModelId: 'nvidia/nvidia-nemotron-nano-9b-v2',
            autoFallbackEnabled: true,
          },
        });
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

  async getTaskRoutes() {
    return this.prisma.taskRoute.findMany({
      orderBy: { task: 'asc' },
    });
  }

  async upsertTaskRoute(data: {
    task: string;
    primaryCredentialId?: string;
    primaryModelId?: string;
    fallbackCredentialId?: string;
    fallbackModelId?: string;
    secondaryFallbackCredentialId?: string;
    secondaryFallbackModelId?: string;
    autoFallbackEnabled?: boolean;
  }) {
    const taskUpper = data.task.toUpperCase();
    return this.prisma.taskRoute.upsert({
      where: { task: taskUpper },
      update: {
        primaryCredentialId: data.primaryCredentialId || null,
        primaryModelId: data.primaryModelId || null,
        fallbackCredentialId: data.fallbackCredentialId || null,
        fallbackModelId: data.fallbackModelId || null,
        secondaryFallbackCredentialId: data.secondaryFallbackCredentialId || null,
        secondaryFallbackModelId: data.secondaryFallbackModelId || null,
        autoFallbackEnabled: data.autoFallbackEnabled ?? true,
      },
      create: {
        task: taskUpper,
        primaryCredentialId: data.primaryCredentialId || null,
        primaryModelId: data.primaryModelId || null,
        fallbackCredentialId: data.fallbackCredentialId || null,
        fallbackModelId: data.fallbackModelId || null,
        secondaryFallbackCredentialId: data.secondaryFallbackCredentialId || null,
        secondaryFallbackModelId: data.secondaryFallbackModelId || null,
        autoFallbackEnabled: data.autoFallbackEnabled ?? true,
      },
    });
  }
}
