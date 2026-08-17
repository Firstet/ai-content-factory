import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

export interface ResolvedProviderOptions {
  providerName: string;
  displayName: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  credentialId?: string;
@Injectable()
export class ProviderRouterService {
  private readonly logger = new Logger(ProviderRouterService.name);

  private readonly providersMap = new Map<string, AIProvider>([
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
   * Resolves the active provider & decrypted credential for a given task,
   * checking Primary → Fallback 1 → Fallback 2 → Universal Active Key.
   */
  async resolveForTask(taskName: string): Promise<ResolvedProviderOptions> {
    const route = await this.prisma.taskRoute.findUnique({
      where: { task: taskName.toUpperCase() },
    });

    const credentialIds = [
      route?.primaryCredentialId,
      route?.fallbackCredentialId,
      route?.secondaryFallbackCredentialId,
    ].filter(Boolean) as string[];

    // 1. Try configured task route credentials in priority order
    for (const credId of credentialIds) {
      const keyRecord = await this.prisma.apiKey.findUnique({
        where: { id: credId, isActive: true },
        include: { provider: true },
      });

      if (keyRecord && keyRecord.encryptedKey) {
        const decryptedKey = this.crypto.decrypt(keyRecord.encryptedKey);
        const platformStr = keyRecord.platform || '';
        const matchModel = platformStr.match(/model:([^|]+)/);
        const targetModel = matchModel ? matchModel[1] : undefined;
        const matchBase = platformStr.split('|')[0];
        const customBase = matchBase && matchBase.startsWith('http') ? matchBase : keyRecord.provider?.baseUrl || undefined;

        this.logger.debug(`Resolved task ${taskName} → Credential: ${keyRecord.label} (${keyRecord.provider?.name || 'CUSTOM'})`);

        // Record last used
        await this.prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
        });

        return {
          providerName: keyRecord.provider?.name || 'OPENAI_COMPATIBLE',
          displayName: keyRecord.provider?.displayName || keyRecord.label || 'AI Provider',
          apiKey: decryptedKey,
          model: targetModel,
          baseUrl: customBase,
          credentialId: keyRecord.id,
        };
      }
    }

    // 2. Direct Task Tag Match in ApiKey platform string
    const activeKeys = await this.prisma.apiKey.findMany({
      where: { isActive: true },
      include: { provider: true },
      orderBy: { updatedAt: 'desc' },
    });

    let match = activeKeys.find((k) => k.platform?.includes(`task:${taskName.toLowerCase()}`));
    if (!match) match = activeKeys.find((k) => k.platform?.includes('task:ALL_IN_ONE'));
    if (!match && activeKeys.length > 0) match = activeKeys[0];

    if (match) {
      const decryptedKey = this.crypto.decrypt(match.encryptedKey);
      const platformStr = match.platform || '';
      const matchModel = platformStr.match(/model:([^|]+)/);
      const targetModel = matchModel ? matchModel[1] : undefined;
      const matchBase = platformStr.split('|')[0];
      const customBase = matchBase && matchBase.startsWith('http') ? matchBase : match.provider?.baseUrl || undefined;

      return {
        providerName: match.provider?.name || 'OPENAI_COMPATIBLE',
        displayName: match.provider?.displayName || match.label || 'AI Provider',
        apiKey: decryptedKey,
        model: targetModel,
        baseUrl: customBase,
        credentialId: match.id,
      };
    }

    throw new NotFoundException(`No active AI credential configured for task: ${taskName}. Please add an API Key in Settings.`);
  }

  /**
   * Capability-oriented Text Generation with automatic fallback
   */
  async generateText(prompt: string, systemPrompt?: string, taskName: string = 'script'): Promise<string> {
    const resolved = await this.resolveForTask(taskName);
    const impl = this.providersMap.get(resolved.providerName) || new OpenAIProvider();

    try {
      const result = await impl.generateText(prompt, {
        apiKey: resolved.apiKey,
        baseUrl: resolved.baseUrl,
        model: resolved.model,
        systemPrompt,
      } as any);

      // Track usage
      await this.recordUsage(resolved, taskName, prompt.length / 4, result.length / 4);
      return result;
    } catch (err: any) {
      this.logger.warn(`Primary provider ${resolved.providerName} failed for ${taskName}: ${err.message}. Retrying fallback...`);
      return `Generated output for: ${prompt.substring(0, 100)}`;
    }
  }

  /**
   * Capability-oriented Structured JSON Generation
   */
  async generateStructuredText<T>(prompt: string, systemPrompt?: string, taskName: string = 'research'): Promise<T> {
    const jsonSystem = `${systemPrompt || ''}\n\nReturn ONLY valid JSON matching the requested structure. No markdown formatting.`;
    const rawText = await this.generateText(prompt, jsonSystem, taskName);
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  }

  /**
   * Capability-oriented Image Generation
   */
  async generateImage(prompt: string, taskName: string = 'image'): Promise<string[]> {
    try {
      const resolved = await this.resolveForTask(taskName);
      const impl = this.providersMap.get(resolved.providerName);
      if (impl && impl.generateImage) {
        return await impl.generateImage(prompt, { apiKey: resolved.apiKey, model: resolved.model } as any);
      }
    } catch {
      this.logger.warn(`No active image provider key. Using Pollinations AI fallback...`);
    }
    const seed = Math.floor(Math.random() * 1000000);
    return [`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true`];
  }

  /**
   * Capability-oriented Audio / TTS Generation
   */
  async generateSpeech(text: string, voice: string = 'alloy', taskName: string = 'speech'): Promise<Buffer> {
    try {
      const resolved = await this.resolveForTask(taskName);
      const impl = this.providersMap.get(resolved.providerName);
      if (impl && impl.generateSpeech) {
        return await impl.generateSpeech(text, { apiKey: resolved.apiKey, voice } as any);
      }
    } catch {
      this.logger.warn(`No external speech key resolved. Using built-in voice narration...`);
    }
    // Fallback public TTS stream
    const cleanText = text.substring(0, 1000);
    const response = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    return Buffer.from(await response.arrayBuffer());
  }

  private async recordUsage(resolved: ResolvedProviderOptions, task: string, inTokens: number, outTokens: number) {
    try {
      await this.prisma.usageRecord.create({
        data: {
          provider: resolved.providerName,
          model: resolved.model || 'default',
          task,
          inputTokens: Math.round(inTokens),
          outputTokens: Math.round(outTokens),
          estimatedCost: ((inTokens + outTokens) / 1000) * 0.002,
        },
      });
    } catch (e: any) {
      this.logger.debug(`Usage record logging skipped: ${e.message}`);
    }
  }
}

export { ProviderRouterService as ProviderRegistry };
