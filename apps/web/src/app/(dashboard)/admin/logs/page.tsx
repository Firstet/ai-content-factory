'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Terminal, RefreshCw, Filter } from 'lucide-react';
import { api } from '@/lib/api';

export default function LogsAdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [level, setLevel] = useState('');

  async function load() {
    try {
      const res = await api.get(`/admin/logs${level ? `?level=${level}` : ''}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, [level]);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              System Log Auditor
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time application, BullMQ worker, and API log stream.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
            <button onClick={load} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 font-mono text-xs space-y-2 max-h-[600px] overflow-y-auto bg-slate-950/90">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-center py-8">No log entries found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 py-1.5 border-b border-white/5 hover:bg-white/5 px-2 rounded">
                <span className="text-slate-500 shrink-0 text-[11px]">
                  {new Date(log.createdAt).toISOString()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                    log.level === 'ERROR'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-indigo-400 shrink-0 font-semibold text-[11px]">{log.context || 'System'}</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
