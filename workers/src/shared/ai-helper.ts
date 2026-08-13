// ============================================================
// AI Helper — Provider-agnostic text/image/speech calling
// Used by all workers without importing NestJS modules
// ============================================================
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callTextProvider(
  providerName: string,
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  model?: string,
): Promise<string> {
  switch (providerName) {
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
    case 'OPENROUTER':
    case 'NVIDIA': {
      const baseURL = providerName === 'OPENROUTER'
        ? 'https://openrouter.ai/api/v1'
        : 'https://integrate.api.nvidia.com/v1';
      const client = new OpenAI({ apiKey, baseURL });
      const res = await client.chat.completions.create({
        model: model || (providerName === 'OPENROUTER' ? 'meta-llama/llama-3.1-70b-instruct' : 'meta/llama-3.1-70b-instruct'),
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: 4096,
      });
      return res.choices[0]?.message?.content || '';
    }
    case 'OLLAMA': {
      const baseUrl = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';
      const client = new OpenAI({ apiKey: 'ollama', baseURL: `${baseUrl}/v1` });
      const res = await client.chat.completions.create({
        model: model || 'llama3.1',
        messages: [{ role: 'user' as const, content: prompt }],
      });
      return res.choices[0]?.message?.content || '';
    }
    default:
      throw new Error(`Unknown AI provider: ${providerName}`);
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
    return res.data.map(d => d.url!).filter(Boolean);
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
