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
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  RefreshCw,
  Sliders,
  Eye,
} from 'lucide-react';
import { VoicePreviewPlayer } from './VoicePreviewPlayer';

export interface SceneItem {
  id?: string;
  title?: string;
  narration?: string;
  content?: string;
  visualPrompt?: string;
  imageUrl?: string;
  timestamp?: string;
  durationSeconds?: number;
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
  onSaveScenes?: (updatedScenes: SceneItem[]) => void;
}

function getPollinationsUrl(prompt: string, seed = Math.floor(Math.random() * 899999) + 100000) {
  const clean = encodeURIComponent(prompt || 'cinematic HD video scene');
  return `https://image.pollinations.ai/prompt/${clean}?width=1280&height=720&seed=${seed}&nologo=true`;
}

const DEFAULT_SCENES: SceneItem[] = [
  {
    id: 's-1',
    title: 'Hook / Scene 1',
    content: 'Did you know AI can generate an entire YouTube video in under 60 seconds?',
    visualPrompt: 'Futuristic AI neural network glowing in 8k cinematic lighting, 16:9',
    imageUrl: getPollinationsUrl('Futuristic AI neural network glowing in 8k cinematic lighting, 16:9', 91823),
    timestamp: '00:00 - 00:05',
    durationSeconds: 5,
  },
  {
    id: 's-2',
    title: 'Body / Scene 2',
    content: 'Step 1 is automated trend research. The system scrapes top viral hooks across YouTube and TikTok.',
    visualPrompt: 'High tech dashboard analyzing data graphs and trending viral video keywords, 16:9',
    imageUrl: getPollinationsUrl('High tech dashboard analyzing data graphs and trending viral video keywords, 16:9', 42312),
    timestamp: '00:05 - 00:15',
    durationSeconds: 10,
  },
  {
    id: 's-3',
    title: 'Body / Scene 3',
    content: 'Next, the Piper TTS voice synthesizer generates crystal-clear narration synchronized with Pollinations AI B-Roll.',
    visualPrompt: 'Audio soundwave equalizer synthesizer with vibrant neon gradients, 16:9',
    imageUrl: getPollinationsUrl('Audio soundwave equalizer synthesizer with vibrant neon gradients, 16:9', 88472),
    timestamp: '00:15 - 00:30',
    durationSeconds: 15,
  },
  {
    id: 's-4',
    title: 'Call to Action / Scene 4',
    content: 'Subscribe to AI Content Factory today and automate your content pipeline on autopilot!',
    visualPrompt: 'Glowing subscribe button with sparkling particles background, 16:9',
    imageUrl: getPollinationsUrl('Glowing subscribe button with sparkling particles background, 16:9', 19482),
    timestamp: '00:30 - 00:45',
    durationSeconds: 15,
  },
];

