'use client';

import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Radio,
  Image as ImageIcon,
  Volume2,
  Check,
  Sliders,
  Tv,
  Film,
  Search,
  FileText,
  Video,
  Cpu,
  RefreshCw,
  Pencil,
  Trash2,
  Layers,
  Plus,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';

const SUPPORTED_CATALOG = [
  // --- LLM / TEXT & RESEARCH ---
  {
    id: 'NVIDIA',
    name: 'NVIDIA NIM AI',
    protocol: 'OpenAI-compatible',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING', 'COPYWRITING'],
    placeholder: 'nvapi-...',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'nvidia/nvidia-nemotron-nano-9b-v2',
    isFree: false,
  },
  {
    id: 'POLLINATIONS',
    name: 'Pollinations AI (LLM & Text)',
    protocol: 'OpenAI-compatible',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING'],
    placeholder: 'sk_...',
    defaultBaseUrl: 'https://gen.pollinations.ai',
    defaultModel: 'openai',
    isFree: true,
  },
  {
    id: 'DEEPSEEK',
    name: 'DeepSeek AI',
    protocol: 'OpenAI-compatible',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING', 'COPYWRITING'],
    placeholder: 'sk-...',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    isFree: false,
  },
  {
    id: 'OPENAI',
    name: 'OpenAI (Official)',
    protocol: 'OpenAI API',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'IMAGE_GENERATION', 'TEXT_TO_SPEECH', 'VISION'],
    placeholder: 'sk-proj-...',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    isFree: false,
  },
  {
    id: 'GEMINI',
    name: 'Google Gemini',
    protocol: 'Google AI Studio',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SEO_RESEARCH', 'IMAGE_GENERATION'],
    placeholder: 'AIzaSy...',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-1.5-flash',
    isFree: false,
  },
  {
    id: 'ANTHROPIC',
    name: 'Anthropic Claude',
    protocol: 'Anthropic Messages API',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'SCRIPTWRITING', 'COPYWRITING'],
    placeholder: 'sk-ant-...',
    defaultBaseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    isFree: false,
  },
  {
    id: 'OPENROUTER',
    name: 'OpenRouter',
    protocol: 'OpenAI-compatible',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'SCRIPTWRITING'],
    placeholder: 'sk-or-...',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-70b-instruct',
    isFree: false,
  },
  {
    id: 'OLLAMA',
    name: 'Ollama Local LLM',
    protocol: 'Ollama REST API',
    category: 'LLM',
    capabilities: ['TEXT_GENERATION', 'STRUCTURED_TEXT', 'RESEARCH', 'LOCAL_SELF_HOSTED'],
    placeholder: 'Not required (Local Server)',
    defaultBaseUrl: 'http://localhost:11434',
    defaultModel: 'llama3.1',
    isFree: true,
  },

  // --- IMAGE GENERATION ---
  {
    id: 'POLLINATIONS_IMAGE',
    name: 'Pollinations Image AI',
    protocol: 'Pollinations REST API',
    category: 'IMAGE',
    capabilities: ['IMAGE_GENERATION'],
    placeholder: 'Not required (100% Free)',
    defaultBaseUrl: 'https://image.pollinations.ai',
    defaultModel: 'flux',
    isFree: true,
  },
  {
    id: 'STABILITY_AI',
    name: 'Stability AI',
    protocol: 'Stability REST API',
    category: 'IMAGE',
    capabilities: ['IMAGE_GENERATION'],
    placeholder: 'sk-...',
    defaultBaseUrl: 'https://api.stability.ai/v1',
    defaultModel: 'sd3-medium',
    isFree: false,
  },
  {
    id: 'REPLICATE',
    name: 'Replicate AI',
    protocol: 'Replicate REST API',
    category: 'IMAGE',
    capabilities: ['IMAGE_GENERATION', 'VIDEO_GENERATION'],
    placeholder: 'r8_...',
    defaultBaseUrl: 'https://api.replicate.com/v1',
    defaultModel: 'black-forest-labs/flux-schnell',
    isFree: false,
  },

  // --- VIDEO GENERATION ---
  {
    id: 'POLLINATIONS_VIDEO',
    name: 'Pollinations Video AI',
    protocol: 'Pollinations REST API',
    category: 'VIDEO',
    capabilities: ['VIDEO_GENERATION'],
    placeholder: 'Not required (100% Free)',
    defaultBaseUrl: 'https://video.pollinations.ai',
    defaultModel: 'pollinations-video-v1',
    isFree: true,
  },
  {
    id: 'RUNWAY_GEN2',
    name: 'Runway AI',
    protocol: 'Runway API',
    category: 'VIDEO',
    capabilities: ['VIDEO_GENERATION'],
    placeholder: 'key_...',
    defaultBaseUrl: 'https://api.runwayml.com/v1',
    defaultModel: 'gen3a_turbo',
    isFree: false,
  },
  {
    id: 'KLING_AI',
    name: 'Kling AI',
    protocol: 'Kling API',
    category: 'VIDEO',
    capabilities: ['VIDEO_GENERATION'],
    placeholder: 'kling_...',
    defaultBaseUrl: 'https://api.klingai.com/v1',
    defaultModel: 'kling-v1.5',
    isFree: false,
  },
  {
    id: 'LUMA_DREAM_MACHINE',
    name: 'Luma Dream Machine',
    protocol: 'Luma API',
    category: 'VIDEO',
    capabilities: ['VIDEO_GENERATION'],
    placeholder: 'luma_...',
    defaultBaseUrl: 'https://api.lumalabs.ai/v1',
    defaultModel: 'dream-machine-v1',
    isFree: false,
  },

  // --- VOICE & AUDIO SYNTHESIS ---
  {
    id: 'PIPER_TTS',
    name: 'Piper Neural TTS',
    protocol: 'Piper Local Audio Server',
    category: 'VOICE',
    capabilities: ['TEXT_TO_SPEECH', 'AUDIO_GENERATION'],
    placeholder: 'Not required (Built-in Free)',
    defaultBaseUrl: 'http://localhost:5002',
    defaultModel: 'en_US-lessac-medium',
    isFree: true,
  },
  {
    id: 'ELEVENLABS',
    name: 'ElevenLabs Voice AI',
    protocol: 'ElevenLabs REST API',
    category: 'VOICE',
    capabilities: ['TEXT_TO_SPEECH', 'AUDIO_GENERATION'],
    placeholder: 'el-...',
    defaultBaseUrl: 'https://api.elevenlabs.io/v1',
    defaultModel: 'eleven_turbo_v2_5',
    isFree: false,
  },
];

