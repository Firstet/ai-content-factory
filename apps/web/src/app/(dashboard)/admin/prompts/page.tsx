'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { FileCode2, Edit3, Code } from 'lucide-react';
import { api } from '@/lib/api';

export default function PromptsAdminPage() {
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/prompts');
        setPrompts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-400" />
            Prompt Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configurable prompt templates with versioning and variable placeholders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prompts.map((p) => (
            <div key={p.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{p.name}</h3>
                  <span className="text-[10px] text-indigo-400 font-mono">Category: {p.category}</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v{p.version}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                {p.template}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-slate-500" />
                  <span>Vars: {p.variables?.join(', ') || 'none'}</span>
                </div>
                <button
                  onClick={() => alert(`Edit prompt ${p.name}`)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
