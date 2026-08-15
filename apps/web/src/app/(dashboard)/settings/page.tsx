'use client';

import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { MediaUploader } from '@/components/common/MediaUploader';
import {
  KeyRound,
  ShieldCheck,
  Palette,
  Share2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  Lock,
  Zap,
  Radio,
  Image as ImageIcon,
  Volume2,
  Check,
  Sliders,
  Tv,
  Film,
  Camera,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';

const DEFAULT_PROVIDERS = [
  {
    name: 'NVIDIA',
    displayName: 'NVIDIA NIM AI (Nemotron, Llama 3.3)',
    placeholder: 'nvapi-...',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'nvidia/nvidia-nemotron-nano-9b-v2',
    task: 'TEXT_RESEARCH_SCRIPT',
  },
  {
    name: 'OPENAI_COMPATIBLE',
    displayName: 'OpenAI Compatible (DeepSeek, Groq, Anyscale, LM Studio)',
    placeholder: 'sk-...',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    task: 'TEXT_RESEARCH_SCRIPT',
  },
  {
    name: 'OPENAI',
    displayName: 'OpenAI (Official GPT-4o, DALL-E 3, TTS)',
    placeholder: 'sk-proj-...',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    task: 'ALL_IN_ONE',
  },
  {
    name: 'GEMINI',
    displayName: 'Google Gemini (Free Tier Available)',
    placeholder: 'AIzaSy...',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-1.5-flash',
    task: 'TEXT_RESEARCH_SCRIPT',
  },
  {
    name: 'ANTHROPIC',
    displayName: 'Anthropic Claude 3.5 Sonnet',
    placeholder: 'sk-ant-...',
    defaultBaseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    task: 'TEXT_RESEARCH_SCRIPT',
  },
  {
    name: 'OPENROUTER',
    displayName: 'OpenRouter (Access 100+ Free Models)',
    placeholder: 'sk-or-...',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-70b-instruct',
    task: 'TEXT_RESEARCH_SCRIPT',
  },
  {
    name: 'ELEVENLABS',
    displayName: 'ElevenLabs Voice AI Studio',
    placeholder: 'el-...',
    defaultBaseUrl: 'https://api.elevenlabs.io',
    defaultModel: 'eleven_multilingual_v2',
    task: 'VOICE_TTS',
  },
];

export default function CreatorSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'API_KEYS' | 'BRANDING' | 'PUBLISHING'>('API_KEYS');

  // API Key Vault State
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedProviderName, setSelectedProviderName] = useState('NVIDIA');
  const [label, setLabel] = useState('NVIDIA Nemotron Key');
  const [keyInput, setKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://integrate.api.nvidia.com/v1');
  const [assignedTask, setAssignedTask] = useState('TEXT_RESEARCH_SCRIPT');
  const [modelNameInput, setModelNameInput] = useState('nvidia/nvidia-nemotron-nano-9b-v2');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  // Platform Content Ratios
  const [videoRatio, setVideoRatio] = useState(80);
  const [postsPerWeek, setPostsPerWeek] = useState(7);
  const [autoPublish, setAutoPublish] = useState(true);

  // Branding State
  const [logoUrl, setLogoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');

  // Sync Provider change to default URL, model, and label
  useEffect(() => {
    const found = DEFAULT_PROVIDERS.find((p) => p.name === selectedProviderName);
    if (found) {
      setBaseUrlInput(found.defaultBaseUrl);
      setModelNameInput(found.defaultModel);
      setAssignedTask(found.task);
      setLabel(`${found.displayName.split(' ')[0]} Key`);
    }
  }, [selectedProviderName]);

  // Load Configured Keys on Mount
  useEffect(() => {
    loadKeyVault();
  }, []);

  const loadKeyVault = async () => {
    try {
      const res = await api.get('/api-keys');
      setKeys(res.data || []);
    } catch (err: any) {
      console.error('Failed to load API keys:', err);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput) return;
    setSavingKey(true);
    try {
      await api.post('/api-keys', {
        providerId: selectedProviderName,
        label: label || `${selectedProviderName} Key`,
        key: keyInput,
        platform: `${baseUrlInput}|model:${modelNameInput}|task:${assignedTask}`,
      });

      setKeyInput('');
      success(`Saved API Key & Model!`, `Successfully saved ${selectedProviderName} (${modelNameInput}) key in database.`);
      loadKeyVault();
    } catch (err: any) {
      let errorMsg = 'Failed to save API key. Please check network connection.';
      if (err.response?.data?.message) {
        errorMsg = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(', ')
          : err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      error('API Key Save Failed', errorMsg);
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await api.delete(`/api-keys/${id}`);
      success('API Key Deleted', 'Key has been removed from database.');
      loadKeyVault();
    } catch (err: any) {
      error('Delete Failed', 'Failed to delete API key.');
    }
  };

  const getTaskBadge = (platformStr: string) => {
    if (platformStr?.includes('task:VOICE_TTS')) {
      return { text: '🔊 Voice Narration', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (platformStr?.includes('task:IMAGE_GENERATION')) {
      return { text: '🎨 Image B-Roll', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (platformStr?.includes('task:ALL_IN_ONE')) {
      return { text: '🚀 All-In-One', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    return { text: '📝 Research & Script', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  };

  const getModelName = (platformStr: string) => {
    if (!platformStr) return 'default';
    const match = platformStr.match(/model:([^|]+)/);
    return match ? match[1] : platformStr.split('|')[0];
  };

  const getBaseUrlOnly = (platformStr: string) => {
    if (!platformStr) return 'https://integrate.api.nvidia.com/v1';
    return platformStr.split('|')[0];
  };

  const weeklyVideos = Math.round((postsPerWeek * videoRatio) / 100);
  const weeklyImages = postsPerWeek - weeklyVideos;

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight">Studio Settings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PERSONAL STUDIO V2.0
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Add your AI API Keys, assign models directly per key, and configure social media post proportions.
            </p>
          </div>
        </div>

        {/* Custom Glassmorphic Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 w-fit">
          {[
            { id: 'API_KEYS', label: 'API Keys & Model Vault', icon: KeyRound },
            { id: 'PUBLISHING', label: 'Publishing & Content Ratios', icon: Share2 },
            { id: 'BRANDING', label: 'Branding & Overlays', icon: Palette },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: API KEYS & MODEL VAULT (UNIFIED AS REQUESTED) */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-black text-white">Add AI Provider API Key & Assign Model</h2>
                </div>
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OpenAI API Compatible
                </span>
              </div>

              <form onSubmit={handleSaveKey} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Provider Selection */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Select AI Provider Type</label>
                  <select
                    value={selectedProviderName}
                    onChange={(e) => setSelectedProviderName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DEFAULT_PROVIDERS.map((p) => (
                      <option key={p.name} value={p.name}>{p.displayName}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned Task */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Select What This Key Does</label>
                  <select
                    value={assignedTask}
                    onChange={(e) => setAssignedTask(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TEXT_RESEARCH_SCRIPT">📝 Research & Content Writing (Text LLM)</option>
                    <option value="IMAGE_GENERATION">🎨 Visual Scene & Image B-Roll Generation</option>
                    <option value="VOICE_TTS">🔊 Voice Narration Synthesizer (TTS)</option>
                    <option value="ALL_IN_ONE">🚀 All-In-One (Research, Script, Images, Voice)</option>
                  </select>
                </div>

                {/* Key Label */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Key Label</label>
                  <input
                    type="text"
                    placeholder="e.g. NVIDIA Nemotron Key / DeepSeek Key"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Model Name */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Model Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. nvidia/nvidia-nemotron-nano-9b-v2 or deepseek-chat"
                    value={modelNameInput}
                    onChange={(e) => setModelNameInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* API Base URL */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    API Base URL Endpoint
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://integrate.api.nvidia.com/v1"
                    value={baseUrlInput}
                    onChange={(e) => setBaseUrlInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    NVIDIA: https://integrate.api.nvidia.com/v1 | DeepSeek: https://api.deepseek.com/v1 | Groq: https://api.groq.com/openai/v1
                  </p>
                </div>

                {/* Key String */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">API Key String</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder={DEFAULT_PROVIDERS.find((p) => p.name === selectedProviderName)?.placeholder || 'Enter API Key (e.g. nvapi-...)'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingKey || !keyInput}
                    className="py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Save Key & Assign Model</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Configured API Keys with Task Badges */}
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Configured AI API Keys & Models ({keys.length})</span>
                <span className="text-[11px] text-slate-400 font-normal lowercase">Keys are securely stored and encrypted in PostgreSQL</span>
              </div>
              {keys.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <KeyRound className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No API keys added yet. Add your NVIDIA NIM, OpenAI, DeepSeek, or Gemini key above!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Label</th>
                      <th className="px-6 py-4 font-bold">Assigned Task</th>
                      <th className="px-6 py-4 font-bold">Model ID</th>
                      <th className="px-6 py-4 font-bold">Base Endpoint</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {keys.map((k) => {
                      const badge = getTaskBadge(k.platform);
                      const modelName = getModelName(k.platform);
                      const baseUrl = getBaseUrlOnly(k.platform);
                      return (
                        <tr key={k.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            <div>{k.label}</div>
                            <div className="text-[10px] text-indigo-400 font-mono">
                              {k.provider?.displayName || k.provider?.name || k.providerId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${badge.bg}`}>
                              {badge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-amber-300 font-bold">
                            {modelName}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                            {baseUrl}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Encrypted
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteKey(k.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete Key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PUBLISHING & SOCIAL CONTENT RATIOS (YOUTUBE VS INSTAGRAM/TIKTOK/FACEBOOK) */}
        {activeTab === 'PUBLISHING' && (
          <div className="space-y-6">
            {/* Social Platform Content Mix & Ratio Controller */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" /> Social Media Platform Post Ratio Matrix
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    YouTube is 100% Video. For Instagram, TikTok, and Facebook, configure the proportion of Video vs. Photo/Carousel posts.
                  </p>
                </div>

                <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AUTOMATED RATIO ENGINE
                </span>
              </div>

              {/* Platform Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* YouTube Channel (100% Video Fixed) */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm">YouTube Channel</h3>
                        <span className="text-[10px] text-slate-400">Long-form Videos & Shorts</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                      100% VIDEO
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-red-400" /> Dedicated Video Platform
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      All generated YouTube posts are rendered as 16:9 HD long-form videos or 9:16 Shorts automatically.
                    </p>
                  </div>
                </div>

                {/* Instagram / TikTok / Facebook Ratio Controller */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm">Instagram, TikTok & Facebook</h3>
                        <span className="text-[10px] text-slate-400">Multi-Format Content Mix</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      DYNAMIC RATIO
                    </span>
                  </div>

                  {/* Interactive Sliders */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="text-indigo-300 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-indigo-400" /> Video Posts: {videoRatio}%
                      </span>
                      <span className="text-amber-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-400" /> Photo Posts: {100 - videoRatio}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="10"
                      value={videoRatio}
                      onChange={(e) => setVideoRatio(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>More Photos (10% Video)</span>
                      <span>Balanced (50/50)</span>
                      <span>More Videos (90% Video)</span>
                    </div>
                  </div>
                </div>

                {/* Posts Per Week Schedule Calculator */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">Automated Weekly Schedule Calculation</h4>
                      <p className="text-[11px] text-slate-400">Set total posts per week to auto-calculate Video vs Photo production count.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Posts / Week:</span>
                      <select
                        value={postsPerWeek}
                        onChange={(e) => setPostsPerWeek(parseInt(e.target.value))}
                        className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value={3}>3 Posts / Week</option>
                        <option value={5}>5 Posts / Week</option>
                        <option value={7}>7 Posts / Week (Daily)</option>
                        <option value={14}>14 Posts / Week (2x Daily)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculated Result Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-950 border border-indigo-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-white text-xs">
                          Weekly Production Plan: {weeklyVideos} Videos & {weeklyImages} Photo Carousels
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Studio will automatically schedule {weeklyVideos} video pipeline jobs and {weeklyImages} photo post jobs every 7 days.
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                      Auto-Shift Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Publish Toggle */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center justify-between shadow-2xl">
              <div>
                <div className="font-bold text-white text-xs">Automatic Background Uploads</div>
                <div className="text-[11px] text-slate-400">Automatically publish rendered content to your connected channels based on ratio rules</div>
              </div>
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
              />
            </div>
          </div>
        )}

        {/* TAB 3: BRANDING */}
        {activeTab === 'BRANDING' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Brand Assets & Video Watermark Overlays</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <MediaUploader
                label="Brand Logo Image"
                accept="image/*"
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                helperText="Upload PNG or JPG logo"
              />
              <MediaUploader
                label="Watermark Overlay Image"
                accept="image/*"
                value={watermarkUrl}
                onChange={(url) => setWatermarkUrl(url)}
                helperText="Upload transparent PNG watermark"
              />
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
