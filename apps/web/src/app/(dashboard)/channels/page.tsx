'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Tv,
  Plus,
  Youtube,
  Share2,
  CheckCircle2,
  Lock,
  Globe,
  Tag,
  FileText,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ChannelsStudioPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/channels');
      setChannels(res.data || []);
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectYouTube = async () => {
    setConnecting(true);
    try {
      const res = await api.get('/channels/oauth/youtube/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Please configure YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in Settings → API Keys.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate YouTube OAuth connection');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                Multi-Channel Studio
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Connected Channels & Accounts
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Connect unlimited YouTube channels and social media accounts. Manage upload defaults, privacy, and SEO signatures.
            </p>
          </div>

          <button
            onClick={handleConnectYouTube}
            disabled={connecting}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-red-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {connecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Youtube className="w-4.5 h-4.5 fill-white" />
            )}
            <span>Connect YouTube Channel</span>
          </button>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Channels */}
          {channels.length > 0 ? (
            channels.map((ch) => (
              <div
                key={ch.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                      <Youtube className="w-6 h-6 fill-red-500" />
                    </div>
                    <div>
                      <h2 className="font-black text-base text-white">{ch.name}</h2>
                      <p className="text-[11px] text-slate-400">Platform: YouTube Data API v3</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Connected
                  </span>
                </div>

                {/* Defaults */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-400" /> Default Privacy & License
                    </div>
                    <div className="font-bold text-slate-200">Public | Standard YouTube License</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Tag className="w-3 h-3 text-cyan-400" /> SEO Tags Default
                    </div>
                    <div className="font-bold text-slate-200 font-mono text-[11px]">
                      #tech #ai #automation #productivity
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-8 rounded-3xl border border-white/10 md:col-span-2 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <Youtube className="w-6 h-6 fill-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No YouTube Channels Connected Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Connect your YouTube account via OAuth 2.0 to enable direct background publishing of generated videos & shorts.
                </p>
              </div>

              <button
                onClick={handleConnectYouTube}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/30 inline-flex items-center gap-2 transition-all"
              >
                <Youtube className="w-4 h-4 fill-white" />
                <span>Connect First YouTube Channel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
