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
  Search,
  FileText,
  Video,
  Tags,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';
import { VoicePreviewPlayer } from '@/components/common/VoicePreviewPlayer';
import { ContentPreviewModal } from '@/components/common/ContentPreviewModal';

const DEFAULT_PROVIDERS = [
  {
    name: 'NVIDIA',
    displayName: 'NVIDIA NIM AI (Nemotron, Llama 3.3)',
    placeholder: 'nvapi-...',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'nvidia/nvidia-nemotron-nano-9b-v2',
    task: 'ALL_IN_ONE',
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
  const [activeTab, setActiveTab] = useState<'API_KEYS' | 'TASK_ASSIGNMENTS' | 'PUBLISHING' | 'BRANDING'>('API_KEYS');

  // API Key Vault & Provider State
  const [keys, setKeys] = useState<any[]>([]);
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedProviderName, setSelectedProviderName] = useState('NVIDIA');
  const [label, setLabel] = useState('NVIDIA NIM Key');
  const [keyInput, setKeyInput] = useState('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');
  const [baseUrlInput, setBaseUrlInput] = useState('https://integrate.api.nvidia.com/v1');
  const [assignedTask, setAssignedTask] = useState('ALL_IN_ONE');
  const [modelNameInput, setModelNameInput] = useState('nvidia/nvidia-nemotron-nano-9b-v2');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  // Platform Content Ratios
  const [videoRatio, setVideoRatio] = useState(80);
  const [postsPerWeek, setPostsPerWeek] = useState(7);
  const [autoPublish, setAutoPublish] = useState(true);

  // Task Mappings State
  const [taskAssignments, setTaskAssignments] = useState({
    research: { keyId: '', model: 'nvidia/nvidia-nemotron-nano-9b-v2' },
    scriptwriting: { keyId: '', model: 'nvidia/nvidia-nemotron-nano-9b-v2' },
    broll: { keyId: 'POLLINATIONS_FREE', model: 'pollinations-flux-16:9' },
    thumbnails: { keyId: 'POLLINATIONS_FREE', model: 'pollinations-flux-16:9' },
    voice: { keyId: 'PIPER_FREE', model: 'piper-studio-tts' },
    seo: { keyId: '', model: 'nvidia/nvidia-nemotron-nano-9b-v2' },
  });

  // Branding State
  const [logoUrl, setLogoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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

  // Load Configured Keys & Providers on Mount
  useEffect(() => {
    loadKeyVault();
  }, []);

  const loadKeyVault = async () => {
    setLoadingKeys(true);
    try {
      const [keysRes, provRes] = await Promise.all([
        api.get('/api-keys').catch(() => ({ data: [] })),
        api.get('/providers').catch(() => ({ data: [] })),
      ]);

      const fetchedKeys = keysRes.data || [];
      const fetchedProviders = provRes.data || [];
      setKeys(fetchedKeys);
      setDbProviders(fetchedProviders);

      // If user has saved keys, auto-assign first key to unassigned tasks
      if (fetchedKeys.length > 0) {
        const firstKeyId = fetchedKeys[0].id;
        const firstModel = getModelName(fetchedKeys[0].platform);
        setTaskAssignments((prev) => ({
          ...prev,
          research: { keyId: prev.research.keyId || firstKeyId, model: prev.research.model || firstModel },
          scriptwriting: { keyId: prev.scriptwriting.keyId || firstKeyId, model: prev.scriptwriting.model || firstModel },
          seo: { keyId: prev.seo.keyId || firstKeyId, model: prev.seo.model || firstModel },
        }));
      }
    } catch (err: any) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoadingKeys(false);
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
    if (!platformStr) return 'nvidia/nvidia-nemotron-nano-9b-v2';
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
              Manage your AI API Keys, assign specialized tasks to keys & models, and configure content distribution ratios.
            </p>
          </div>

          <button
            onClick={loadKeyVault}
            className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingKeys ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Active Keys
          </button>
        </div>

        {/* Global Active AI Capabilities Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  System AI Capabilities Overview
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {keys.length > 0 ? `${keys.length} API KEY(S) ACTIVE` : 'FREE ENGINE READY'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Every pipeline phase is linked to an API Key or Free Fallback Engine.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('TASK_ASSIGNMENTS')}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-extrabold text-xs transition-all flex items-center gap-1.5 w-fit"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              View Task Mappings
            </button>
          </div>

          {/* Capability Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Search className="w-3 h-3 text-indigo-400" /> Research
              </div>
              <div className="font-bold text-emerald-400 text-[11px] truncate">
                {keys.length > 0 ? keys[0].provider?.displayName?.split(' ')[0] || 'NVIDIA NIM' : 'Free Trial'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-purple-400" /> Scriptwriting
              </div>
              <div className="font-bold text-emerald-400 text-[11px] truncate">
                {keys.length > 0 ? getModelName(keys[0].platform) : 'Nemotron 9B'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Video className="w-3 h-3 text-amber-400" /> B-Roll & Visuals
              </div>
              <div className="font-bold text-amber-300 text-[11px] truncate">
                Pollinations AI (Free)
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-rose-400" /> Thumbnails
              </div>
              <div className="font-bold text-amber-300 text-[11px] truncate">
                Pollinations AI (Free)
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" /> Voice Narrator
              </div>
              <div className="font-bold text-emerald-300 text-[11px] truncate">
                Piper TTS (Free)
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Tags className="w-3 h-3 text-cyan-400" /> Captions & SEO
              </div>
              <div className="font-bold text-emerald-400 text-[11px] truncate">
                {keys.length > 0 ? getModelName(keys[0].platform) : 'Nemotron 9B'}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Glassmorphic Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 w-fit">
          {[
            { id: 'API_KEYS', label: 'API Keys & Vault', icon: KeyRound },
            { id: 'TASK_ASSIGNMENTS', label: 'Task & Model Assignments', icon: Zap },
            { id: 'PUBLISHING', label: 'Publishing & Ratios', icon: Share2 },
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

        {/* TAB 1: API KEYS & VAULT */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-6">
            {/* Added & Supported AI Providers Catalog */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Added & Supported AI Providers ({dbProviders.length || DEFAULT_PROVIDERS.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Operational status of all AI text, image, and voice providers integrated into your Studio.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AUTO-DETECTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {(dbProviders.length > 0 ? dbProviders : DEFAULT_PROVIDERS).map((p) => {
                  const pName = p.name || p.displayName;
                  const matchingKeys = keys.filter(
                    (k) => k.provider?.name === p.name || k.providerId === p.name || k.providerId === p.id
                  );
                  const isNvidia = pName.includes('NVIDIA');
                  const isFreeEngine = pName.includes('Pollinations') || pName.includes('Piper') || pName.includes('Ollama');
                  const isSelected = selectedProviderName === p.name;

                  return (
                    <div
                      key={p.id || p.name}
                      onClick={() => setSelectedProviderName(p.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-xs truncate max-w-[130px]">
                          {p.displayName || p.name}
                        </span>
                        {matchingKeys.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {matchingKeys.length} KEY ACTIVE
                          </span>
                        ) : isFreeEngine || isNvidia ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            100% FREE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            READY TO ADD
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {p.defaultBaseUrl || p.baseUrl || 'https://integrate.api.nvidia.com/v1'}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                        <span className="text-slate-400 font-bold">
                          {p.capabilities ? p.capabilities.join(' • ') : 'LLM • Text'}
                        </span>
                        <span className="text-indigo-400 font-bold group-hover:underline">
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add API Key Form */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-black text-white">Add AI Provider API Key & Target Model</h2>
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
                    <option value="ALL_IN_ONE">🚀 All-In-One (Research, Script, Images, Voice, SEO)</option>
                    <option value="TEXT_RESEARCH_SCRIPT">📝 Research & Content Writing (Text LLM)</option>
                    <option value="IMAGE_GENERATION">🎨 Visual Scene & Image B-Roll Generation</option>
                    <option value="VOICE_TTS">🔊 Voice Narration Synthesizer (TTS)</option>
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
                <span className="text-[11px] text-slate-400 font-normal lowercase">Keys are securely encrypted in PostgreSQL database</span>
              </div>
              {keys.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-3">
                  <KeyRound className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No custom API keys saved yet. Using 100% Free Pollinations & Piper Engines automatically.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Label</th>
                      <th className="px-6 py-4 font-bold">Assigned Capability</th>
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
                            Active & Ready
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

        {/* TAB 2: TASK & MODEL ASSIGNMENTS GRID */}
        {activeTab === 'TASK_ASSIGNMENTS' && (
          <div className="space-y-6">
            {/* Live Voice Synthesizer & Voice Previewer */}
            <VoicePreviewPlayer
              selectedVoiceId={taskAssignments.voice.model || 'en_US-lessac-medium'}
              onSelectVoice={(vId) => setTaskAssignments((p) => ({ ...p, voice: { ...p.voice, model: vId } }))}
            />

            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> Task-to-Key & Model Mapping Grid
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Specify exactly which API Key and Model handles each phase of your automated video production.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-extrabold text-xs transition-all flex items-center gap-1.5 w-fit"
                >
                  <Film className="w-4 h-4 text-amber-300" />
                  Test Video & Content Previewer
                </button>
              </div>

              {/* 6 Specialized Task Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* 1. Research */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">1. Content & Topic Research</h3>
                        <span className="text-[10px] text-slate-400">Scrapes trends, extracts viral hooks</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned API Key</label>
                      <select
                        value={taskAssignments.research.keyId}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, research: { ...p.research, keyId: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        {keys.length > 0 ? (
                          keys.map((k) => (
                            <option key={k.id} value={k.id}>{k.label} ({k.provider?.displayName || k.providerId})</option>
                          ))
                        ) : (
                          <option value="NVIDIA_DEFAULT">NVIDIA NIM AI (Free Trial)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Model Identifier</label>
                      <input
                        type="text"
                        value={taskAssignments.research.model}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, research: { ...p.research, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Scriptwriting */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">2. Script & Teleprompter Engine</h3>
                        <span className="text-[10px] text-slate-400">Generates full video narration scripts</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned API Key</label>
                      <select
                        value={taskAssignments.scriptwriting.keyId}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, scriptwriting: { ...p.scriptwriting, keyId: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        {keys.length > 0 ? (
                          keys.map((k) => (
                            <option key={k.id} value={k.id}>{k.label} ({k.provider?.displayName || k.providerId})</option>
                          ))
                        ) : (
                          <option value="NVIDIA_DEFAULT">NVIDIA NIM AI (Free Trial)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Model Identifier</label>
                      <input
                        type="text"
                        value={taskAssignments.scriptwriting.model}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, scriptwriting: { ...p.scriptwriting, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. B-Roll & Visuals */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">3. B-Roll & Scene Visual Generator</h3>
                        <span className="text-[10px] text-slate-400">Creates 16:9 cinematic video segment visuals</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      FREE ENGINE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned Visual Provider</label>
                      <select
                        value={taskAssignments.broll.keyId}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, broll: { ...p.broll, keyId: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="POLLINATIONS_FREE">✨ Pollinations AI (100% Free Unlimited HD)</option>
                        <option value="OPENAI_DALLE3">OpenAI DALL-E 3 (Paid Key)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Visual Model</label>
                      <input
                        type="text"
                        value={taskAssignments.broll.model}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, broll: { ...p.broll, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Thumbnails */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">4. Cover Thumbnails & Photo Posts</h3>
                        <span className="text-[10px] text-slate-400">Generates high-CTR cover graphics</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      FREE ENGINE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned Image Provider</label>
                      <select
                        value={taskAssignments.thumbnails.keyId}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, thumbnails: { ...p.thumbnails, keyId: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="POLLINATIONS_FREE">✨ Pollinations AI (100% Free Unlimited HD)</option>
                        <option value="OPENAI_DALLE3">OpenAI DALL-E 3 (Paid Key)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Image Model</label>
                      <input
                        type="text"
                        value={taskAssignments.thumbnails.model}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, thumbnails: { ...p.thumbnails, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Voice TTS */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">5. Voice Narration (TTS Synthesizer)</h3>
                        <span className="text-[10px] text-slate-400">Synthesizes clear speech audio track</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      STUDIO TTS ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned TTS Voice Provider</label>
                      <select
                        value={taskAssignments.voice.keyId}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, voice: { ...p.voice, keyId: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PIPER_FREE">🎙️ Piper TTS (100% Free Built-in Studio Narrator)</option>
                        <option value="ELEVENLABS">ElevenLabs Voice AI (Paid Key)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Voice Model</label>
                      <input
                        type="text"
                        value={taskAssignments.voice.model}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, voice: { ...p.voice, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Captions & SEO */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                        <Tags className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">6. Captions, Hashtags & SEO Optimization</h3>
                        <span className="text-[10px] text-slate-400">Generates video titles, tags, and descriptions</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned API Key</label>
                      <select
                        value={taskAssignments.seo.keyId}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, seo: { ...p.seo, keyId: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        {keys.length > 0 ? (
                          keys.map((k) => (
                            <option key={k.id} value={k.id}>{k.label} ({k.provider?.displayName || k.providerId})</option>
                          ))
                        ) : (
                          <option value="NVIDIA_DEFAULT">NVIDIA NIM AI (Free Trial)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Model Identifier</label>
                      <input
                        type="text"
                        value={taskAssignments.seo.model}
                        onChange={(e) => setTaskAssignments((p) => ({ ...p, seo: { ...p.seo, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PUBLISHING & SOCIAL CONTENT RATIOS */}
        {activeTab === 'PUBLISHING' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" /> Social Media Platform Content Ratio Matrix
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
                {/* YouTube Channel */}
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

        {/* TAB 4: BRANDING */}
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
            </div>
          </div>
        )}

        {/* Content & In-App Video Previewer Modal */}
        <ContentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="Automated YouTube Video Studio Preview"
          niche="Tech & AI Innovations"
        />
      </div>
    </Shell>
  );
}
