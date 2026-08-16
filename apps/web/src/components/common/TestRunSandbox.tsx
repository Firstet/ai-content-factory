'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Tv, CheckCircle2, Film, RefreshCw, Volume2, ShieldCheck, Flame } from 'lucide-react';
import { ContentPreviewModal } from './ContentPreviewModal';
import { useToast } from './Toast';

interface TestRunSandboxProps {
  niche?: string;
  targetAudience?: string;
  growthGoal?: string;
}

export function TestRunSandbox({
  niche = 'Tech & AI Innovations',
  targetAudience = 'Tech & Productivity Enthusiasts',
  growthGoal = 'SUBSCRIBERS',
}: TestRunSandboxProps) {
  const { success, info } = useToast();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  const handleLaunchTestRun = async () => {
    setIsGeneratingTest(true);
    info('Synthesizing Test Video...', `Generating 30s test run for niche: ${niche}`);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsGeneratingTest(false);
    setIsTestModalOpen(true);
    success('Test Run Ready! 🎬', 'Opening interactive studio video previewer.');
  };

  return (
    <>
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/40 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant Test Run Sandbox
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Preview Test Video Before Full Pipeline Launch
              </h3>
            </div>
          </div>

          <button
            onClick={handleLaunchTestRun}
            disabled={isGeneratingTest}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isGeneratingTest ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Test Video...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>⚡ Run Instant 30s Test Preview</span>
              </>
            )}
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Niche Context</span>
              <span className="text-xs font-bold text-white truncate block">{niche}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Target Audience</span>
              <span className="text-xs font-bold text-white truncate block">{targetAudience}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Primary Goal</span>
              <span className="text-xs font-bold text-white truncate block">{growthGoal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Studio Previewer Modal */}
      <ContentPreviewModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={`[Test Run Preview] ${niche}: 3 Secret Automation Hacks`}
      />
    </>
  );
}
