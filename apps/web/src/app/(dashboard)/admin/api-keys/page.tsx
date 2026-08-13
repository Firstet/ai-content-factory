'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyRound, ShieldAlert, Plus, Lock } from 'lucide-react';
import { api } from '@/lib/api';

export default function ApiKeysAdminPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [providerId, setProviderId] = useState('');
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      const [kRes, pRes] = await Promise.all([api.get('/api-keys'), api.get('/providers')]);
      setKeys(kRes.data);
      setProviders(pRes.data);
      if (pRes.data.length > 0) setProviderId(pRes.data[0].id);
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
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            AES-256-GCM Encrypted Key Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">Store provider and platform credentials securely. Plaintext keys are never stored or displayed.</p>
        </div>

        {/* Store Key Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Add Encrypted API Key</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.displayName} ({p.name})</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Key Label (e.g. Prod Key 1)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Paste API Secret Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Encrypt & Store</span>
            </button>
          </form>
        </div>

        {/* Keys List Table */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Label</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Usage Count</th>
                <th className="px-6 py-4 font-semibold">Last Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No encrypted keys stored yet.</td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{k.label}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px] font-mono border border-white/5">
                        {k.provider?.displayName || k.provider?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">{k.usageCount} calls</td>
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
