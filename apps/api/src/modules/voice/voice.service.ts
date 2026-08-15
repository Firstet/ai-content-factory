import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  style: string;
  accent: string;
  provider: 'PIPER' | 'OPENAI' | 'ELEVENLABS';
  sampleText: string;
}

@Injectable()
export class VoiceService {
  private readonly voices: VoiceOption[] = [
    {
      id: 'en_US-lessac-medium',
      name: 'Lessac (Studio Narrator)',
      gender: 'male',
      style: 'Professional & Authoritative',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'Welcome to your AI Content Factory. This is a preview of the Lessac studio voice narration.',
    },
    {
      id: 'en_US-amy-medium',
      name: 'Amy (Friendly Host)',
      gender: 'female',
      style: 'Warm & Engaging',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'Hi everyone! In today’s video, we are exploring 5 incredible AI tools you must try in 2026.',
    },
    {
      id: 'en_US-danny-low',
      name: 'Danny (Deep Cinematic)',
      gender: 'male',
      style: 'Deep & Dramatic',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'Deep in the heart of space, a groundbreaking discovery has transformed humanity forever.',
    },
    {
      id: 'en_GB-alan-low',
      name: 'Alan (British Docu-Narrator)',
      gender: 'male',
      style: 'Documentary & Eloquent',
      accent: 'British English',
      provider: 'PIPER',
      sampleText: 'Remarkable creatures inhabit these ancient forests, adapting to their environment over thousands of years.',
    },
    {
      id: 'en_US-ryan-medium',
      name: 'Ryan (Energetic Tech Host)',
      gender: 'male',
      style: 'High-Energy & Upbeat',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'What is up guys! Today we are testing the fastest GPU cloud servers on the market!',
    },
    {
      id: 'en_US-bryce-medium',
      name: 'Bryce (Conversational Podcaster)',
      gender: 'male',
      style: 'Casual & Conversational',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'Let’s talk about money, productivity, and how AI is changing the creator economy right now.',
    },
    {
      id: 'en_US-kristin-medium',
      name: 'Kristin (Clear News Presenter)',
      gender: 'female',
      style: 'Clear & Professional',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'Here is your daily breakdown of the top business news, market trends, and technological innovations.',
    },
    {
      id: 'en_US-joe-medium',
      name: 'Joe (Storyteller Male)',
      gender: 'male',
      style: 'Storytelling & Expressive',
      accent: 'US English',
      provider: 'PIPER',
      sampleText: 'Legend has it that centuries ago, a secret empire ruled the oceans with unprecedented power.',
    },
    {
      id: 'alloy',
      name: 'OpenAI Alloy',
      gender: 'male',
      style: 'Balanced & Neutral',
      accent: 'US English',
      provider: 'OPENAI',
      sampleText: 'Hello! This is OpenAI Alloy voice synthesis for high fidelity video production.',
    },
    {
      id: 'nova',
      name: 'OpenAI Nova',
      gender: 'female',
      style: 'Energetic & Crisp',
      accent: 'US English',
      provider: 'OPENAI',
      sampleText: 'Welcome back! Let’s dive straight into today’s viral topic and analyze the facts.',
    },
    {
      id: 'onyx',
      name: 'OpenAI Onyx',
      gender: 'male',
      style: 'Deep & Commanding',
      accent: 'US English',
      provider: 'OPENAI',
      sampleText: 'Commanding attention across every frame, this narration delivers maximum impact.',
    },
  ];

  getVoices(): VoiceOption[] {
    return this.voices;
  }

  async generateVoicePreview(voiceId: string, textOverride?: string): Promise<Buffer> {
    const foundVoice = this.voices.find((v) => v.id === voiceId) || this.voices[0];
    const textToSynthesize = textOverride || foundVoice.sampleText;

    // Clean text and encode for synthesis
    const cleanText = textToSynthesize.substring(0, 500);

    // Map gender/accent to Google TTS fallback engine or Piper local engine
    const langCode = voiceId.startsWith('en_GB') ? 'en-gb' : 'en';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText,
    )}&tl=${langCode}&client=tw-ob`;

    try {
      const res = await axios.get(ttsUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      return Buffer.from(res.data);
    } catch (err: any) {
      console.error(`[VoiceService] TTS Preview generation error: ${err.message}`);
      throw new Error(`Failed to generate TTS voice preview: ${err.message}`);
    }
  }
}
