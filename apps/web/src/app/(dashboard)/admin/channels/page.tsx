'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Tv, Youtube, CheckCircle, AlertCircle, RefreshCw, KeyRound, ExternalLink, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function ChannelsAdminPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

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

  const handleConnect = async (platform: string) => {
    setLoadingPlatform(platform);
    setSelectedPlatform(platform);

    if (platform === 'YOUTUBE') {
      try {
        const res = await api.get('/channels/oauth/youtube/url');
        if (res.data.configured && res.data.url) {
          window.location.href = res.data.url;
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Show setup modal if keys are missing
    setLoadingPlatform(null);
    setShowConfigModal(true);
  };

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
            const isLoading = loadingPlatform === p.name;

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
                  onClick={() => handleConnect(p.name)}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Redirecting...' : channel ? 'Reconnect OAuth' : 'Connect Channel'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* OAuth Setup Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-lg w-full space-y-5 relative">
              <button
                onClick={() => setShowConfigModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configure {selectedPlatform} OAuth Credentials</h3>
                  <p className="text-xs text-slate-400">Client ID and Client Secret required in environment</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-white/5 font-mono">
                <p className="text-slate-400 font-sans font-medium mb-2">
                  Add the following variables to your root <code className="text-indigo-400">.env</code> file:
                </p>
                {selectedPlatform === 'YOUTUBE' ? (
                  <>
                    <div className="text-emerald-400">YOUTUBE_CLIENT_ID=<span className="text-slate-400">&lt;your_google_oauth_client_id&gt;</span></div>
                    <div className="text-emerald-400">YOUTUBE_CLIENT_SECRET=<span className="text-slate-400">&lt;your_google_oauth_client_secret&gt;</span></div>
                    <div className="text-emerald-400">YOUTUBE_REDIRECT_URI=http://localhost:3001/api/channels/oauth/youtube/callback</div>
                  </>
                ) : (
                  <>
                    <div className="text-emerald-400">{selectedPlatform}_CLIENT_ID=<span className="text-slate-400">&lt;your_client_id&gt;</span></div>
                    <div className="text-emerald-400">{selectedPlatform}_CLIENT_SECRET=<span className="text-slate-400">&lt;your_client_secret&gt;</span></div>
                  </>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Quick Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1">Google Cloud Console Credentials <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
                  <li>Add <code className="text-slate-200">http://localhost:3001/api/channels/oauth/youtube/callback</code> under <strong>Authorized redirect URIs</strong>.</li>
                  <li>Copy your Client ID and Secret into your <code className="text-slate-200">.env</code> file.</li>
                  <li>Restart your API server or run local dev mode.</li>
                </ol>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
