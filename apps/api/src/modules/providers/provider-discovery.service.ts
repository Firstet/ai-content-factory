import { Injectable, Logger } from '@nestjs/common';

export interface DiscoveryResult {
  status: 'CONNECTED' | 'CONNECTION_FAILED';
  models: string[];
  capabilities: string[];
  error?: string;
}

@Injectable()
export class ProviderDiscoveryService {
  private readonly logger = new Logger(ProviderDiscoveryService.name);

  /**
   * Tests a provider connection and automatically discovers available models & capabilities.
   */
  async discover(providerName: string, apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const nameUpper = providerName.toUpperCase();

    // 1. Built-in / Free providers (no API key required)
    if (['PIPER_TTS', 'POLLINATIONS_IMAGE', 'POLLINATIONS_VIDEO', 'EDGE_TTS'].includes(nameUpper) || apiKey === 'FREE_LOCAL_ENGINE') {
      let models = ['default'];
      let capabilities = ['TEXT_GENERATION'];

      if (nameUpper === 'PIPER_TTS' || nameUpper === 'EDGE_TTS') {
        models = ['en_US-lessac-medium', 'en_US-amy-medium', 'en_GB-ryan-medium'];
        capabilities = ['TEXT_TO_SPEECH', 'AUDIO_GENERATION'];
      } else if (nameUpper === 'POLLINATIONS_IMAGE') {
        models = ['flux', 'turbo', 'deliberate'];
        capabilities = ['IMAGE_GENERATION'];
      } else if (nameUpper === 'POLLINATIONS_VIDEO') {
        models = ['pollinations-video-v1'];
        capabilities = ['VIDEO_GENERATION'];
      }

      return {
        status: 'CONNECTED',
        models,
        capabilities,
      };
    }

    // 2. OpenAI / NVIDIA / OpenRouter / Ollama / DeepSeek / Anyscale
    const targetUrl = baseUrl || this.getDefaultBaseUrl(nameUpper);

    try {
      if (nameUpper === 'OLLAMA') {
        const res = await fetch(`${targetUrl.replace(/\/+$/, '')}/api/tags`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          const models = (data.models || []).map((m: any) => m.name || m.model);
          return {
            status: 'CONNECTED',
            models: models.length > 0 ? models : ['llama3.1', 'mistral'],
            capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING'],
          };
        }
      }

      // Standard OpenAI-compatible /v1/models check
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      if (nameUpper === 'ANTHROPIC') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      }

      const modelsEndpoint = `${targetUrl.replace(/\/+$/, '')}/models`;
      const res = await fetch(modelsEndpoint, {
        headers,
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = data.data || data.models || [];
        const models = Array.isArray(rawList) ? rawList.map((m: any) => m.id || m.name).slice(0, 30) : [];

        const capabilities = this.detectCapabilities(nameUpper, models);

        return {
          status: 'CONNECTED',
          models: models.length > 0 ? models : [this.getDefaultModel(nameUpper)],
          capabilities,
        };
      } else {
        const errorText = await res.text();
        this.logger.warn(`[EXTERNAL_PROVIDER_HTTP_ERROR] ${nameUpper} responded with HTTP ${res.status}`);
        return {
          status: 'CONNECTION_FAILED',
          models: [this.getDefaultModel(nameUpper)],
          capabilities: this.detectCapabilities(nameUpper, []),
          error: `HTTP ${res.status}: ${errorText.substring(0, 150)}`,
        };
      }
    } catch (err: any) {
      this.logger.error('[EXTERNAL_PROVIDER_FETCH_FAILED]', {
        provider: nameUpper,
        targetUrl,
        errorName: err instanceof Error ? err.name : undefined,
        errorMessage: err instanceof Error ? err.message : undefined,
        cause: err instanceof Error ? (err as any).cause : undefined,
        causeCode: (err as any)?.cause?.code,
        causeAddress: (err as any)?.cause?.address,
        causePort: (err as any)?.cause?.port,
        causeSyscall: (err as any)?.cause?.syscall,
      });

      return {
        status: 'CONNECTION_FAILED',
        models: [this.getDefaultModel(nameUpper)],
        capabilities: this.detectCapabilities(nameUpper, []),
        error: err.name === 'AbortError' || err.name === 'TimeoutError'
          ? 'Connection test timed out after 3s'
          : ((err as any)?.cause?.code ? `${(err as any).cause.code}: ${err.message}` : (err.message || 'Network error / Host unreachable')),
      };
    }
  }

  private getDefaultBaseUrl(providerName: string): string {
    switch (providerName) {
      case 'NVIDIA':
        return 'https://integrate.api.nvidia.com/v1';
      case 'DEEPSEEK':
      case 'OPENAI_COMPATIBLE':
        return 'https://api.deepseek.com/v1';
      case 'OPENAI':
        return 'https://api.openai.com/v1';
      case 'GEMINI':
        return 'https://generativelanguage.googleapis.com';
      case 'ANTHROPIC':
        return 'https://api.anthropic.com';
      case 'OPENROUTER':
        return 'https://openrouter.ai/api/v1';
      case 'OLLAMA':
        return 'http://localhost:11434';
      case 'STABILITY_AI':
        return 'https://api.stability.ai/v1';
      case 'REPLICATE':
        return 'https://api.replicate.com/v1';
      case 'ELEVENLABS':
        return 'https://api.elevenlabs.io/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  public getDefaultModel(providerName: string): string {
    switch (providerName) {
      case 'NVIDIA':
        return 'nvidia/nvidia-nemotron-nano-9b-v2';
      case 'DEEPSEEK':
        return 'deepseek-chat';
      case 'OPENAI':
        return 'gpt-4o';
      case 'GEMINI':
        return 'gemini-1.5-flash';
      case 'ANTHROPIC':
        return 'claude-3-5-sonnet-20241022';
      case 'OPENROUTER':
        return 'meta-llama/llama-3.1-70b-instruct';
      case 'OLLAMA':
        return 'llama3.1';
      case 'STABILITY_AI':
        return 'sd3-medium';
      case 'REPLICATE':
        return 'black-forest-labs/flux-schnell';
      case 'ELEVENLABS':
        return 'eleven_turbo_v2_5';
      default:
        return 'default';
    }
  }

  public detectCapabilities(providerName: string, models: string[]): string[] {
    const caps = ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SEO_RESEARCH', 'SCRIPTWRITING', 'COPYWRITING'];
    if (providerName === 'OPENAI') caps.push('IMAGE_GENERATION', 'TEXT_TO_SPEECH', 'VISION');
    if (providerName === 'GEMINI') caps.push('IMAGE_GENERATION', 'VISION');
    if (providerName === 'STABILITY_AI' || providerName === 'POLLINATIONS_IMAGE') return ['IMAGE_GENERATION'];
    if (providerName === 'RUNWAY_GEN2' || providerName === 'KLING_AI' || providerName === 'LUMA_DREAM_MACHINE' || providerName === 'POLLINATIONS_VIDEO') return ['VIDEO_GENERATION'];
    if (providerName === 'ELEVENLABS' || providerName === 'PIPER_TTS') return ['TEXT_TO_SPEECH', 'AUDIO_GENERATION'];
    return caps;
  }
}
