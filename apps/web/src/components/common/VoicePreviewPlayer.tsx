'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RefreshCw, Sparkles, CheckCircle2, Music2, Cpu } from 'lucide-react';
import { api } from '@/lib/api';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  style: string;
  accent: string;
  provider: 'PIPER' | 'OPENAI' | 'ELEVENLABS';
  sampleText: string;
}

export const DEFAULT_VOICES: VoiceOption[] = [
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
    name: 'Amy (Enthusiastic Storyteller)',
    gender: 'female',
    style: 'Energetic & Engaging',
    accent: 'US English',
    provider: 'PIPER',
    sampleText: 'Hey everyone! Welcome back to the channel. Today we are exploring ground-breaking AI automation.',
  },
  {
    id: 'en_US-danny-low',
    name: 'Danny (Deep Bass Documentary)',
    gender: 'male',
    style: 'Deep & Cinematic',
    accent: 'US English',
    provider: 'PIPER',
    sampleText: 'In a world driven by artificial intelligence, automated video creation changes everything.',
  },
  {
    id: 'en_GB-alan-low',
    name: 'Alan (British News Anchor)',
    gender: 'male',
    style: 'Formal & News',
    accent: 'British English',
    provider: 'PIPER',
    sampleText: 'Reporting live from the front lines of technology and artificial intelligence innovation.',
  },
  {
    id: 'en_US-ryan-medium',
    name: 'Ryan (Tech Presenter)',
    gender: 'male',
    style: 'Upbeat & Clear',
    accent: 'US English',
    provider: 'PIPER',
    sampleText: 'Check out these top 5 AI tools that will save you hours of work every single week.',
  },
  {
    id: 'en_US-bryce-medium',
    name: 'Bryce (Documentary Narrator)',
    gender: 'male',
    style: 'Calm & Educational',
    accent: 'US English',
    provider: 'PIPER',
    sampleText: 'Deep within the neural networks, complex algorithms process billions of data points in real time.',
  },
  {
    id: 'en_US-kristin-medium',
    name: 'Kristin (Product Reviewer)',
    gender: 'female',
    style: 'Friendly & Articulate',
    accent: 'US English',
    provider: 'PIPER',
    sampleText: 'Here is a comprehensive review of the latest software updates and how to use them effectively.',
  },
  {
    id: 'en_US-joe-medium',
    name: 'Joe (Casual Conversational)',
    gender: 'male',
    style: 'Warm & Natural',
    accent: 'US English',
    provider: 'PIPER',
    sampleText: 'Thanks for tuning in! Don\'t forget to hit that subscribe button for daily tech insights.',
  },
  {
    id: 'alloy',
    name: 'Alloy (OpenAI Neural Voice)',
    gender: 'female',
    style: 'Balanced & Smooth',
    accent: 'US English',
    provider: 'OPENAI',
    sampleText: 'Hello! I am Alloy, an OpenAI neural voice synthesized for high-quality video audio.',
  },
  {
    id: 'nova',
    name: 'Nova (OpenAI Warm Voice)',
    gender: 'female',
    style: 'Lively & Warm',
    accent: 'US English',
    provider: 'OPENAI',
    sampleText: 'Welcome! Nova voice narration brings a warm and human touch to your video stories.',
  },
  {
    id: 'onyx',
    name: 'Onyx (OpenAI Deep Voice)',
    gender: 'male',
    style: 'Deep & Authoritative',
    accent: 'US English',
    provider: 'OPENAI',
    sampleText: 'Onyx delivers deep resonant voiceovers ideal for tech documentaries and tutorials.',
  },
];

interface VoicePreviewPlayerProps {
  selectedVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
  compact?: boolean;
}

