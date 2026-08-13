'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { BarChart3, Eye, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AnalyticsAdminPage() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/analytics/overview');
        setOverview(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const cards = [
    { name: 'Total Channel Views', value: overview?.totalViews?.toLocaleString() || 0, icon: Eye, color: 'from-blue-500 to-indigo-600' },
    { name: 'Total Likes', value: overview?.totalLikes?.toLocaleString() || 0, icon: ThumbsUp, color: 'from-purple-500 to-pink-600' },
    { name: 'Total Comments', value: overview?.totalComments?.toLocaleString() || 0, icon: MessageSquare, color: 'from-cyan-500 to-blue-600' },
    { name: 'Published Content', value: overview?.totalPublished || 0, icon: Share2, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Cross-Platform Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Unified performance metrics for YouTube, TikTok, Instagram, Facebook, and LinkedIn.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.name} className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{c.name}</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
