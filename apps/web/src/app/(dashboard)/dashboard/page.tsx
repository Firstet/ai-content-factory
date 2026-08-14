'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Play,
  Pause,
  PlusCircle,
  Clock,
  CheckCircle2,
  Video,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function CreatorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [generatingNow, setGeneratingNow] = useState(false);
  const [automationActive, setAutomationActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/videos');
        setVideos(res.data || []);
      } catch (err) {
        console.error('Failed to fetch video data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGenerateNow = async () => {
    setGeneratingNow(true);
    try {
      // Trigger instant automation pipeline cycle
      const res = await api.post('/pipeline/start', {
        topic: 'Top 5 AI Tools & Productivity Hacks for 2026',
        targetDuration: 5,
        targetAudience: 'Tech & Productivity Enthusiasts',
        language: 'English',
        tone: 'High-energy, educational, engaging',
        runFullPipeline: true,
      });

      setSuccessMsg(`🚀 AI Content Studio launched new video generation cycle! (ID: ${res.data.videoId.substring(0, 8)})`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start video generation');
    } finally {
      setGeneratingNow(false);
    }
  };

  // Scheduled Posts Mock/Live Data
  const scheduledPosts = [
    {
      id: 'sp-1',
      title: 'How Quantum AI Computing Will Change Software Development',
      type: 'LONG_VIDEO',
      platform: 'YouTube',
      scheduledTime: 'Today at 06:00 PM',
      status: 'Rendering',
      statusStep: 'FFmpeg Assembly (80%)',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sp-2',
      title: '3 Secret Automation Hacks You Need in 2026! #Shorts',
      type: 'SHORT_VIDEO',
      platform: 'YouTube Shorts / TikTok',
      scheduledTime: 'Tomorrow at 09:00 AM',
      status: 'Writing Script',
      statusStep: 'SEO & Script Generation',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sp-3',
      title: 'AI vs Human Coders: Who Wins the Benchmark Test?',
      type: 'LONG_VIDEO',
      platform: 'YouTube',
      scheduledTime: 'Tomorrow at 06:00 PM',
      status: 'Scheduled',
      statusStep: 'Topic Research',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Hero Banner */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                AI Content Studio
              </span>
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Autopilot Active
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Studio Command Center
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Your autonomous AI content pipeline is actively researching trends, generating scripts, creating visuals, rendering videos, and publishing to your connected channels.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAutomationActive(!automationActive)}
              className={`px-4 py-3 rounded-xl font-extrabold text-xs transition-all border flex items-center gap-2 ${
                automationActive
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              {automationActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-300" />}
              <span>{automationActive ? 'Pause Automation' : 'Resume Automation'}</span>
            </button>

            <button
              onClick={handleGenerateNow}
              disabled={generatingNow}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {generatingNow ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 fill-white" />
              )}
              <span>Generate Video Now</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Today's Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Progress</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">2 / 2 Videos</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% On Schedule Today
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next Publish Time</span>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">06:00 PM</div>
            <p className="text-[11px] text-purple-300 font-semibold mt-1">
              In 1 Hour 45 Minutes (YouTube)
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Content Plan</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">Tech AI 2026</div>
            <p className="text-[11px] text-cyan-300 font-semibold mt-1">
              2x Daily (Long Video + Shorts)
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Studio Views</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">48,250</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              +14.2% Growth This Week
            </p>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Scheduled Posts Feed */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-5 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-indigo-400" /> Upcoming Scheduled Posts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Automated video creation pipeline status</p>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View Full Calendar →
              </Link>
            </div>

            <div className="space-y-3.5">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10 relative">
                      <img
                        src={post.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/20" />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {post.type === 'LONG_VIDEO' ? '16:9 Long Video' : '9:16 Short'}
                        </span>
                        <span className="text-[11px] text-slate-400">{post.platform}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-extrabold text-slate-200">{post.scheduledTime}</div>
                      <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1 justify-end mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        {post.statusStep}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Content Creator & Channel Status */}
          <div className="space-y-6 lg:col-span-1">
            {/* Create Content Quick Launch Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10 bg-gradient-to-br from-indigo-900/20 via-slate-900/80 to-purple-900/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Content Plan Studio</h3>
                  <p className="text-[11px] text-slate-400">Configure niche & automated posting schedule</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Set up your niche, target audience, brand voice, logo watermarks, and posting frequency in our step-by-step wizard.
              </p>

              <Link
                href="/content/wizard"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Launch 9-Step Content Wizard</span>
              </Link>
            </div>

            {/* Recent Published Content */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
              <h3 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Recent Published Videos</span>
                <Link href="/videos" className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold">
                  View All →
                </Link>
              </h3>

              <div className="space-y-3">
                {videos.length > 0 ? (
                  videos.slice(0, 3).map((v) => (
                    <div key={v.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center">
                        <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{v.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">Published</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> 1.2k views
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-4 bg-slate-900/40 rounded-xl">
                    No videos published yet. Launch your first content plan!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
