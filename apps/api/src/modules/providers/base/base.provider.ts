import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AIProvider,
  TextOptions,
  ImageOptions,
  SpeechOptions,
  VideoOptions,
  EmbeddingOptions,
} from '../interfaces/ai-provider.interface';

/**
 * BaseProvider — Abstract base class with default NotImplemented responses.
 * Concrete providers only override what they support.
 */
@Injectable()
export abstract class BaseProvider implements AIProvider {
  abstract readonly name: string;
  abstract readonly supportedCapabilities: string[];

  async generateText(_prompt: string, _opts?: TextOptions): Promise<string> {
    throw new NotImplementedException(`${this.name} does not support text generation`);
  }

  async generateImage(_prompt: string, _opts?: ImageOptions): Promise<string[]> {
    throw new NotImplementedException(`${this.name} does not support image generation`);
  }

  async generateSpeech(_text: string, _opts?: SpeechOptions): Promise<Buffer> {
    throw new NotImplementedException(`${this.name} does not support speech generation`);
  }

  async generateVideo(_prompt: string, _opts?: VideoOptions): Promise<string> {
    throw new NotImplementedException(`${this.name} does not support video generation`);
  }

  async generateEmbeddings(_text: string, _opts?: EmbeddingOptions): Promise<number[]> {
    throw new NotImplementedException(`${this.name} does not support embeddings`);
  }
}
