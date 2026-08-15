'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Film,
  Volume2,
  FileText,
  Sparkles,
  Share2,
  Download,
  Tv,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { VoicePreviewPlayer } from './VoicePreviewPlayer';

interface SceneItem {
  id?: string;
  title?: string;
  narration?: string;
  content?: string;
  visualPrompt?: string;
  imageUrl?: string;
  timestamp?: string;
}

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scriptText?: string;
  scenes?: SceneItem[];
  videoUrl?: string;
  audioUrl?: string;
  niche?: string;
}

export function ContentPreviewModal({
  isOpen,
  onClose,
  title,
  scriptText,
  scenes = [],
  videoUrl,
  audioUrl,
  niche = 'Tech & AI',
}: ContentPreviewModalProps) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!isOpen) return null;

  const mockScenes: SceneItem[] =
    scenes.length > 0
      ? scenes
      : [
          {
            title: 'Hook / Scene 1',
            content: 'Did you know AI can generate an entire YouTube video in under 60 seconds?',
            visualPrompt: 'Futuristic AI neural network glowing in 8k cinematic lighting',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            timestamp: '00:00 - 00:05',
          },
          {
            title: 'Body / Scene 2',
            content: 'Step 1 is automated trend research. The system scrapes top viral hooks across YouTube and TikTok.',
            visualPrompt: 'High tech dashboard analyzing data graphs and trending keywords',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            timestamp: '00:05 - 00:15',
          },
          {
            title: 'Body / Scene 3',
            content: 'Next, the Piper TTS voice synthesizer generates crystal-clear narration synchronized with Pollinations AI B-Roll.',
            visualPrompt: 'Audio soundwave equalizer with vibrant neon gradients',
            imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
            timestamp: '00:15 - 00:30',
          },
          {
            title: 'Call to Action / Scene 4',
            content: 'Subscribe to AI Content Factory today and automate your content pipeline on autopilot!',
            visualPrompt: 'Glowing subscribe button with sparkling particles background',
            imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
            timestamp: '00:30 - 00:45',
          },
        ];

  const currentScene = mockScenes[activeSceneIndex] || mockScenes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  STUDIO PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Category: {niche} • In-App Video & Subtitle Teleprompter Preview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Video & Teleprompter Player */}
            <div className="lg:col-span-2 space-y-4">
              {/* 16:9 Video Canvas Box */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-white/10 group shadow-2xl">
                {videoUrl ? (
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <>
                    <img
                      src={currentScene.imageUrl}
                      alt="Scene Visual"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Subtitle Teleprompter Overlay */}
                    <div className="absolute bottom-6 inset-x-6 text-center space-y-2">
                      <div className="inline-block px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white font-extrabold text-xs sm:text-sm shadow-xl max-w-xl">
                        "{currentScene.content || currentScene.narration}"
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {currentScene.timestamp} • Scene {activeSceneIndex + 1} of {mockScenes.length}
                      </div>
                    </div>

                    {/* Play Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-extrabold text-amber-300 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                      Visual & Audio Sync Ready
                    </div>
                  </>
                )}
              </div>

              {/* Scene Timeline Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Select Video Scene to Preview
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {mockScenes.map((scene, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSceneIndex(idx)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeSceneIndex === idx
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="font-extrabold text-[11px] truncate">{scene.title}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">{scene.content}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Voice Narration & Script Details */}
            <div className="space-y-4">
              {/* Voice Preview Player */}
              <VoicePreviewPlayer compact={true} />

              {/* Full Teleprompter Script Card */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Teleprompter Narration Script
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {mockScenes.reduce((acc, s) => acc + (s.content?.length || 0), 0)} Words
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {mockScenes.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all ${
                        activeSceneIndex === idx
                          ? 'bg-purple-950/40 border-purple-500/50 text-white'
                          : 'bg-slate-900/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-[10px] text-purple-300 uppercase tracking-wider mb-1">
                        {s.title}
                      </div>
                      <p className="text-[11px] leading-relaxed">{s.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Verified Ready for YouTube, Instagram Reels & TikTok Upload
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs transition-all cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
