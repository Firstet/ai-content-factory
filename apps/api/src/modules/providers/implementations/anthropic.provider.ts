import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from '../base/base.provider';
import { TextOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class AnthropicProvider extends BaseProvider {
  readonly name = 'ANTHROPIC';
  readonly supportedCapabilities = ['TEXT'];

  async generateText(prompt: string, opts: TextOptions & { apiKey: string } = {} as any): Promise<string> {
    const client = new Anthropic({ apiKey: (opts as any).apiKey });
    const response = await client.messages.create({
      model: opts.model || 'claude-3-5-sonnet-20241022',
      max_tokens: opts.maxTokens || 8096,
      system: opts.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });
    return (response.content[0] as any).text || '';
  }
}
