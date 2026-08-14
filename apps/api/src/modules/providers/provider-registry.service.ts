import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { AICapability } from '@acf/shared';
import { AIProvider } from './interfaces/ai-provider.interface';
import { OpenAIProvider } from './implementations/openai.provider';
import { GeminiProvider } from './implementations/gemini.provider';
import { AnthropicProvider } from './implementations/anthropic.provider';
import { OpenRouterProvider } from './implementations/openrouter.provider';
import { NvidiaProvider } from './implementations/nvidia.provider';
import { OllamaProvider } from './implementations/ollama.provider';

/**
 * ProviderRegistry — Central AI router.
 * 
 * Resolves which provider to use for a given capability by:
 * 1. Checking the DB for a preferred provider for that capability
 * 2. Falling back to first enabled provider that supports it
 * 3. Injecting decrypted API keys into the provider call
 */
@Injectable()
export class ProviderRegistry {
  private readonly logger = new Logger(ProviderRegistry.name);

  private readonly providers: Map<string, AIProvider> = new Map([
    ['OPENAI', new OpenAIProvider()],
    ['GEMINI', new GeminiProvider()],
    ['ANTHROPIC', new AnthropicProvider()],
    ['OPENROUTER', new OpenRouterProvider()],
    ['NVIDIA', new NvidiaProvider()],
    ['OLLAMA', new OllamaProvider()],
  ]);

  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  /**
   * Get the best provider for a capability, with its decrypted API key injected.
   */
  async resolveProvider(capability: AICapability): Promise<{
    provider: AIProvider;
    opts: Record<string, unknown>;
  }> {
    // 1. Find providers that support this capability (ordered by preference)
    const dbProviders = await this.prisma.provider.findMany({
      where: { enabled: true },
      include: {
        apiKeys: {
          where: { isActive: true },
          orderBy: { lastUsedAt: 'asc' },
          take: 1,
        },
      },
    });

    // Sort: preferred-for this capability first
    const sorted = dbProviders.sort((a, b) => {
      const aPreferred = a.preferredFor.includes(capability) ? 1 : 0;
      const bPreferred = b.preferredFor.includes(capability) ? 1 : 0;
      return bPreferred - aPreferred;
    });

    for (const dbProvider of sorted) {
      if (!dbProvider.capabilities.includes(capability)) continue;

      const impl = this.providers.get(dbProvider.name);
      if (!impl) continue;

      const apiKey = dbProvider.apiKeys[0];
      const opts: Record<string, unknown> = { ...(dbProvider.modelConfig as object) };

      if (apiKey) {
        try {
          opts.apiKey = this.crypto.decrypt(apiKey.encryptedKey);
          // Track usage
          await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
          });
        } catch (e) {
          this.logger.warn(`Failed to decrypt API key for ${dbProvider.name}: ${e}`);
        }
      }

      // Environment variable fallback if not set in DB
      if (!opts.apiKey) {
        const envKey = process.env[`${dbProvider.name}_API_KEY`];
        if (envKey) {
          opts.apiKey = envKey;
        }
      }

      if (dbProvider.baseUrl) {
        opts.baseUrl = dbProvider.baseUrl;
      }

      this.logger.debug(`Resolved ${capability} → ${dbProvider.name}`);
      return { provider: impl, opts };
    }

    throw new NotFoundException(
      `No enabled provider found for capability: ${capability}. Enable a provider in Admin → AI Providers.`,
    );
  }

  /**
   * Convenience methods for each capability
   */
  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const { provider, opts } = await this.resolveProvider(AICapability.TEXT);
    return provider.generateText(prompt, { ...opts, systemPrompt } as any);
  }

  async generateImage(prompt: string): Promise<string[]> {
    const { provider, opts } = await this.resolveProvider(AICapability.IMAGE);
    return provider.generateImage(prompt, opts as any);
  }

  async generateSpeech(text: string): Promise<Buffer> {
    const { provider, opts } = await this.resolveProvider(AICapability.SPEECH);
    return provider.generateSpeech(text, opts as any);
  }

  async generateVideo(prompt: string): Promise<string> {
    const { provider, opts } = await this.resolveProvider(AICapability.VIDEO);
    return provider.generateVideo(prompt, opts as any);
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const { provider, opts } = await this.resolveProvider(AICapability.EMBEDDINGS);
    return provider.generateEmbeddings(text, opts as any);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
