'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Layers,
  PlusCircle,
  Play,
  Sliders,
  Sparkles,
  Globe,
  MessageSquare,
  Clock,
  Tv,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import Link from 'next/link';

export default function ContentPlansPage() {
  const [plans, setPlans] = useState([
    {
      id: 'cp-1',
      name: 'Tech & AI Trends 2026',
      niche: 'AI & Future Technology',
      targetAudience: 'Software developers, tech enthusiasts & founders',
      language: 'English',
      country: 'United States',
      brandVoice: 'High-energy, authoritative, educational',
      videoStyle: 'Dynamic Motion Graphics & AI Art',
      videoLength: 10,
      shortLength: 1,
      postingSchedule: '2x Daily (1 Long + 1 Short)',
      platforms: ['YouTube', 'TikTok', 'Instagram'],
      keywords: ['ai tools', 'automation', 'future tech', 'programming'],
      status: 'Active',
    },
  ]);

  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Content Studio Strategy
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Content Plans & Strategy
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configure your niche, target audience, brand voice, visual style, posting schedule, and connected social channels.
            </p>
          </div>

          <Link
            href="/content/wizard"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Launch 9-Step Setup Wizard</span>
          </Link>
        </div>

        {/* Content Plans List */}
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">{plan.name}</h2>
                    <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-semibold mt-1">Niche: {plan.niche}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>

                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>View Live Status</span>
                  </Link>
                </div>
              </div>

              {/* Grid Properties */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Target Audience
                  </div>
                  <div className="font-bold text-slate-200">{plan.targetAudience}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" /> Language & Region
                  </div>
                  <div className="font-bold text-slate-200">
                    {plan.language} ({plan.country})
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Brand Voice & Style
                  </div>
                  <div className="font-bold text-slate-200">{plan.brandVoice}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Video Lengths
                  </div>
                  <div className="font-bold text-slate-200">
                    Long: {plan.videoLength}m | Short: {plan.shortLength}m
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Posting Schedule
                  </div>
                  <div className="font-bold text-slate-200">{plan.postingSchedule}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-pink-400" /> Connected Platforms
                  </div>
                  <div className="font-bold text-slate-200">{plan.platforms.join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
