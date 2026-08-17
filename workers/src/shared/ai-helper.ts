// ============================================================
// AI Helper — Provider-agnostic text/image/speech calling
// Used by all workers without importing NestJS modules
// ============================================================
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CryptoService } from './crypto-helper';

export interface ResolvedTaskKey {
  providerName: string;
  displayName: string;
  apiKey: string;
  model?: string;
  customBaseURL?: string;
}

/**
 * Dynamically resolves the active API Key & Provider configured for a specific pipeline task.
 * 
 * Lookup Order:
 * 1. ApiKey explicitly assigned with `task:${taskName}` in platform field.
 * 2. ApiKey assigned with `task:ALL_IN_ONE`.
 * 3. Provider enabled with `preferredFor` or `capabilities` containing `${taskName}`.
 * 4. Fallback to first active key.
 */
export async function resolveKeyForTask(
  prismaClient: any,
  taskName: string,
): Promise<ResolvedTaskKey | null> {
  try {
    const allActiveKeys = await prismaClient.apiKey.findMany({
      where: { isActive: true },
      include: { provider: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!allActiveKeys || allActiveKeys.length === 0) {
      return null;
    }

    // 1. Direct task match: e.g. "task:script" or "task:image"
    let match = allActiveKeys.find((k: any) => k.platform?.includes(`task:${taskName}`));

    // 2. Master Key match: "task:ALL_IN_ONE"
    if (!match) {
      match = allActiveKeys.find((k: any) => k.platform?.includes('task:ALL_IN_ONE'));
    }

    // 3. Provider Preferred / Capability match
    if (!match) {
      match = allActiveKeys.find((k: any) => {
        const p = k.provider;
        if (!p || !p.enabled) return false;
        return p.preferredFor?.includes(taskName) || p.capabilities?.includes(taskName);
      });
    }

    // 4. Any Active Key Fallback
    if (!match) {
      match = allActiveKeys[0];
    }

    const decryptedKey = CryptoService.decrypt(match.encryptedKey);

    // Parse platform metadata: "https://...|model:xyz|task:abc"
    const platformStr = match.platform || '';
    const matchModel = platformStr.match(/model:([^|]+)/);
    const targetModel = matchModel ? matchModel[1] : undefined;

    const matchBase = platformStr.split('|')[0];
    const customBaseURL = matchBase && matchBase.startsWith('http') ? matchBase : match.provider?.baseUrl || undefined;

    return {
      providerName: match.provider?.name || 'CUSTOM_AI',
      displayName: match.provider?.displayName || match.label || 'AI Provider',
      apiKey: decryptedKey,
      model: targetModel,
      customBaseURL,
    };
  } catch (err: any) {
    console.error(`[resolveKeyForTask] Error resolving key for task ${taskName}:`, err.message);
    return null;
  }
}

export async function callTextProvider(
  providerName: string,
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  model?: string,
  customBaseURL?: string,
): Promise<string> {
  const upperProvider = providerName.toUpperCase();

  switch (upperProvider) {
    case 'OPENAI': {
      const client = new OpenAI({ apiKey });
      const res = await client.chat.completions.create({
        model: model || 'gpt-4o',
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: 8192,
        temperature: 0.7,
      });
      return res.choices[0]?.message?.content || '';
    }
    case 'ANTHROPIC': {
      const client = new Anthropic({ apiKey });
      const res = await client.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 8096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      return (res.content[0] as any).text || '';
    }
    case 'GEMINI': {
      const genAI = new GoogleGenerativeAI(apiKey);
      const m = genAI.getGenerativeModel({ model: model || 'gemini-1.5-pro' });
      const res = await m.generateContent(systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt);
      return res.response.text();
    }
    case 'NVIDIA':
    case 'OPENAI_COMPATIBLE':
    case 'OPENROUTER': {
      const defaultBase = upperProvider === 'NVIDIA'
        ? 'https://integrate.api.nvidia.com/v1'
        : upperProvider === 'OPENROUTER'
        ? 'https://openrouter.ai/api/v1'
        : 'https://api.deepseek.com/v1';

      const baseURL = customBaseURL || defaultBase;
      const defaultModel = upperProvider === 'NVIDIA'
        ? 'nvidia/nvidia-nemotron-nano-9b-v2'
        : upperProvider === 'OPENROUTER'
        ? 'meta-llama/llama-3.1-70b-instruct'
        : 'deepseek-chat';

      const client = new OpenAI({ apiKey, baseURL });
      const res = await client.chat.completions.create({
        model: model || defaultModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: 4096,
      });
      return res.choices[0]?.message?.content || '';
    }
    case 'OLLAMA': {
      const baseUrl = customBaseURL || process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';
      const client = new OpenAI({ apiKey: 'ollama', baseURL: `${baseUrl}/v1` });
      const res = await client.chat.completions.create({
        model: model || 'llama3.1',
        messages: [{ role: 'user' as const, content: prompt }],
      });
      return res.choices[0]?.message?.content || '';
    }
    default: {
      // Fallback for any generic OpenAI compatible provider
      const client = new OpenAI({ apiKey, baseURL: customBaseURL || 'https://api.openai.com/v1' });
      const res = await client.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
      });
      return res.choices[0]?.message?.content || '';
    }
  }
}

export async function callImageProvider(
  providerName: string,
  apiKey: string,
  prompt: string,
  model?: string,
): Promise<string[]> {
  if (providerName === 'OPENAI') {
    const client = new OpenAI({ apiKey });
    const res = await client.images.generate({
      model: model || 'dall-e-3',
      prompt,
      size: '1792x1024',
      quality: 'hd',
      n: 1,
    });
    return (res.data || []).map(d => d.url!).filter(Boolean);
  }
  throw new Error(`Image generation not supported for ${providerName}`);
}

export async function callSpeechProvider(
  providerName: string,
  apiKey: string,
  text: string,
  voice?: string,
): Promise<Buffer> {
  if (providerName === 'OPENAI') {
    const client = new OpenAI({ apiKey });
    const res = await client.audio.speech.create({
      model: 'tts-1-hd',
      voice: (voice as any) || 'alloy',
      input: text,
    });
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Speech generation not supported for ${providerName}`);
}

