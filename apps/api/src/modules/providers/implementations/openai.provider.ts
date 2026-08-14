import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { BaseProvider } from '../base/base.provider';
import { TextOptions, ImageOptions, SpeechOptions, EmbeddingOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider extends BaseProvider {
  readonly name = 'OPENAI';
  readonly supportedCapabilities = ['TEXT', 'IMAGE', 'SPEECH', 'EMBEDDINGS'];

  private getClient(apiKey: string) {
    return new OpenAI({ apiKey });
  }

  async generateText(prompt: string, opts: TextOptions & { apiKey: string; model?: string } = {} as any): Promise<string> {
    const client = this.getClient((opts as any).apiKey);
    const response = await client.chat.completions.create({
      model: opts.model || 'gpt-4o',
      messages: [
        ...(opts.systemPrompt ? [{ role: 'system' as const, content: opts.systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature ?? 0.7,
    });
    return response.choices[0]?.message?.content || '';
  }

  async generateImage(prompt: string, opts: ImageOptions & { apiKey: string } = {} as any): Promise<string[]> {
    const client = this.getClient((opts as any).apiKey);
    const response = await client.images.generate({
      model: opts.model || 'dall-e-3',
      prompt,
      size: (opts.size as any) || '1024x1024',
      quality: opts.quality || 'hd',
      n: opts.n || 1,
    });
    return (response.data || []).map((img) => img.url!).filter(Boolean);
  }

  async generateSpeech(text: string, opts: SpeechOptions & { apiKey: string } = {} as any): Promise<Buffer> {
    const client = this.getClient((opts as any).apiKey);
    const mp3 = await client.audio.speech.create({
      model: opts.model || 'tts-1-hd',
      voice: (opts.voice as any) || 'alloy',
      input: text,
      speed: opts.speed || 1.0,
    });
    return Buffer.from(await mp3.arrayBuffer());
  }

  async generateEmbeddings(text: string, opts: EmbeddingOptions & { apiKey: string } = {} as any): Promise<number[]> {
    const client = this.getClient((opts as any).apiKey);
    const response = await client.embeddings.create({
      model: opts.model || 'text-embedding-3-small',
      input: text,
      dimensions: opts.dimensions,
    });
    return response.data[0].embedding;
  }
}