export function ContentPreviewModal({
  isOpen,
  onClose,
  title,
  scriptText,
  scenes = [],
  videoUrl,
  audioUrl,
  niche = 'Tech & AI',
  onSaveScenes,
}: ContentPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'EDITOR'>('PREVIEW');
  const [sceneList, setSceneList] = useState<SceneItem[]>(() => {
    const raw = scenes.length > 0 ? scenes : DEFAULT_SCENES;
    return raw.map((s, idx) => {
      const isUnsplash = !s.imageUrl || s.imageUrl.includes('unsplash');
      const seed = 100000 + idx * 777;
      return {
        ...s,
        imageUrl: isUnsplash ? getPollinationsUrl(s.visualPrompt || s.title || 'cinematic video scene', seed) : s.imageUrl,
      };
    });
  });
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const currentScene = sceneList[activeSceneIndex] || sceneList[0] || DEFAULT_SCENES[0];

  // TTS Voiceover Narration Speech Handler
  function handleSpeakSceneNarration(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  // Regenerate all scene visuals with Pollinations AI
  function handleRegenerateAllVisuals() {
    setIsRegenerating(true);
    setTimeout(() => {
      const seedBase = Math.floor(Math.random() * 900000);
      const updated = sceneList.map((scene, idx) => ({
        ...scene,
        imageUrl: getPollinationsUrl(scene.visualPrompt || scene.title || 'cinematic video scene', seedBase + idx * 123),
      }));
      setSceneList(updated);
      setIsRegenerating(false);
      onSaveScenes?.(updated);
    }, 800);
  }

  // Helper functions for Scene Editor
  function handleSceneTextChange(index: number, newText: string) {
    const updated = [...sceneList];
    updated[index] = { ...updated[index], content: newText, narration: newText };
    setSceneList(updated);
    onSaveScenes?.(updated);
  }

  function handleVisualPromptChange(index: number, newPrompt: string) {
    const updated = [...sceneList];
    updated[index] = { ...updated[index], visualPrompt: newPrompt };
    setSceneList(updated);
    onSaveScenes?.(updated);
  }

  function handleDurationChange(index: number, newSecs: number) {
    const updated = [...sceneList];
    updated[index] = { ...updated[index], durationSeconds: Math.max(1, newSecs) };
    setSceneList(updated);
    onSaveScenes?.(updated);
  }

  function handleMoveSceneUp(index: number) {
    if (index === 0) return;
    const updated = [...sceneList];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSceneList(updated);
    setActiveSceneIndex(index - 1);
    onSaveScenes?.(updated);
  }

  function handleMoveSceneDown(index: number) {
    if (index === sceneList.length - 1) return;
    const updated = [...sceneList];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSceneList(updated);
    setActiveSceneIndex(index + 1);
    onSaveScenes?.(updated);
  }

  function handleDeleteScene(index: number) {
    if (sceneList.length <= 1) return;
    const updated = sceneList.filter((_, i) => i !== index);
    setSceneList(updated);
    setActiveSceneIndex(Math.max(0, index - 1));
    onSaveScenes?.(updated);
  }

  function handleAddScene() {
    const newIdx = sceneList.length + 1;
    const prompt = `Cinematic ${niche} scene ${newIdx}, 8k highly detailed, 16:9`;
    const newScene: SceneItem = {
      id: `s-${Date.now()}`,
      title: `Scene ${newIdx}`,
      content: 'Enter scene narration text here...',
      visualPrompt: prompt,
      imageUrl: getPollinationsUrl(prompt, Math.floor(Math.random() * 800000)),
      timestamp: `00:${newIdx * 10 - 10} - 00:${newIdx * 10}`,
      durationSeconds: 10,
    };
    const updated = [...sceneList, newScene];
    setSceneList(updated);
    setActiveSceneIndex(updated.length - 1);
    onSaveScenes?.(updated);
  }

  function handleRegenerateSceneVisual(index: number) {
    setIsRegenerating(true);
    const scene = sceneList[index];
    const seed = Math.floor(Math.random() * 1000000);
    const newImageUrl = getPollinationsUrl(scene.visualPrompt || scene.title || 'cinematic video scene', seed);

    setTimeout(() => {
      const updated = [...sceneList];
      updated[index] = { ...updated[index], imageUrl: newImageUrl };
      setSceneList(updated);
      setIsRegenerating(false);
      onSaveScenes?.(updated);
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  STUDIO v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Category: {niche} • {sceneList.length} Scenes Total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Mode Switcher */}
            <div className="p-1 rounded-xl bg-slate-950 border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('PREVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'PREVIEW'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Mode
              </button>
              <button
                onClick={() => setActiveTab('EDITOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'EDITOR'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Timeline & Segment Editor ({sceneList.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'PREVIEW' ? (
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-white/20 text-white font-extrabold text-xs sm:text-sm shadow-xl max-w-xl">
                          <span>"{currentScene.content || currentScene.narration}"</span>
                          <button
                            onClick={() => handleSpeakSceneNarration(currentScene.content || currentScene.narration || '')}
                            title="Listen to AI Voice Narration for this Scene"
                            className="shrink-0 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/30"
                          >
                            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-amber-300' : ''}`} />
                          </button>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-2">
                          <span>Duration: {currentScene.durationSeconds || 10}s</span>
                          <span>•</span>
                          <span>Scene {activeSceneIndex + 1} of {sceneList.length}</span>
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                        <div className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-extrabold text-amber-300 flex items-center gap-1.5 pointer-events-auto">
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          Pollinations AI Visual & Piper Audio Sync
                        </div>

                        <button
                          onClick={handleRegenerateAllVisuals}
                          disabled={isRegenerating}
                          className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-indigo-500/40 hover:bg-indigo-600/40 text-[10px] font-extrabold text-indigo-300 flex items-center gap-1.5 pointer-events-auto transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                          Regenerate Scene B-Rolls
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Scene Timeline Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Select Video Scene to Preview
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRegenerateAllVisuals}
                        disabled={isRegenerating}
                        className="text-[11px] font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                        Refresh All B-Rolls
                      </button>
                      <button
                        onClick={() => setActiveTab('EDITOR')}
                        className="text-[11px] font-extrabold text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Scenes
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {sceneList.map((scene, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSceneIndex(idx)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          activeSceneIndex === idx
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="font-extrabold text-[11px] truncate">{scene.title || `Scene ${idx + 1}`}</div>
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
                      {sceneList.reduce((acc, s) => acc + (s.content?.length || 0), 0)} Words
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {sceneList.map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          activeSceneIndex === idx
                            ? 'bg-purple-950/40 border-purple-500/50 text-white'
                            : 'bg-slate-900/40 border-white/5 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-purple-300 uppercase tracking-wider mb-1 flex justify-between">
                          <span>{s.title || `Scene ${idx + 1}`}</span>
                          <span className="font-mono">{s.durationSeconds || 10}s</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{s.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: TIMELINE & SEGMENT EDITOR PANEL */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Interactive Timeline & Segment Editor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cut out unwanted scenes, edit narration text, adjust scene duration, reorder segments, or regenerate B-roll images.
                  </p>
                </div>

                <button
                  onClick={handleAddScene}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add New Scene Segment
                </button>
              </div>

              {/* Segment Cards List */}
              <div className="space-y-4">
                {sceneList.map((scene, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      activeSceneIndex === idx
                        ? 'bg-slate-950/90 border-indigo-500/60 shadow-xl shadow-indigo-500/10'
                        : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Left Scene Visual Thumbnail */}
                      <div className="w-full md:w-48 shrink-0 space-y-2">
                        <div className="relative aspect-video rounded-xl bg-slate-900 border border-white/10 overflow-hidden group">
                          <img
                            src={scene.imageUrl}
                            alt="Scene B-Roll"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRegenerateSceneVisual(idx)}
                            disabled={isRegenerating}
                            title="Regenerate Pollinations AI B-Roll Visual"
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-white"
                          >
                            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                          </button>
                        </div>

                        <button
                          onClick={() => handleRegenerateSceneVisual(idx)}
                          disabled={isRegenerating}
                          className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-extrabold text-slate-300 border border-white/10 flex items-center justify-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 text-indigo-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                          Regenerate Visual
                        </button>
                      </div>

                      {/* Right Scene Form Fields */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Scene #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={scene.title || `Scene ${idx + 1}`}
                              onChange={(e) => {
                                const updated = [...sceneList];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setSceneList(updated);
                              }}
                              className="bg-transparent text-xs font-black text-white focus:outline-none border-b border-dashed border-white/20 focus:border-indigo-400 px-1 py-0.5"
                            />
                          </div>

                          {/* Reorder & Delete Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveSceneUp(idx)}
                              disabled={idx === 0}
                              title="Move Scene Up"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveSceneDown(idx)}
                              disabled={idx === sceneList.length - 1}
                              title="Move Scene Down"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteScene(idx)}
                              disabled={sceneList.length <= 1}
                              title="Cut / Delete Scene"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Narration Script Input */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                            Voiceover Narration Script
                          </label>
                          <textarea
                            rows={2}
                            value={scene.content || scene.narration || ''}
                            onChange={(e) => handleSceneTextChange(idx, e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Narration script for this scene..."
                          />
                        </div>

                        {/* Visual Prompt Input & Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                              AI B-Roll / Image Prompt
                            </label>
                            <input
                              type="text"
                              value={scene.visualPrompt || ''}
                              onChange={(e) => handleVisualPromptChange(idx, e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                              placeholder="Visual scene prompt..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                              Duration (Seconds)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={120}
                              value={scene.durationSeconds || 10}
                              onChange={(e) => handleDurationChange(idx, parseInt(e.target.value) || 5)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Total Duration: {sceneList.reduce((acc, s) => acc + (s.durationSeconds || 10), 0)}s • {sceneList.length} Scenes Configured
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'EDITOR' && (
              <button
                onClick={() => {
                  onSaveScenes?.(sceneList);
                  setActiveTab('PREVIEW');
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-500/20"
              >
                Save & Preview Video
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs transition-all cursor-pointer"
            >
              Close Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

