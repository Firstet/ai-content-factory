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