export function VoicePreviewPlayer({ selectedVoiceId, onSelectVoice, compact = false }: VoicePreviewPlayerProps) {
  const [voices, setVoices] = useState<VoiceOption[]>(DEFAULT_VOICES);
  const [currentVoiceId, setCurrentVoiceId] = useState<string>(selectedVoiceId || 'en_US-lessac-medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [customText, setCustomText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  useEffect(() => {
    if (selectedVoiceId && selectedVoiceId !== currentVoiceId) {
      setCurrentVoiceId(selectedVoiceId);
    }
  }, [selectedVoiceId]);

  const fetchVoices = async () => {
    try {
      const res = await api.get('/voice/voices');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setVoices(res.data);
      }
    } catch (err) {
      console.warn('Using default studio voices catalog');
    }
  };

  const activeVoice = voices.find((v) => v.id === currentVoiceId) || DEFAULT_VOICES[0];

  const handlePlayPreview = async () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    setLoadingAudio(true);
    const textToRead = customText || activeVoice.sampleText;

    // 1. Try Browser Web Speech API for instant, crystal-clear speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);

        // Customize voice pitch and rate
        if (activeVoice.gender === 'female') {
          utterance.pitch = 1.25;
          utterance.rate = 1.05;
        } else if (activeVoice.id.includes('danny') || activeVoice.id === 'onyx') {
          utterance.pitch = 0.8;
          utterance.rate = 0.95;
        } else {
          utterance.pitch = 1.0;
          utterance.rate = 1.0;
        }

        const browserVoices = window.speechSynthesis.getVoices();
        const matchingVoice = browserVoices.find((v) =>
          activeVoice.accent.includes('British') ? v.lang.startsWith('en-GB') : v.lang.startsWith('en-US')
        );
        if (matchingVoice) utterance.voice = matchingVoice;

        utterance.onstart = () => {
          setLoadingAudio(false);
          setIsPlaying(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (e) => {
          console.warn('[VoicePreview] WebSpeech error, falling back to server stream:', e);
          playServerStreamFallback(textToRead);
        };

        window.speechSynthesis.speak(utterance);
        // Fallback safety timeout if onstart event is delayed
        setTimeout(() => {
          setLoadingAudio(false);
          setIsPlaying(true);
        }, 300);
        return;
      } catch (err) {
        console.warn('[VoicePreview] WebSpeech initialization failed:', err);
      }
    }

    // 2. Fallback to Server Audio Stream Endpoint
    playServerStreamFallback(textToRead);
  };

  const playServerStreamFallback = (textToRead: string) => {
    try {
      const previewUrl = `/api/voice/preview?voiceId=${encodeURIComponent(currentVoiceId)}&text=${encodeURIComponent(
        textToRead,
      )}&t=${Date.now()}`;

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const newAudio = new Audio(previewUrl);
      audioRef.current = newAudio;

      newAudio.oncanplaythrough = () => {
        setLoadingAudio(false);
        newAudio.play().catch(() => setLoadingAudio(false));
        setIsPlaying(true);
      };

      newAudio.onended = () => {
        setIsPlaying(false);
      };

      newAudio.onerror = (e) => {
        console.error('[VoicePreview] Audio stream element error:', e);
        setLoadingAudio(false);
        setIsPlaying(false);
      };

      newAudio.play().then(() => {
        setLoadingAudio(false);
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('[VoicePreview] Autoplay blocked, user interaction required:', e);
        setLoadingAudio(false);
      });
    } catch (err) {
      console.error('[VoicePreview] Failed to initialize audio stream:', err);
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  const handleVoiceChange = (vId: string) => {
    setCurrentVoiceId(vId);
    if (onSelectVoice) onSelectVoice(vId);
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <select
            value={currentVoiceId}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                🎙️ {v.name} ({v.accent})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handlePlayPreview}
          disabled={loadingAudio}
          className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          {loadingAudio ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{isPlaying ? 'Pause' : 'Listen'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-emerald-500/30 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Piper TTS Voice Synthesizer & Studio Voices
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% FREE LOCAL TTS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Select and preview voice narrators for your automated video scripts.
            </p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-1 h-4 bg-emerald-400 animate-pulse rounded-full" />
            <span className="w-1 h-6 bg-emerald-400 animate-pulse delay-75 rounded-full" />
            <span className="w-1 h-3 bg-emerald-400 animate-pulse delay-150 rounded-full" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Voice Selector Dropdown */}
        <div>
          <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Choose Voice Narrator
          </label>
          <select
            value={currentVoiceId}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-extrabold focus:outline-none focus:border-emerald-500"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                🎙️ {v.name} — {v.accent} ({v.style})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Sample Text Input */}
        <div>
          <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Test Custom Narration Phrase
          </label>
          <input
            type="text"
            placeholder={activeVoice.sampleText}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Active Voice Specs Card & Play Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-xs">{activeVoice.name}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {activeVoice.gender.toUpperCase()} • {activeVoice.accent}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 italic">"{customText || activeVoice.sampleText}"</p>
        </div>

        <button
          type="button"
          onClick={handlePlayPreview}
          disabled={loadingAudio}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer w-fit shrink-0"
        >
          {loadingAudio ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing Audio...</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4 text-emerald-200" />
              <span>Pause Voice Preview</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-200" />
              <span>Play Voice Preview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
