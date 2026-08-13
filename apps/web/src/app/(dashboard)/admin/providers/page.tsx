'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Cpu, Power, Check, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProvidersAdminPage() {
  const [providers, setProviders] = useState<any[]>([]);

  async function load() {
    try {
      const res = await api.get('/providers');
      setProviders(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const toggleProvider = async (id: string, current: boolean) => {
    try {
      await api.patch(`/providers/${id}/toggle`, { enabled: !current });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            AI Providers & Preferred Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enable/disable AI providers and route specific tasks (text, image, TTS, embeddings).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                p.enabled ? 'border-indigo-500/30 bg-slate-900/80' : 'border-white/5 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">{p.displayName}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{p.name}</span>
                </div>
                <button
                  onClick={() => toggleProvider(p.id, p.enabled)}
                  className={`p-2 rounded-xl transition-all ${
                    p.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.capabilities?.map((cap: string) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-white/5"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Stored API Keys</span>
                <span className="font-semibold text-indigo-400">{p.apiKeys?.length || 0} Key(s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
