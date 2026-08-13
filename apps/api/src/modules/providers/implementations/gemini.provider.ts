import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from '../base/base.provider';
import { TextOptions, EmbeddingOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider extends BaseProvider {
  readonly name = 'GEMINI';
  readonly supportedCapabilities = ['TEXT', 'EMBEDDINGS'];

  private getClient(apiKey: string) {
    return new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string, opts: TextOptions & { apiKey: string } = {} as any): Promise<string> {
    const genAI = this.getClient((opts as any).apiKey);
    const model = genAI.getGenerativeModel({
      model: opts.model || 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: opts.maxTokens || 8192,
        temperature: opts.temperature ?? 0.7,
      },
    });

    const fullPrompt = opts.systemPrompt
      ? `${opts.systemPrompt}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }

  async generateEmbeddings(text: string, opts: EmbeddingOptions & { apiKey: string } = {} as any): Promise<number[]> {
    const genAI = this.getClient((opts as any).apiKey);
    const model = genAI.getGenerativeModel({ model: opts.model || 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }
}
