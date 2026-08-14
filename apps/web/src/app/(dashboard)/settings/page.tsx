'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Settings as SettingsIcon,
  KeyRound,
  Building2,
  Clock,
  Cpu,
  Bell,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Bot,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { MediaUploader } from '@/components/common/MediaUploader';
import { api } from '@/lib/api';

const DEFAULT_PROVIDERS = [
  { name: 'OPENAI', displayName: 'OpenAI (GPT-4o / DALL-E 3)', placeholder: 'sk-proj-...' },
  { name: 'GEMINI', displayName: 'Google Gemini (Free Tier Available)', placeholder: 'AIzaSy...' },
  { name: 'ANTHROPIC', displayName: 'Anthropic Claude', placeholder: 'sk-ant-...' },
  { name: 'OPENROUTER', displayName: 'OpenRouter (Free & Open Models)', placeholder: 'sk-or-...' },
  { name: 'ELEVENLABS', displayName: 'ElevenLabs Voice AI', placeholder: 'el-...' },
];

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'AI_ENGINES' | 'API_KEYS' | 'BRANDING' | 'PUBLISHING' | 'NOTIFICATIONS'>('API_KEYS');

  // API Key Vault State
  const [keys, setKeys] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderName, setSelectedProviderName] = useState('OPENAI');
  const [label, setLabel] = useState('Primary API Key');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Preferred AI Engine Selection (Zero-Cost & Custom Provider Options)
  const [researchProvider, setResearchProvider] = useState('GEMINI');
  const [scriptProvider, setScriptProvider] = useState('OPENAI');
  const [voiceEngine, setVoiceEngine] = useState('PIPER_LOCAL');
  const [captionEngine, setCaptionEngine] = useState('WHISPER_LOCAL');
  const [imageEngine, setImageEngine] = useState('POLLINATIONS_FREE');

  // Branding State
  const [logoUrl, setLogoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [brandNiche, setBrandNiche] = useState('AI Tools & Tech Automation');

  // Publishing State
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => {
    loadKeyVault();
  }, []);

  const loadKeyVault = async () => {
    try {
      const [kRes, pRes] = await Promise.all([
        api.get('/api-keys').catch(() => ({ data: [] })),
        api.get('/providers').catch(() => ({ data: [] })),
      ]);
      setKeys(kRes.data || []);
      setProviders(pRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput) return;
    setSavingKey(true);
    try {
      // Find matching provider ID or create matching entry
      let targetProvider = providers.find((p) => p.name === selectedProviderName);
      let providerId = targetProvider?.id;

      if (!providerId) {
        // Fallback to sending providerId directly or reloading providers
        const pRes = await api.get('/providers');
        targetProvider = (pRes.data || []).find((p: any) => p.name === selectedProviderName);
        providerId = targetProvider?.id || selectedProviderName;
      }

      await api.post('/api-keys', {
        providerId,
        label: label || `${selectedProviderName} Key`,
        key: keyInput,
      });

      setKeyInput('');
      setSuccessMsg(`Successfully saved ${selectedProviderName} API key encrypted in database!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadKeyVault();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save API key. Please check connection.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      loadKeyVault();
    } catch (err) {
      alert('Failed to delete key');
    }
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
                Personal Creator Studio
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              AI Provider Keys & Configuration
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Add your AI provider API keys (OpenAI, Gemini, Anthropic, OpenRouter) and select zero-cost models for video creation.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-panel p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1 bg-slate-950/80">
          {[
            { id: 'API_KEYS', label: 'API Key Vault (Add Keys)', icon: KeyRound },
            { id: 'AI_ENGINES', label: 'AI Model Selection', icon: Cpu },
            { id: 'BRANDING', label: 'Branding & Overlays', icon: Building2 },
            { id: 'PUBLISHING', label: 'Publishing & Automation', icon: Clock },
            { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
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

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: API KEY VAULT */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-black text-white">Add AI Provider API Key</h2>
                </div>
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AES-256 Encrypted
                </span>
              </div>

              <form onSubmit={handleSaveKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Select AI Provider</label>
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
                    placeholder="e.g. My Personal OpenAI Key"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">API Key String</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder={DEFAULT_PROVIDERS.find((p) => p.name === selectedProviderName)?.placeholder || 'Enter API Key'}
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

                <div className="md:col-span-3 flex justify-end pt-2">
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
                <span className="text-[11px] text-slate-400 font-normal lowercase">Keys are securely stored and never shown again</span>
              </div>
              {keys.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <KeyRound className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No API keys added yet. Add your OpenAI, Google Gemini, or Anthropic API key above to start generating videos!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Label</th>
                      <th className="px-6 py-4 font-bold">Provider</th>
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
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Preferred AI Engine Selection
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose which AI model executes each pipeline step. Select free/local options to run at zero cost!
                </p>
              </div>

              <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero-Cost Options Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-indigo-300">
                  1. Topic Research Engine
                </label>
                <select
                  value={researchProvider}
                  onChange={(e) => setResearchProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="GEMINI">Google Gemini 1.5 Flash (Free Tier Available)</option>
                  <option value="OPENAI">OpenAI (GPT-4o Mini)</option>
                  <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  <option value="OPENROUTER">OpenRouter (Free & Open Source Models)</option>
                  <option value="OLLAMA">Ollama Local LLM (100% Free)</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-purple-300">
                  2. Script Writing Engine
                </label>
                <select
                  value={scriptProvider}
                  onChange={(e) => setScriptProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="OPENAI">OpenAI (GPT-4o / GPT-4o Mini)</option>
                  <option value="GEMINI">Google Gemini Pro (Free Tier)</option>
                  <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  <option value="OPENROUTER">OpenRouter Compatible APIs</option>
                  <option value="OLLAMA">Ollama Local Llama 3 (100% Free)</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-cyan-300">
                  3. Voice Synthesis Engine
                </label>
                <select
                  value={voiceEngine}
                  onChange={(e) => setVoiceEngine(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="PIPER_LOCAL">Piper TTS Engine (100% Free - Server Built-In)</option>
                  <option value="OPENAI_TTS">OpenAI Voice (tts-1)</option>
                  <option value="ELEVENLABS">ElevenLabs AI Voice</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-emerald-300">
                  4. B-Roll Scene Image Engine
                </label>
                <select
                  value={imageEngine}
                  onChange={(e) => setImageEngine(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="POLLINATIONS_FREE">Pollinations AI (100% Free - Unlimited Image Scenes)</option>
                  <option value="DALL_E_3">OpenAI DALL-E 3</option>
                  <option value="STABILITY">Stability AI SDXL</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BRANDING & WATERMARKS */}
        {activeTab === 'BRANDING' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Brand Assets & Video Watermark Overlays</h2>
              <p className="text-xs text-slate-400 mt-0.5">Upload logo and transparent PNG watermarks for video rendering.</p>
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
