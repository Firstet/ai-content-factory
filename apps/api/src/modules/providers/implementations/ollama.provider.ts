import { Injectable } from '@nestjs/common';
import OpenAI from 'openai'; // Ollama has OpenAI-compatible API
import { BaseProvider } from '../base/base.provider';
import { TextOptions, EmbeddingOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class OllamaProvider extends BaseProvider {
  readonly name = 'OLLAMA';
  readonly supportedCapabilities = ['TEXT', 'EMBEDDINGS'];

  private getClient(baseUrl: string) {
    return new OpenAI({
      apiKey: 'ollama', // required but not used
      baseURL: `${baseUrl}/v1`,
    });
  }

  async generateText(
    prompt: string,
    opts: TextOptions & { baseUrl?: string } = {} as any,
  ): Promise<string> {
    const baseUrl = (opts as any).baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const client = this.getClient(baseUrl);
    const response = await client.chat.completions.create({
      model: opts.model || 'llama3.1',
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
    opts: EmbeddingOptions & { baseUrl?: string } = {} as any,
  ): Promise<number[]> {
    const baseUrl = (opts as any).baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const client = this.getClient(baseUrl);
    const response = await client.embeddings.create({
      model: opts.model || 'nomic-embed-text',
      input: text,
    });
    return response.data[0].embedding;
  }
}