const SYSTEM_TASKS = [
  { id: 'RESEARCH', name: 'Topic & Market Research', capability: 'RESEARCH', icon: Search },
  { id: 'SEO_RESEARCH', name: 'SEO Keywords & Intent', capability: 'SEO_RESEARCH', icon: FileText },
  { id: 'CONTENT_STRATEGY', name: 'Content Strategy & Pillars', capability: 'CONTENT_STRATEGY', icon: Layers },
  { id: 'SCRIPTWRITING', name: 'YouTube & Video Scripts', capability: 'SCRIPTWRITING', icon: Film },
  { id: 'COPYWRITING', name: 'Social Posts & Carousels', capability: 'COPYWRITING', icon: Pencil },
  { id: 'IMAGE_GENERATION', name: 'Image B-Roll & Thumbnails', capability: 'IMAGE_GENERATION', icon: ImageIcon },
  { id: 'VIDEO_GENERATION', name: 'Motion Video Clips', capability: 'VIDEO_GENERATION', icon: Video },
  { id: 'TEXT_TO_SPEECH', name: 'Voice & Audio Narration', capability: 'TEXT_TO_SPEECH', icon: Volume2 },
];

export default function CreatorSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'CONNECTED_CREDENTIALS' | 'TASK_ROUTING' | 'CATALOG'>('CONNECTED_CREDENTIALS');

  // State
  const [credentials, setCredentials] = useState<any[]>([]);
  const [taskRoutes, setTaskRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Add Credential Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState('NVIDIA');
  const [credentialName, setCredentialName] = useState('NVIDIA Production');
  const [baseUrlInput, setBaseUrlInput] = useState('https://integrate.api.nvidia.com/v1');
  const [keyInput, setKeyInput] = useState('');
  const [orgIdInput, setOrgIdInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Smart Defaults Suggestion Banner State
  const [lastAddedCred, setLastAddedCred] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const found = SUPPORTED_CATALOG.find((p) => p.id === selectedProviderId);
    if (found) {
      setBaseUrlInput(found.defaultBaseUrl);
      setCredentialName(`${found.name} Credential`);
    }
  }, [selectedProviderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [keysRes, routesRes] = await Promise.all([
        api.get('/api-keys').catch(() => ({ data: [] })),
        api.get('/providers/routes').catch(() => ({ data: [] })),
      ]);
      setCredentials(keysRes.data || []);
      setTaskRoutes(routesRes.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (providerId?: string) => {
    if (providerId) setSelectedProviderId(providerId);
    const p = SUPPORTED_CATALOG.find((x) => x.id === (providerId || selectedProviderId));
    if (p) {
      setBaseUrlInput(p.defaultBaseUrl);
      setCredentialName(`${p.name} Primary`);
    }
    setKeyInput('');
    setShowAddModal(true);
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const foundProvider = SUPPORTED_CATALOG.find((p) => p.id === selectedProviderId);

    const keyToSave = keyInput && keyInput.trim() !== '' ? keyInput : foundProvider?.isFree ? 'FREE_LOCAL_ENGINE' : '';

    try {
      const res = await api.post('/api-keys', {
        providerId: selectedProviderId,
        label: credentialName || `${foundProvider?.name || 'AI'} Credential`,
        key: keyToSave,
        baseUrl: baseUrlInput,
        platform: `${baseUrlInput}|protocol:${foundProvider?.protocol || 'openai_compatible'}`,
      });

      const newCred = res.data;
      success(
        'Credential Saved & Tested!',
        `Status: ${newCred.status === 'CONNECTED' ? '● Connected' : '● Connection Failed'}. Discovered ${newCred.discoveredModels?.length || 0} models.`,
      );

      setShowAddModal(false);
      setLastAddedCred(newCred);
      loadData();
    } catch (err: any) {
      error('Failed to Save Credential', err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await api.post(`/api-keys/${id}/test`);
      const updated = res.data;
      success('Connection Tested!', `Status: ${updated.status}. Discovered ${updated.discoveredModels?.length || 0} models.`);
      loadData();
    } catch (err: any) {
      error('Test Failed', err.message);
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      await api.delete(`/api-keys/${id}`);
      success('Credential Removed', 'Removed API key credential from database.');
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const handleSaveTaskRoute = async (task: string, primaryCredId?: string, primaryModelId?: string, fallbackCredId?: string) => {
    try {
      await api.post('/providers/routes', {
        task,
        primaryCredentialId: primaryCredId,
        primaryModelId,
        fallbackCredentialId: fallbackCredId,
        autoFallbackEnabled: true,
      });
      success('Task Route Updated', `Saved model & credential route for ${task}.`);
      loadData();
    } catch (err: any) {
      error('Route Update Failed', err.message);
    }
  };

  const handleApplySmartDefaults = async (cred: any) => {
    const credId = cred.id;
    const modelId = cred.discoveredModels?.[0] || 'default';

    for (const taskObj of SYSTEM_TASKS) {
      if (cred.discoveredCapabilities?.includes('TEXT_GENERATION') && ['RESEARCH', 'SEO_RESEARCH', 'CONTENT_STRATEGY', 'SCRIPTWRITING', 'COPYWRITING'].includes(taskObj.id)) {
        await api.post('/providers/routes', {
          task: taskObj.id,
          primaryCredentialId: credId,
          primaryModelId: modelId,
          autoFallbackEnabled: true,
        });
      }
    }
    success('Smart Defaults Applied!', `Assigned ${cred.label} to all supported text tasks.`);
    setLastAddedCred(null);
    loadData();
  };

  const uniqueConnectedCount = new Set(credentials.filter((c) => c.status === 'CONNECTED').map((c) => c.providerId)).size;

  return (
    <Shell>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Cpu className="w-8 h-8 text-indigo-400" /> AI Provider & Routing Architecture
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Decoupled AI Engine: Add unlimited credentials per provider, auto-discover models & capabilities, and configure task-by-task routing with automatic failover.
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add AI Provider Credential
          </button>
        </div>

        {/* System Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between backdrop-blur-xl">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase">Supported Providers</span>
              <span className="text-2xl font-black text-white">{SUPPORTED_CATALOG.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between backdrop-blur-xl">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase">Connected Providers</span>
              <span className="text-2xl font-black text-emerald-400">{uniqueConnectedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between backdrop-blur-xl">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase">Persisted Credentials</span>
              <span className="text-2xl font-black text-cyan-400">{credentials.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Smart Defaults Banner if Credential Just Added */}
        {lastAddedCred && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Suggested Task Route Assignment</h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  "{lastAddedCred.label}" supports Text Generation & Research. Set as default for all research and writing tasks?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setLastAddedCred(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Configure Manually
              </button>
              <button
                onClick={() => handleApplySmartDefaults(lastAddedCred)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg"
              >
                Apply Smart Defaults
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          {[
            { id: 'CONNECTED_CREDENTIALS', label: `Connected Credentials (${credentials.length})`, icon: KeyRound },
            { id: 'TASK_ROUTING', label: 'AI Task Routing Studio', icon: Sliders },
            { id: 'CATALOG', label: `Supported Provider Catalog (${SUPPORTED_CATALOG.length})`, icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Connected Credentials */}
        {activeTab === 'CONNECTED_CREDENTIALS' && (
          <div className="space-y-6">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium">Loading credentials...</div>
            ) : credentials.length === 0 ? (
              <div className="p-16 text-center space-y-4 rounded-3xl bg-slate-900/50 border border-white/10">
                <KeyRound className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
                <h3 className="text-lg font-bold text-white">No AI Provider Credentials Added Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Add AI Provider Credential" above to connect your NVIDIA, OpenAI, Gemini, DeepSeek, or free local AI engines.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {credentials.map((cred) => {
                  const isConnected = cred.status === 'CONNECTED';
                  const modelsCount = cred.discoveredModels?.length || 0;
                  const capsList = cred.discoveredCapabilities || ['TEXT_GENERATION'];

                  return (
                    <div
                      key={cred.id}
                      className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 transition-all backdrop-blur-xl space-y-5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                            {cred.provider?.displayName || cred.providerId}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-0.5">{cred.label}</h3>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            isConnected
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          {isConnected ? 'Connected' : 'Connection Failed'}
                        </span>
                      </div>

                      {/* Key & Endpoint Info */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Masked Key</span>
                          <span className="font-mono text-indigo-300">••••••••••••A91F</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Endpoint</span>
                          <span className="font-mono text-slate-300 truncate max-w-[200px]">{cred.baseUrl || 'Default'}</span>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-500">Discovered Capabilities</span>
                        <div className="flex flex-wrap gap-1.5">
                          {capsList.map((c: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase">
                              {c.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Discovered Models Dropdown / Count */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-500">Available Engine Models ({modelsCount})</span>
                        <select className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white">
                          {(cred.discoveredModels || ['default']).map((m: string, idx: number) => (
                            <option key={idx} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleTestConnection(cred.id)}
                          disabled={testingId === cred.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${testingId === cred.id ? 'animate-spin' : ''}`} />
                          {testingId === cred.id ? 'Testing...' : 'Test Connection'}
                        </button>

                        <button
                          onClick={() => handleDeleteCredential(cred.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Task Routing Studio */}
        {activeTab === 'TASK_ROUTING' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10">
              <h2 className="text-lg font-bold text-white">Task-by-Task AI Model & Provider Router</h2>
              <p className="text-xs text-slate-400 mt-1">
                Assign specific connected credentials and target models to each stage of the content generation pipeline with automatic fallback execution.
              </p>
            </div>

            <div className="space-y-4">
              {SYSTEM_TASKS.map((taskObj) => {
                const Icon = taskObj.icon;
                const existingRoute = taskRoutes.find((r) => r.task === taskObj.id);

                return (
                  <div key={taskObj.id} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{taskObj.name}</h3>
                          <span className="text-[10px] font-mono text-indigo-300">Capability: {taskObj.capability}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-white/10">
                      {/* Primary Provider & Model */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-300">Primary Credential Engine</label>
                        <select
                          value={existingRoute?.primaryCredentialId || ''}
                          onChange={(e) => handleSaveTaskRoute(taskObj.id, e.target.value, existingRoute?.primaryModelId, existingRoute?.fallbackCredentialId)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-indigo-500"
                        >
                          <option value="">-- Select Primary Credential --</option>
                          {credentials.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label} ({c.provider?.displayName || c.providerId})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Fallback Provider */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Automatic Fallback Credential</label>
                        <select
                          value={existingRoute?.fallbackCredentialId || ''}
                          onChange={(e) => handleSaveTaskRoute(taskObj.id, existingRoute?.primaryCredentialId, existingRoute?.primaryModelId, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-indigo-500"
                        >
                          <option value="">-- Select Fallback Credential --</option>
                          {credentials.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label} ({c.provider?.displayName || c.providerId})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Supported Provider Catalog */}
        {activeTab === 'CATALOG' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPPORTED_CATALOG.map((cat) => {
              const matchingCreds = credentials.filter((c) => c.providerId === cat.id);
              const isConnected = matchingCreds.length > 0;

              return (
                <div key={cat.id} className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-4 backdrop-blur-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 text-[10px] font-black uppercase">{cat.category}</span>

                      {cat.isFree ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase">Built-in / Free</span>
                      ) : isConnected ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                          ● {matchingCreds.length} Credential(s)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-black uppercase">Supported</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{cat.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{cat.protocol}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cat.capabilities.map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-bold text-slate-300">
                          {c.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAddModal(cat.id)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold transition-all"
                  >
                    + Add Credential
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Credential Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" /> Add AI Provider Credential
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveCredential} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Select AI Provider</label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {SUPPORTED_CATALOG.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.protocol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Credential Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NVIDIA Production"
                    value={credentialName}
                    onChange={(e) => setCredentialName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">API Base URL</label>
                  <input
                    type="text"
                    required
                    value={baseUrlInput}
                    onChange={(e) => setBaseUrlInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">API Key / Secret</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder={SUPPORTED_CATALOG.find((p) => p.id === selectedProviderId)?.placeholder || 'sk-...'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-400">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                  >
                    {isSaving ? 'Testing & Saving...' : 'Save & Test Connection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
