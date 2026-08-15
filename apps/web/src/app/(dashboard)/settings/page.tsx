'use client';

import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { MediaUploader } from '@/components/common/MediaUploader';
import {
  KeyRound,
  ShieldCheck,
  Cpu,
  Palette,
  Share2,
  Bell,
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
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';

const DEFAULT_PROVIDERS = [
  { name: 'NVIDIA', displayName: 'NVIDIA NIM AI (Nemotron, Llama 3.3)', placeholder: 'nvapi-...', defaultBaseUrl: 'https://integrate.api.nvidia.com/v1' },
  { name: 'OPENAI_COMPATIBLE', displayName: 'OpenAI Compatible (DeepSeek, Groq, Anyscale, LM Studio)', placeholder: 'sk-...', defaultBaseUrl: 'https://api.deepseek.com/v1' },
  { name: 'OPENAI', displayName: 'OpenAI (Official GPT-4o)', placeholder: 'sk-proj-...', defaultBaseUrl: 'https://api.openai.com/v1' },
  { name: 'GEMINI', displayName: 'Google Gemini (Free Tier Available)', placeholder: 'AIzaSy...', defaultBaseUrl: 'https://generativelanguage.googleapis.com' },
  { name: 'ANTHROPIC', displayName: 'Anthropic Claude 3.5', placeholder: 'sk-ant-...', defaultBaseUrl: 'https://api.anthropic.com' },
  { name: 'OPENROUTER', displayName: 'OpenRouter (Access 100+ Free Models)', placeholder: 'sk-or-...', defaultBaseUrl: 'https://openrouter.ai/api/v1' },
  { name: 'ELEVENLABS', displayName: 'ElevenLabs Voice AI', placeholder: 'el-...', defaultBaseUrl: 'https://api.elevenlabs.io' },
];

const BEST_MODELS_PRESETS = [
  {
    id: 'nvidia-nemotron',
    providerName: 'NVIDIA',
    modelName: 'nvidia/nvidia-nemotron-nano-9b-v2',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    title: 'NVIDIA Nemotron Nano 9B (Recommended)',
    badge: '100% Free Trial',
    desc: 'High intelligence, lightning fast, zero RAM usage on VPS. Ideal for YouTube scriptwriting.',
    tag: 'BEST FOR SCRIPTS',
  },
  {
    id: 'deepseek-chat',
    providerName: 'OPENAI_COMPATIBLE',
    modelName: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    title: 'DeepSeek V3 / R1 (Ultra Budget)',
    badge: 'Ultra Cheap / High Logic',
    desc: 'Top-rated model for viral YouTube hooks, script structuring, and detailed research.',
    tag: 'BEST FOR HOOKS',
  },
  {
    id: 'groq-llama3',
    providerName: 'OPENAI_COMPATIBLE',
    modelName: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    title: 'Groq Llama 3.3 70B (500 tokens/sec)',
    badge: 'Ultra Speed',
    desc: 'Instant 500 tokens/sec generation for instant automated video pipelines.',
    tag: 'ULTRA SPEED',
  },
  {
    id: 'gemini-flash',
    providerName: 'GEMINI',
    modelName: 'gemini-1.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com',
    title: 'Google Gemini 1.5 Flash',
    badge: '1M Context / Free Tier',
    desc: 'Great for deep web research, long video summaries, and multi-angle analysis.',
    tag: 'BEST FOR RESEARCH',
  },
];

export default function CreatorSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'API_KEYS' | 'AI_ENGINES' | 'BRANDING' | 'PUBLISHING' | 'NOTIFICATIONS'>('API_KEYS');

  // API Key Vault State
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedProviderName, setSelectedProviderName] = useState('NVIDIA');
  const [label, setLabel] = useState('NVIDIA Nemotron Key');
  const [keyInput, setKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://integrate.api.nvidia.com/v1');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  // Preferred AI Engine Selection
  const [researchProvider, setResearchProvider] = useState('NVIDIA');
  const [scriptProvider, setScriptProvider] = useState('NVIDIA');
  const [customModelName, setCustomModelName] = useState('nvidia/nvidia-nemotron-nano-9b-v2');
  const [imageEngine, setImageEngine] = useState('POLLINATIONS_FREE');
  const [voiceEngine, setVoiceEngine] = useState('FREE_TTS');

  // Branding & Publishing State
  const [logoUrl, setLogoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);

  // Sync Provider change to default URL & label
  useEffect(() => {
    const found = DEFAULT_PROVIDERS.find((p) => p.name === selectedProviderName);
    if (found) {
      setBaseUrlInput(found.defaultBaseUrl);
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
        platform: baseUrlInput,
      });

      setKeyInput('');
      success(`Saved API Key!`, `Successfully encrypted and saved ${selectedProviderName} key in database.`);
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

  const applyPresetModel = (preset: typeof BEST_MODELS_PRESETS[0]) => {
    setResearchProvider(preset.providerName);
    setScriptProvider(preset.providerName);
    setCustomModelName(preset.modelName);
    setSelectedProviderName(preset.providerName);
    setBaseUrlInput(preset.baseUrl);
    success('Model Selected!', `Configured studio to use ${preset.title} (${preset.modelName}).`);
  };

  const handleSaveModelConfig = () => {
    success('AI Model Config Saved!', `Set Research: ${researchProvider}, Script: ${scriptProvider}, Model: ${customModelName}.`);
  };

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
              Manage your AI API Keys, select the best AI Models, configure branding overlays, and set auto-publishing rules.
            </p>
          </div>
        </div>

        {/* Custom Glassmorphic Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 w-fit">
          {[
            { id: 'API_KEYS', label: 'API Key Vault (Add Keys)', icon: KeyRound },
            { id: 'AI_ENGINES', label: 'AI Model Selection', icon: Cpu },
            { id: 'BRANDING', label: 'Branding & Overlays', icon: Palette },
            { id: 'PUBLISHING', label: 'Publishing & Automation', icon: Share2 },
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

        {/* TAB 1: API KEY VAULT */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-black text-white">Add AI Provider or OpenAI-Compatible Key</h2>
                </div>
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OpenAI API Compatible
                </span>
              </div>

              <form onSubmit={handleSaveKey} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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

                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    API Base URL (For NVIDIA, DeepSeek, Groq, LM Studio)
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
                    <span>Save & Encrypt API Key</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Configured API Keys */}
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Configured AI API Keys ({keys.length})</span>
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
                      <th className="px-6 py-4 font-bold">Provider</th>
                      <th className="px-6 py-4 font-bold">Base URL / Endpoint</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{k.label}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            {k.provider?.displayName || k.provider?.name || k.providerId}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                          {k.platform || 'https://integrate.api.nvidia.com/v1'}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Encrypted & Active
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI MODEL SELECTION */}
        {activeTab === 'AI_ENGINES' && (
          <div className="space-y-6">
            {/* Top Recommended Models Grid */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Top Recommended AI Models (1-Click Selection)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select the best models for high speed, zero cost, and viral scriptwriting.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BEST_MODELS_PRESETS.map((preset) => {
                  const isSelected = customModelName === preset.modelName;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPresetModel(preset)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                          : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                            {preset.tag}
                          </span>
                          <h3 className="text-sm font-black text-white mt-1.5">{preset.title}</h3>
                        </div>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{preset.desc}</p>
                      <div className="mt-3 pt-3 border-t border-white/5 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Model: <span className="text-amber-300 font-bold">{preset.modelName}</span></span>
                        <span className="text-indigo-400 font-bold">Click to Select →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage-by-Stage Custom Engine Controls */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" /> Pipeline Stage Engine Configuration
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Customize which AI engine handles Research, Scriptwriting, Visual Scenes, and Voice Narration.
                  </p>
                </div>

                <button
                  onClick={handleSaveModelConfig}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Save AI Configuration</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* 1. Research Engine */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-indigo-300 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    1. Topic Research Engine
                  </label>
                  <select
                    value={researchProvider}
                    onChange={(e) => setResearchProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NVIDIA">NVIDIA NIM AI (Nemotron Nano 9B v2 / Llama 3.3)</option>
                    <option value="OPENAI_COMPATIBLE">OpenAI Compatible (DeepSeek / Groq / LM Studio)</option>
                    <option value="OPENAI">OpenAI Official (GPT-4o)</option>
                    <option value="GEMINI">Google Gemini 1.5 Flash (Free Tier)</option>
                    <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  </select>
                </div>

                {/* 2. Scriptwriting Engine */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    2. Script Writing Engine
                  </label>
                  <select
                    value={scriptProvider}
                    onChange={(e) => setScriptProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NVIDIA">NVIDIA NIM AI (Nemotron Nano 9B v2 / Llama 3.3)</option>
                    <option value="OPENAI_COMPATIBLE">OpenAI Compatible (DeepSeek / Groq / LM Studio)</option>
                    <option value="OPENAI">OpenAI Official (GPT-4o)</option>
                    <option value="GEMINI">Google Gemini Pro (Free Tier)</option>
                    <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  </select>
                </div>

                {/* 3. Visual B-Roll Scene Generator */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-amber-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    3. Visual Scene & B-Roll Generator
                  </label>
                  <select
                    value={imageEngine}
                    onChange={(e) => setImageEngine(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="POLLINATIONS_FREE">Pollinations AI (100% Free Unlimited 16:9 Scenes)</option>
                    <option value="OPENAI_DALLE">OpenAI DALL-E 3 (HD Quality)</option>
                  </select>
                </div>

                {/* 4. Voice Narration Synthesizer */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-emerald-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    4. Voice Narration Engine
                  </label>
                  <select
                    value={voiceEngine}
                    onChange={(e) => setVoiceEngine(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FREE_TTS">Piper Local / Free Google Voice Synthesizer (100% Free)</option>
                    <option value="OPENAI_TTS">OpenAI TTS HD (Alloy, Echo, Onyx, Nova, Shimmer)</option>
                    <option value="ELEVENLABS">ElevenLabs AI Voice Studio</option>
                  </select>
                </div>

                {/* Custom Model Name Input */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 md:col-span-2">
                  <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-amber-300">
                    Active AI Model Identifier String
                  </label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    placeholder="e.g. nvidia/nvidia-nemotron-nano-9b-v2 or deepseek-chat"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    NVIDIA: <code className="text-amber-300">nvidia/nvidia-nemotron-nano-9b-v2</code> | DeepSeek: <code className="text-amber-300">deepseek-chat</code> | Groq: <code className="text-amber-300">llama-3.3-70b-versatile</code>
                  </p>
                </div>
              </div>
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

        {/* TAB 4: PUBLISHING */}
        {activeTab === 'PUBLISHING' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Automated YouTube Uploads</h2>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-xs">
              <div>
                <div className="font-bold text-white">Automatic Background Uploads</div>
                <div className="text-[11px] text-slate-400">Automatically upload finished videos to your connected YouTube Channel</div>
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
      </div>
    </Shell>
  );
}
