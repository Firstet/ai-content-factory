// ============================================================
// AI Provider Interface — All providers implement this contract
// ============================================================

export interface TextOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ImageOptions {
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface SpeechOptions {
  model?: string;
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav' | 'opus';
}

export interface VideoOptions {
  model?: string;
  duration?: number;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

/**
 * AIProvider — Base interface every provider must implement.
 * Capabilities are optional; providers that don't support a capability
 * should throw a NotImplementedException with a clear message.
 */
export interface AIProvider {
  readonly name: string;
  readonly supportedCapabilities: string[];

  generateText(prompt: string, opts?: TextOptions): Promise<string>;
  generateImage(prompt: string, opts?: ImageOptions): Promise<string[]>; // returns URLs
  generateSpeech(text: string, opts?: SpeechOptions): Promise<Buffer>;
  generateVideo(prompt: string, opts?: VideoOptions): Promise<string>; // returns URL
  generateEmbeddings(text: string, opts?: EmbeddingOptions): Promise<number[]>;
}
