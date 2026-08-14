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
  Zap,
} from 'lucide-react';
import { MediaUploader } from '@/components/common/MediaUploader';
import { api } from '@/lib/api';

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'API_KEYS' | 'PUBLISHING' | 'COST_OPTIMIZER' | 'NOTIFICATIONS'>('BRANDING');

  // API Key Vault State
  const [keys, setKeys] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [providerId, setProviderId] = useState('');
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Branding State (Uploadable!)
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80');
  const [watermarkUrl, setWatermarkUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');

  // Publishing State
  const [autoPublish, setAutoPublish] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [draftBeforePublish, setDraftBeforePublish] = useState(false);
  const [randomPostingWindow, setRandomPostingWindow] = useState(true);

  // Cost Optimizer Routing State
  const [researchModel, setResearchModel] = useState('Gemini Flash (Cheapest - $0.0001/req)');
  const [scriptModel, setScriptModel] = useState('GPT-4o Mini / Gemini Pro');
  const [voiceEngine, setVoiceEngine] = useState('Piper TTS (Local Server - Free)');
  const [captionEngine, setCaptionEngine] = useState('Whisper (Local Server - Free)');

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
      setSuccessMsg('API Key encrypted and stored in vault!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadKeyVault();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to encrypt API key');
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
                Studio Configuration
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Settings & Cost Optimizer
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Manage brand assets, upload watermarks, configure API keys, and set AI cost routing rules.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-panel p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1 bg-slate-950/80">
          {[
            { id: 'BRANDING', label: 'Branding & Watermarks', icon: Building2 },
            { id: 'API_KEYS', label: 'API Key Vault', icon: KeyRound },
            { id: 'PUBLISHING', label: 'Publishing & Scheduling', icon: Clock },
            { id: 'COST_OPTIMIZER', label: 'AI Cost Optimizer', icon: Cpu },
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

        {/* TAB 1: BRANDING & WATERMARKS (UPLOADABLE!) */}
        {activeTab === 'BRANDING' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Brand Logo & Video Watermark Overlay</h2>
              <p className="text-xs text-slate-400 mt-0.5">Upload logo and watermark overlay files for video renders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <MediaUploader
                label="Brand Logo Image"
                accept="image/*"
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                helperText="Upload PNG, JPG, or SVG logo"
              />

              <MediaUploader
                label="Watermark Overlay Image"
                accept="image/*"
                value={watermarkUrl}
                onChange={(url) => setWatermarkUrl(url)}
                helperText="Upload transparent PNG watermark"
              />

              <div className="md:col-span-2">
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
            </div>
          </div>
        )}

        {/* TAB 2: API KEY VAULT */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-black text-white">Hardware Encrypted API Key Vault (AES-256-GCM)</h2>
              </div>

              <form onSubmit={handleSaveKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Service Provider</label>
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
                    placeholder="e.g. OpenAI Prod Key"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Secret Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-proj-..."
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
                    <span>Encrypt & Store Key</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-950/80 border-b border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
                Encrypted Keys Stored ({keys.length})
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Key Label</th>
                    <th className="px-6 py-4 font-bold">Provider</th>
                    <th className="px-6 py-4 font-bold">Status</th>
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
                        AES-256 Encrypted
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PUBLISHING & SCHEDULING */}
        {activeTab === 'PUBLISHING' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Publishing & Scheduling Safeguards</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure auto-retry, draft modes, and posting windows.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Automatic Publishing On</div>
                  <div className="text-[11px] text-slate-400">Automatically upload rendered videos to YouTube on schedule</div>
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
                  <div className="font-bold text-white">Automatic Retry on Failure</div>
                  <div className="text-[11px] text-slate-400">Resume pipeline from failing step automatically if API rate limit occurs</div>
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
                  <div className="font-bold text-white">Draft Before Publish</div>
                  <div className="text-[11px] text-slate-400">Save as Unlisted YouTube Draft instead of immediate Public release</div>
                </div>
                <input
                  type="checkbox"
                  checked={draftBeforePublish}
                  onChange={(e) => setDraftBeforePublish(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Random Posting Window (+/- 15 mins)</div>
                  <div className="text-[11px] text-slate-400">Vary exact publish timestamp slightly for organic channel activity</div>
                </div>
                <input
                  type="checkbox"
                  checked={randomPostingWindow}
                  onChange={(e) => setRandomPostingWindow(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI COST OPTIMIZER */}
        {activeTab === 'COST_OPTIMIZER' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <h2 className="text-base font-black text-white">AI Provider Cost Routing Engine</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                The Cost Routing Engine automatically picks the lowest-cost compatible AI provider for each pipeline task to minimize your API spending.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">1. Topic & Trend Research</div>
                <div className="font-extrabold text-white text-sm">{researchModel}</div>
                <p className="text-[11px] text-slate-400">Routes to Google Gemini Flash or NVIDIA Nemotron for low-cost web research.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="font-bold text-purple-300 uppercase text-[10px] tracking-wider">2. Script Writing & Fact Check</div>
                <div className="font-extrabold text-white text-sm">{scriptModel}</div>
                <p className="text-[11px] text-slate-400">Uses GPT-4o Mini / Gemini Pro for engaging hook & script writing.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="font-bold text-cyan-300 uppercase text-[10px] tracking-wider">3. TTS Narration & Voice</div>
                <div className="font-extrabold text-white text-sm">{voiceEngine}</div>
                <p className="text-[11px] text-slate-400">Piper TTS runs locally on server hardware ($0 API cost).</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="font-bold text-emerald-300 uppercase text-[10px] tracking-wider">4. Subtitles & Transcriptions</div>
                <div className="font-extrabold text-white text-sm">{captionEngine}</div>
                <p className="text-[11px] text-slate-400">Whisper model runs locally on server hardware ($0 API cost).</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white">Creator Alerts & Notifications</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure email & webhook alerts for video generation milestones.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Email Alert on Successful Video Publish</div>
                  <div className="text-[11px] text-slate-400">Receive notification email with YouTube link when video goes live</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Email Alert on Pipeline Error</div>
                  <div className="text-[11px] text-slate-400">Instant alert if video rendering or OAuth upload requires attention</div>
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
