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
    { name: 'Total Users', value: stats?.counts?.users || 1, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { name: 'Total Videos', value: stats?.counts?.videos || 0, icon: Video, color: 'from-purple-500 to-pink-600' },
    { name: 'Queue Jobs', value: stats?.counts?.jobs || 0, icon: ListTodo, color: 'from-cyan-500 to-blue-600' },
    { name: 'Active Providers', value: stats?.counts?.providers || 6, icon: Cpu, color: 'from-emerald-500 to-teal-600' },
    { name: 'Configured Brands', value: stats?.counts?.brands || 1, icon: Building2, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Super Admin Operating System
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              AI Content Factory Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Automated topic research, script writing, TTS voice, AI image generation, FFmpeg rendering, and multi-channel publishing.
            </p>
          </div>

          <Link
            href="/content/new"
            className="relative z-10 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Content Pipeline</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.name} className="glass-panel p-5 rounded-xl flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.name}</p>
                  <p className="text-xl font-extrabold text-white mt-0.5">{loading ? '...' : card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Status & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Render Breakdown */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Video Pipeline Status</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </h2>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300">Published Videos</span>
                </div>
                <span className="text-xs font-bold text-white">{stats?.videoStats?.published || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-slate-300">Processing / Rendering</span>
                </div>
                <span className="text-xs font-bold text-amber-400">{stats?.videoStats?.processing || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-slate-300">Failed / Retried</span>
                </div>
                <span className="text-xs font-bold text-red-400">{stats?.videoStats?.failed || 0}</span>
              </div>
            </div>
          </div>

          {/* System Logs Preview */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">System Log Stream</h2>
              <Link href="/admin/logs" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                View All Logs →
              </Link>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 font-mono text-[11px] space-y-2 max-h-60 overflow-y-auto">
              {stats?.recentLogs?.length > 0 ? (
                stats.recentLogs.slice(0, 8).map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-slate-400">
                    <span className="text-slate-600 shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                        log.level === 'ERROR'
                          ? 'bg-red-500/20 text-red-400'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="truncate text-slate-200">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic text-center py-4">No recent logs registered</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
