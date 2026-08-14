'use client';

import { Shell } from '@/components/layout/Shell';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Users,
  Video,
  Play,
  ArrowUpRight,
} from 'lucide-react';

export default function CreatorAnalyticsPage() {
  const topVideos = [
    {
      title: 'Top 5 AI Automation Hacks for 2026',
      views: '24,500',
      watchTime: '1,420 hrs',
      format: '16:9 Long Video',
      published: '3 days ago',
    },
    {
      title: '3 Secret Code Hacks You Didnt Know! #Shorts',
      views: '18,200',
      watchTime: '310 hrs',
      format: '9:16 Short',
      published: 'Yesterday',
    },
    {
      title: 'How Quantum AI Computing Will Change Software Development',
      views: '5,550',
      watchTime: '480 hrs',
      format: '16:9 Long Video',
      published: '5 days ago',
    },
  ];

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                Performance & Growth Engine
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Studio Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Track total views, watch time, subscriber growth, and top-performing AI content formats across your channels.
            </p>
          </div>
        </div>

        {/* Analytics Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Total Views</span>
              <Eye className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">48,250</div>
            <div className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% this month
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Watch Time</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">2,210 hrs</div>
            <div className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.1% this month
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>New Subscribers</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">+1,480</div>
            <div className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.0% this month
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Videos Rendered</span>
              <Video className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">34</div>
            <div className="text-[11px] text-indigo-300 font-extrabold">100% Automated</div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Top Performing Videos & Shorts
            </h2>
          </div>

          <div className="space-y-4">
            {topVideos.map((v, i) => (
              <div
                key={v.title}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                    #{i + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{v.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {v.format}
                      </span>
                      <span className="text-[11px] text-slate-400">{v.published}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-xs font-extrabold text-white">{v.views} views</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{v.watchTime}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
