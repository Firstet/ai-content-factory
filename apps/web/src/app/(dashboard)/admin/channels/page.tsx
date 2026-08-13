'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Tv, Youtube, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function ChannelsAdminPage() {
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/channels');
        setChannels(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const platforms = [
    { name: 'YOUTUBE', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'TIKTOK', icon: Tv, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { name: 'INSTAGRAM', icon: Tv, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { name: 'FACEBOOK', icon: Tv, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'TWITTER', icon: Tv, color: 'text-slate-300', bg: 'bg-slate-500/10' },
    { name: 'LINKEDIN', icon: Tv, color: 'text-blue-400', bg: 'bg-blue-600/10' },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            Social Channels & OAuth
          </h1>
          <p className="text-xs text-slate-400 mt-1">Connect YouTube, TikTok, Instagram, Facebook, X, and LinkedIn channels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            const channel = channels.find((c) => c.platform === p.name);
            return (
              <div key={p.name} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <span className="font-bold text-xs text-white">{p.name}</span>
                  </div>
                  {channel?.isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <AlertCircle className="w-3 h-3" /> Not Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  {channel ? channel.name : `Connect your ${p.name} channel via OAuth.`}
                </p>

                <button
                  onClick={() => alert(`OAuth flow for ${p.name} initiating... Configure Client ID in API Key Vault.`)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{channel ? 'Reconnect OAuth' : 'Connect Channel'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
