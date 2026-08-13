import { Injectable } from '@nestjs/common';
import OpenAI from 'openai'; // OpenRouter is OpenAI-compatible
import { BaseProvider } from '../base/base.provider';
import { TextOptions, ImageOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenRouterProvider extends BaseProvider {
  readonly name = 'OPENROUTER';
  readonly supportedCapabilities = ['TEXT', 'IMAGE'];

  private getClient(apiKey: string) {
    return new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://aicontentfactory.local',
        'X-Title': 'AI Content Factory',
      },
    });
  }

  async generateText(prompt: string, opts: TextOptions & { apiKey: string } = {} as any): Promise<string> {
    const client = this.getClient((opts as any).apiKey);
    const response = await client.chat.completions.create({
      model: opts.model || 'meta-llama/llama-3.1-70b-instruct',
      messages: [
        ...(opts.systemPrompt ? [{ role: 'system' as const, content: opts.systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature ?? 0.7,
    });
    return response.choices[0]?.message?.content || '';
  }
}
