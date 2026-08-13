import { Injectable } from '@nestjs/common';
import OpenAI from 'openai'; // NVIDIA NIM is OpenAI-compatible
import { BaseProvider } from '../base/base.provider';
import { TextOptions, EmbeddingOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class NvidiaProvider extends BaseProvider {
  readonly name = 'NVIDIA';
  readonly supportedCapabilities = ['TEXT', 'EMBEDDINGS'];

  private getClient(apiKey: string, baseUrl?: string) {
    return new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://integrate.api.nvidia.com/v1',
    });
  }

  async generateText(
    prompt: string,
    opts: TextOptions & { apiKey: string; baseUrl?: string } = {} as any,
  ): Promise<string> {
    const client = this.getClient((opts as any).apiKey, (opts as any).baseUrl);
    const response = await client.chat.completions.create({
      model: opts.model || 'meta/llama-3.1-70b-instruct',
      messages: [
        ...(opts.systemPrompt ? [{ role: 'system' as const, content: opts.systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature ?? 0.7,
    });
    return response.choices[0]?.message?.content || '';
  }

  async generateEmbeddings(
    text: string,
    opts: EmbeddingOptions & { apiKey: string; baseUrl?: string } = {} as any,
  ): Promise<number[]> {
    const client = this.getClient((opts as any).apiKey, (opts as any).baseUrl);
    const response = await client.embeddings.create({
      model: opts.model || 'nvidia/nv-embedqa-e5-v5',
      input: text,
    });
    return response.data[0].embedding;
  }
}
