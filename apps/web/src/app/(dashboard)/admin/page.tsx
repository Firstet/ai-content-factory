'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Users,
  Video,
  ListTodo,
  Cpu,
  Building2,
  TrendingUp,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  KeyRound,
  Tv,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { name: 'Total Videos', value: stats?.counts?.videos || 0, icon: Video, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20' },
    { name: 'Queue Jobs', value: stats?.counts?.jobs || 0, icon: ListTodo, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
    { name: 'Active Providers', value: stats?.counts?.providers || 6, icon: Cpu, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { name: 'Configured Brands', value: stats?.counts?.brands || 1, icon: Building2, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
  ];

  return (
    <Shell>
      <div className="space-y-8 pb-12">
        {/* Header Hero Banner */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Super Admin Content Engine OS
              </span>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Auto-Pilot Ready
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              AI Content Factory Operations
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Automated topic research, script generation, TTS voiceovers, AI imagery, watermark overlays, FFmpeg video assembly, and scheduled multi-channel posting.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/automation"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Auto-Pilot Schedule</span>
            </Link>

            <Link
              href="/content/new"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Content Pipeline</span>
            </Link>
          </div>
        </div>

        {/* Action Launcher Grid */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Quick Operations Shortcuts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Auto-Pilot Schedule',
                desc: 'Set 2x daily or custom posting frequency',
                href: '/admin/automation',
                icon: Zap,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              },
              {
                title: 'API Key Vault',
                desc: 'Configure OpenAI, Gemini, YouTube keys',
                href: '/admin/api-keys',
                icon: KeyRound,
                color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              },
              {
                title: 'Brand & Watermarks',
                desc: 'Upload logo & customize video overlay',
                href: '/admin/brands',
                icon: Building2,
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              },
              {
                title: 'Social Channels',
                desc: 'Connect YouTube OAuth & TikTok APIs',
                href: '/admin/channels',
                icon: Tv,
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.name} className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white ${card.shadow} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.name}</p>
                  <p className="text-2xl font-black text-white mt-0.5">{loading ? '...' : card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Status & Log Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Render Breakdown */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 space-y-4 border border-white/10">
            <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Video Pipeline Status</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </h2>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-300">Published Videos</span>
                </div>
                <span className="text-xs font-extrabold text-white">{stats?.videoStats?.published || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4.5 h-4.5 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-300">Processing / Rendering</span>
                </div>
                <span className="text-xs font-extrabold text-amber-400">{stats?.videoStats?.processing || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-red-400" />
                  <span className="text-xs font-semibold text-slate-300">Failed / Retried</span>
                </div>
                <span className="text-xs font-extrabold text-red-400">{stats?.videoStats?.failed || 0}</span>
              </div>
            </div>
          </div>

          {/* System Logs Stream */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> System Log Stream
              </h2>
              <Link href="/admin/logs" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                View Logs →
              </Link>
            </div>

            <div className="bg-slate-950/90 rounded-xl p-4 border border-white/10 font-mono text-[11px] space-y-2.5 max-h-60 overflow-y-auto">
              {stats?.recentLogs?.length > 0 ? (
                stats.recentLogs.slice(0, 8).map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-slate-400">
                    <span className="text-slate-500 shrink-0 font-medium">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                        log.level === 'ERROR'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="truncate text-slate-200">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic text-center py-6">System ready — monitoring pipeline workers</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
