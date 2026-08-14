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
  Tag,
  RefreshCw,
  Trash2,
  PlusCircle,
  X,
  Key,
  Globe,
  Sliders,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ChannelsStudioPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Channel Creation Form State
  const [newChannelName, setNewChannelName] = useState('');
  const [newPlatform, setNewPlatform] = useState('YOUTUBE');
  const [platformChannelId, setPlatformChannelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  // YouTube OAuth Modal State
  const [oauthClientId, setOauthClientId] = useState('');

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
      const query = oauthClientId ? `?clientId=${encodeURIComponent(oauthClientId)}` : '';
      const res = await api.get(`/channels/oauth/youtube/url${query}`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data?.error || 'Could not initiate OAuth URL. Please check your OAuth Client ID.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate YouTube OAuth connection');
    } finally {
      setConnecting(false);
      setShowOAuthModal(false);
    }
  };

  const handleAddManualChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName) return;
    setCreating(true);
    try {
      await api.post('/channels', {
        name: newChannelName,
        platform: newPlatform,
        platformChannelId: platformChannelId || `@${newChannelName.toLowerCase().replace(/\s+/g, '')}`,
        accessToken: accessToken || undefined,
        refreshToken: refreshToken || undefined,
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined,
      });
      // Reset form
      setNewChannelName('');
      setPlatformChannelId('');
      setAccessToken('');
      setRefreshToken('');
      setClientId('');
      setClientSecret('');
      setShowAddModal(false);
      fetchChannels();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add channel');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this channel?')) return;
    try {
      await api.delete(`/channels/${id}`);
      fetchChannels();
    } catch (err: any) {
      alert('Failed to delete channel');
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
              Add unlimited YouTube channels, TikTok, Instagram, X/Twitter, and social media accounts dynamically directly from this studio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-extrabold text-xs border border-indigo-400/30 shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Channel / API Keys</span>
            </button>

            <button
              onClick={() => setShowOAuthModal(true)}
              disabled={connecting}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-red-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {connecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Youtube className="w-4.5 h-4.5 fill-white" />
              )}
              <span>Connect YouTube OAuth</span>
            </button>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.length > 0 ? (
            channels.map((ch) => (
              <div
                key={ch.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      {ch.platform === 'YOUTUBE' ? (
                        <Youtube className="w-6 h-6 fill-red-500 text-red-500" />
                      ) : (
                        <Globe className="w-6 h-6 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-black text-base text-white">{ch.name}</h2>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {ch.platform} • {ch.platformChannelId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Active
                    </span>
                    <button
                      onClick={() => handleDeleteChannel(ch.id)}
                      title="Disconnect Channel"
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Configuration Specs */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-cyan-400" /> Encrypted Tokens
                    </div>
                    <div className="font-bold text-emerald-400 text-[11px]">AES-256 Secured in DB</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" /> Auto-Publish Schedule
                    </div>
                    <div className="font-bold text-slate-200">
                      Twice Daily • Auto-Pilot Active
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-8 rounded-3xl border border-white/10 md:col-span-2 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Channels Added Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Add custom social media channels with your API Keys or OAuth Client Credentials directly inside the app.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Channel & Keys</span>
                </button>

                <button
                  onClick={() => setShowOAuthModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-white/10 inline-flex items-center gap-2 transition-all"
                >
                  <Youtube className="w-4 h-4 fill-red-500 text-red-500" />
                  <span>Connect YouTube OAuth</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Channel Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-indigo-400" /> Add Dynamic Social Channel & Credentials
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddManualChannel} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Channel Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechPulse AI Studio"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Platform *</label>
                    <select
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="YOUTUBE">YouTube Channel</option>
                      <option value="TIKTOK">TikTok Account</option>
                      <option value="INSTAGRAM">Instagram Reels</option>
                      <option value="TWITTER">X / Twitter</option>
                      <option value="LINKEDIN">LinkedIn Page</option>
                      <option value="FACEBOOK">Facebook Page</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Platform Channel ID / Handle</label>
                  <input
                    type="text"
                    placeholder="e.g. @techpulseai or UC..."
                    value={platformChannelId}
                    onChange={(e) => setPlatformChannelId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Direct Access Tokens & Keys (Stored AES-256 Encrypted in DB)
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Access Token / API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="Paste your platform Access Token or API Key..."
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Refresh Token (Optional)</label>
                    <input
                      type="password"
                      placeholder="Paste your OAuth Refresh Token..."
                      value={refreshToken}
                      onChange={(e) => setRefreshToken(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">OAuth Client ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="Google/TikTok App Client ID..."
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">OAuth Client Secret (Optional)</label>
                      <input
                        type="password"
                        placeholder="App Client Secret..."
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-500/20"
                  >
                    {creating ? 'Saving...' : 'Add Channel & Save Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* YouTube OAuth Connection Modal */}
        {showOAuthModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Youtube className="w-5 h-5 fill-red-500 text-red-500" /> Connect YouTube via OAuth
                </h2>
                <button
                  onClick={() => setShowOAuthModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to authorize your YouTube channel via Google OAuth. You can optionally enter your custom Google Client ID below:
              </p>

              <div>
                <label className="block font-bold text-slate-300 text-xs mb-1">Custom Google Client ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-abc...apps.googleusercontent.com"
                  value={oauthClientId}
                  onChange={(e) => setOauthClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConnectYouTube}
                  disabled={connecting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-red-500/20 flex items-center gap-2"
                >
                  {connecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Start OAuth Authorization</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
