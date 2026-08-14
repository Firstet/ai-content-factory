'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyRound, Lock, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, Plus, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function ApiKeysAdminPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [providerId, setProviderId] = useState('');
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function loadData() {
    try {
      const [kRes, pRes] = await Promise.all([api.get('/api-keys'), api.get('/providers')]);
      setKeys(kRes.data || []);
      setProviders(pRes.data || []);
      if (pRes.data && pRes.data.length > 0) setProviderId(pRes.data[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !label || !providerId) return;
    setLoading(true);
    try {
      await api.post('/api-keys', { providerId, label, key });
      setLabel('');
      setKey('');
      setSuccessMsg('API Key AES-256-GCM Encrypted & Stored Successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to encrypt and save API Key');
    } finally {
      setLoading(false);
    }
  };

  const defaultProviders = [
    { name: 'OpenAI (GPT-4o & Dall-E 3)', type: 'LLM & Vision' },
    { name: 'Google Gemini Pro 1.5', type: 'LLM & Multimodal' },
    { name: 'Anthropic Claude 3.5 Sonnet', type: 'LLM & Reasoning' },
    { name: 'YouTube Data API v3', type: 'OAuth & Video Upload' },
    { name: 'TikTok Content Posting API', type: 'Social Posting' },
    { name: 'Instagram Graph API', type: 'Reels & Media' },
  ];

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                AES-256-GCM Hardware Encrypted Vault
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              API Key Vault
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configure AI service providers (OpenAI, Gemini, Anthropic) and Social Network OAuth Keys. Keys are encrypted at rest with hardware-grade secrets.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Known Providers Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultProviders.map((p) => {
            const hasKey = keys.some((k) => k.provider?.name?.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));
            return (
              <div
                key={p.name}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  hasKey
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 border-white/5 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.type}</div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                    hasKey ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {hasKey ? 'Configured' : 'Missing'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Store Key Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Add New Encrypted API Key
            </h2>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Select Service Provider
              </label>
              {providers.length > 0 ? (
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} ({p.name})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 text-xs text-amber-400 bg-amber-500/10 rounded-xl">
                  Loading providers...
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Key Name / Label
              </label>
              <input
                type="text"
                placeholder="e.g. OpenAI Production Key 1"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                API Secret Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-proj-..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
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
                disabled={loading || !providers.length}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Encrypt & Save API Key</span>
              </button>
            </div>
          </form>
        </div>

        {/* Keys List Table */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden space-y-0">
          <div className="p-4 bg-slate-900/60 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" /> Active Encrypted Keys in Vault
            </h3>
            <span className="text-[11px] text-slate-400">{keys.length} Keys Configured</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Key Label</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Encrypted Token</th>
                <th className="px-6 py-4 font-semibold">Usage Count</th>
                <th className="px-6 py-4 font-semibold">Last Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                    No encrypted keys stored yet. Add your OpenAI, Gemini, or YouTube keys above.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{k.label}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase border border-indigo-500/30">
                        {k.provider?.displayName || k.provider?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      •••••••••••••••••••• (AES-256)
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">{k.usageCount || 0} calls</td>
                    <td className="px-6 py-4 text-slate-400">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
