'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ListTodo, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function QueuesAdminPage() {
  const [queues, setQueues] = useState<any[]>([]);

  async function loadStats() {
    try {
      const res = await api.get('/pipeline/queues');
      setQueues(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-400" />
              BullMQ Workers & Queues Monitor
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time status of all 12 pipeline stage queues.</p>
          </div>
          <button
            onClick={loadStats}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {queues.map((q) => (
            <div key={q.name} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase tracking-wider">{q.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    q.active > 0 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                ></span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-white/5">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 block font-semibold">Active</span>
                  <span className="text-amber-400 font-bold text-xs">{q.active}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 block font-semibold">Waiting</span>
                  <span className="text-indigo-400 font-bold text-xs">{q.waiting}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 block font-semibold">Failed</span>
                  <span className="text-red-400 font-bold text-xs">{q.failed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
