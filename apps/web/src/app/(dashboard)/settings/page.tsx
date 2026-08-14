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
  Sliders,
  Check,
} from 'lucide-react';
import { MediaUploader } from '@/components/common/MediaUploader';
import { api } from '@/lib/api';

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'AI_ENGINES' | 'API_KEYS' | 'BRANDING' | 'PUBLISHING' | 'NOTIFICATIONS'>('AI_ENGINES');

  // API Key Vault State
  const [keys, setKeys] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [providerId, setProviderId] = useState('');
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Branding State
  const [logoUrl, setLogoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [brandNiche, setBrandNiche] = useState('AI Tools & Tech Automation');
  const [voiceTone, setVoiceTone] = useState('Engaging and Informative');

  // Publishing State
  const [autoPublish, setAutoPublish] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [draftBeforePublish, setDraftBeforePublish] = useState(false);
  const [randomPostingWindow, setRandomPostingWindow] = useState(true);

  // Preferred AI Engine Selection (Zero-Cost & Custom Provider Options)
  const [researchProvider, setResearchProvider] = useState('GEMINI');
  const [scriptProvider, setScriptProvider] = useState('OPENAI');
  const [voiceEngine, setVoiceEngine] = useState('PIPER_LOCAL');
  const [captionEngine, setCaptionEngine] = useState('WHISPER_LOCAL');
  const [imageEngine, setImageEngine] = useState('POLLINATIONS_FREE');

  useEffect(() => {
    loadKeyVault();
  }, []);

  const loadKeyVault = async () => {
    try {
      const [kRes, pRes] = await Promise.all([api.get('/api-keys'), api.get('/providers')]);
      setKeys(kRes.data || []);
      setProviders(pRes.data || []);
      if (pRes.data && pRes.data.length > 0) setProviderId(pRes.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !label || !providerId) return;
    setSavingKey(true);
    try {
      await api.post('/api-keys', { providerId, label, key });
      setLabel('');
      setKey('');
      setSuccessMsg('API Key saved securely in Database!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadKeyVault();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save API key');
    } finally {
      setSavingKey(false);
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
              AI Engines & Studio Configuration
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configure your preferred AI providers, API keys, brand assets, and automated YouTube publishing rules.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-panel p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1 bg-slate-950/80">
          {[
            { id: 'AI_ENGINES', label: 'AI Model Selection', icon: Cpu },
            { id: 'API_KEYS', label: 'API Key Vault', icon: KeyRound },
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

        {/* TAB 1: AI MODEL SELECTION */}
        {activeTab === 'AI_ENGINES' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Preferred AI Engine Selection
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose which AI model or provider executes each pipeline stage. Select free/local models to run at $0 cost!
                </p>
              </div>

              <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero-Cost Options Included
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-indigo-300">
                  1. Topic & Niche Research Engine
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
                  <option value="OLLAMA">Ollama / Local LLM (100% Free - Self-Hosted)</option>
                </select>
                <p className="text-[11px] text-slate-400">Scrapes web trends and extracts high-converting content angles.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-purple-300">
                  2. Script Writing & Fact Check Engine
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
                  <option value="OLLAMA">Ollama Local Llama 3 / Mistral (100% Free)</option>
                </select>
                <p className="text-[11px] text-slate-400">Generates engaging YouTube scripts, hooks, and storyboards.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-cyan-300">
                  3. Voice Synthesis & Narration Engine
                </label>
                <select
                  value={voiceEngine}
                  onChange={(e) => setVoiceEngine(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="PIPER_LOCAL">Piper TTS Local Engine (100% Free - Server Native)</option>
                  <option value="OPENAI_TTS">OpenAI Voice (tts-1 / tts-1-hd)</option>
                  <option value="ELEVENLABS">ElevenLabs Premium AI Voice</option>
                </select>
                <p className="text-[11px] text-slate-400">Renders high-quality AI voiceover audio narration.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <label className="block font-bold text-white uppercase text-[11px] tracking-wider text-emerald-300">
                  4. Image Scene Generation Engine
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
                <p className="text-[11px] text-slate-400">Generates visual B-roll scenes and image assets for each video segment.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: API KEY VAULT */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-black text-white">Add Your AI Provider API Keys</h2>
              </div>

              <form onSubmit={handleSaveKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">AI Provider</label>
                  <select
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.displayName} ({p.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Key Label</label>
                  <input
                    type="text"
                    placeholder="e.g. OpenAI / Gemini Key"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
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
                    disabled={savingKey}
                    className="py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Save Encrypted API Key</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-950/80 border-b border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
                Configured API Keys ({keys.length})
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Label</th>
                    <th className="px-6 py-4 font-bold">Provider</th>
                    <th className="px-6 py-4 font-bold">Security Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{k.label}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                          {k.provider?.displayName || k.provider?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-emerald-400">
                        AES-256 Encrypted in Database
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

              <div>
                <label className="block font-bold text-slate-300 mb-1">Watermark Overlay Position</label>
                <select
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="bottom-right">Bottom Right Corner (Default)</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="top-left">Top Left Corner</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Content Niche / Voice Tone</label>
                <input
                  type="text"
                  value={brandNiche}
                  onChange={(e) => setBrandNiche(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. AI Tools & Tech Automation"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PUBLISHING & AUTOMATION */}
        {activeTab === 'PUBLISHING' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Automated Publishing & Execution Safeguards</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Configure automated YouTube background uploads and execution options.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Automatic Background Uploads</div>
                  <div className="text-[11px] text-slate-400">Automatically upload rendered videos to your connected YouTube & social channels</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Automatic Retry on Rate Limits</div>
                  <div className="text-[11px] text-slate-400 font-sans">Automatically retry rendering or uploading if API limits occur</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRetry}
                  onChange={(e) => setAutoRetry(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Save as YouTube Unlisted Draft</div>
                  <div className="text-[11px] text-slate-400 font-sans">Save uploaded videos as Unlisted YouTube Drafts before releasing to public</div>
                </div>
                <input
                  type="checkbox"
                  checked={draftBeforePublish}
                  onChange={(e) => setDraftBeforePublish(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Execution Alerts & Notifications</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Receive alerts when videos finish rendering or uploading to YouTube.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white font-sans">Alert on Successful YouTube Publish</div>
                  <div className="text-[11px] text-slate-400 font-sans">Receive notification with live video link when publish completes</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
