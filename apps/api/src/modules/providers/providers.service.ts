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
        { name: 'OPENAI', displayName: 'OpenAI', type: 'llm', enabled: true },
        { name: 'GEMINI', displayName: 'Google Gemini', type: 'llm', enabled: true },
        { name: 'ANTHROPIC', displayName: 'Anthropic Claude', type: 'llm', enabled: true },
        { name: 'OPENROUTER', displayName: 'OpenRouter', type: 'llm', enabled: true },
        { name: 'ELEVENLABS', displayName: 'ElevenLabs Voice', type: 'voice', enabled: true },
        { name: 'OLLAMA', displayName: 'Ollama Local LLM', type: 'llm', enabled: true },
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

