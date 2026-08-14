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
  Globe,
  Bot,
  Trash2,
} from 'lucide-react';
import { MediaUploader } from '@/components/common/MediaUploader';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';

const DEFAULT_PROVIDERS = [
  { name: 'OPENAI', displayName: 'OpenAI (Official GPT-4o)', placeholder: 'sk-proj-...', defaultBaseUrl: 'https://api.openai.com/v1' },
  { name: 'OPENAI_COMPATIBLE', displayName: 'OpenAI Compatible (DeepSeek, Groq, Anyscale, LM Studio)', placeholder: 'sk-...', defaultBaseUrl: 'https://api.deepseek.com/v1' },
  { name: 'GEMINI', displayName: 'Google Gemini (Free Tier Available)', placeholder: 'AIzaSy...', defaultBaseUrl: 'https://generativelanguage.googleapis.com' },
  { name: 'ANTHROPIC', displayName: 'Anthropic Claude 3.5', placeholder: 'sk-ant-...', defaultBaseUrl: 'https://api.anthropic.com' },
  { name: 'OPENROUTER', displayName: 'OpenRouter (Access 100+ Free Models)', placeholder: 'sk-or-...', defaultBaseUrl: 'https://openrouter.ai/api/v1' },
  { name: 'ELEVENLABS', displayName: 'ElevenLabs Voice AI', placeholder: 'el-...', defaultBaseUrl: 'https://api.elevenlabs.io' },
];

export default function CreatorSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'API_KEYS' | 'AI_ENGINES' | 'BRANDING' | 'PUBLISHING' | 'NOTIFICATIONS'>('API_KEYS');

  // API Key Vault State
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedProviderName, setSelectedProviderName] = useState('OPENAI_COMPATIBLE');
  const [label, setLabel] = useState('DeepSeek / OpenAI Compatible Key');
  const [keyInput, setKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://api.deepseek.com/v1');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  // Preferred AI Engine Selection
  const [researchProvider, setResearchProvider] = useState('OPENAI_COMPATIBLE');
  const [scriptProvider, setScriptProvider] = useState('OPENAI_COMPATIBLE');
  const [customModelName, setCustomModelName] = useState('deepseek-chat');
  const [voiceEngine, setVoiceEngine] = useState('PIPER_LOCAL');
  const [imageEngine, setImageEngine] = useState('POLLINATIONS_FREE');

  // Branding & Publishing State
  const [logoUrl, setLogoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => {
    loadKeyVault();
  }, []);

  useEffect(() => {
    const p = DEFAULT_PROVIDERS.find((item) => item.name === selectedProviderName);
    if (p) {
      setBaseUrlInput(p.defaultBaseUrl);
    }
  }, [selectedProviderName]);

  const loadKeyVault = async () => {
    try {
      const kRes = await api.get('/api-keys').catch(() => ({ data: [] }));
      setKeys(kRes.data || []);
    } catch (err) {
      console.error(err);
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
      const errorMsg = Array.isArray(err.response?.data?.message)
        ? err.response.data.message.join(', ')
        : err.response?.data?.message || 'Failed to save API key. Please check network connection.';
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
    } catch (err) {
      error('Deletion Failed', 'Unable to remove API key.');
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
              AI Provider Keys & OpenAI Compatible APIs
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Connect OpenAI, DeepSeek, Groq, OpenRouter, Google Gemini, or any custom OpenAI-compatible API endpoint.
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
                    placeholder="e.g. DeepSeek Production Key / Groq Key"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    API Base URL (For DeepSeek, Groq, LM Studio, Custom API)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://api.deepseek.com/v1"
                    value={baseUrlInput}
                    onChange={(e) => setBaseUrlInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">DeepSeek: https://api.deepseek.com/v1 | Groq: https://api.groq.com/openai/v1</p>
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
                  No API keys added yet. Add your OpenAI, DeepSeek, Google Gemini, or Anthropic API key above!
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
                          {k.platform || 'https://api.openai.com/v1'}
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
                  <Sparkles className="w-5 h-5 text-amber-400" /> Preferred AI Engine & Custom Model Name
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose which AI model or provider executes each pipeline step. Works with OpenAI-compatible APIs!
                </p>
              </div>

              <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OpenAI API Compatible
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
                  <option value="OPENAI_COMPATIBLE">OpenAI Compatible (DeepSeek / Groq / Custom API)</option>
                  <option value="OPENAI">OpenAI Official (GPT-4o Mini)</option>
                  <option value="GEMINI">Google Gemini 1.5 Flash (Free Tier)</option>
                  <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  <option value="OPENROUTER">OpenRouter (Free & Open Source Models)</option>
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
                  <option value="OPENAI_COMPATIBLE">OpenAI Compatible (DeepSeek / Groq / Custom API)</option>
                  <option value="OPENAI">OpenAI Official (GPT-4o)</option>
                  <option value="GEMINI">Google Gemini Pro (Free Tier)</option>
                  <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  <option value="OPENROUTER">OpenRouter Compatible APIs</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 md:col-span-2">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-amber-300">
                  3. Custom Model Identifier (e.g. deepseek-chat, llama-3.3-70b-versatile, gpt-4o)
                </label>
                <input
                  type="text"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  placeholder="e.g. deepseek-chat or llama-3.3-70b-versatile"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Specify the model ID sent to your OpenAI-compatible endpoint (e.g., DeepSeek: <code className="text-amber-300">deepseek-chat</code>, Groq: <code className="text-amber-300">llama-3.3-70b-versatile</code>).
                </p>
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
