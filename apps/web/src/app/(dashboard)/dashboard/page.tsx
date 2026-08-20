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

import { useToast } from '@/components/common/Toast';
import { TestRunSandbox } from '@/components/common/TestRunSandbox';

export default function CreatorDashboardPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatingNow, setGeneratingNow] = useState(false);
  const [automationActive, setAutomationActive] = useState(true);
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
      const res = await api.post('/pipeline/start', {
        topic: 'Top 5 AI Tools & Productivity Hacks for 2026',
        targetDuration: 5,
        targetAudience: 'Tech & Productivity Enthusiasts',
        language: 'English',
        tone: 'High-energy, educational, engaging',
        runFullPipeline: true,
      });

      success('Pipeline Launched! 🚀', `AI Content Studio started generating video (${res.data.videoId.substring(0, 8)})`);
    } catch (err: any) {
      error('Generation Failed', err.response?.data?.message || 'Unable to start video pipeline. Check API keys in settings.');
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
      thumbnail: `https://image.pollinations.ai/prompt/${encodeURIComponent('How Quantum AI Computing Will Change Software Development 16:9')}&width=600&height=338&seed=8192&nologo=true`,
    },
    {
      id: 'sp-2',
      title: '3 Secret Automation Hacks You Need in 2026! #Shorts',
      type: 'SHORT_VIDEO',
      platform: 'YouTube Shorts / TikTok',
      scheduledTime: 'Tomorrow at 09:00 AM',
      status: 'Writing Script',
      statusStep: 'SEO & Script Generation',
      thumbnail: `https://image.pollinations.ai/prompt/${encodeURIComponent('3 Secret Automation Hacks You Need in 2026 16:9')}&width=600&height=338&seed=9482&nologo=true`,
    },
    {
      id: 'sp-3',
      title: 'AI vs Human Coders: Who Wins the Benchmark Test?',
      type: 'LONG_VIDEO',
      platform: 'YouTube',
      scheduledTime: 'Tomorrow at 06:00 PM',
      status: 'Scheduled',
      statusStep: 'Topic Research',
      thumbnail: `https://image.pollinations.ai/prompt/${encodeURIComponent('AI vs Human Coders Benchmark Test 16:9')}&width=600&height=338&seed=1823&nologo=true`,
    },
  ];

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* 1. Greeting & Workspace Hero Bar */}
        <div className="saas-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Operating System v2.5
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Autopilot Active
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Good morning, Creator.
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Your AI Content Operating System is ready and actively monitoring trends.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutomationActive(!automationActive)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-2"
            >
              {automationActive ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{automationActive ? 'Pause Auto-Pilot' : 'Resume Auto-Pilot'}</span>
            </button>

            <Link
              href="/content/wizard"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Content</span>
            </Link>
          </div>
        </div>

        {/* 2. Active Content Plan Pipeline Bar */}
        <div className="saas-card p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ACTIVE CONTENT PLAN</span>
              <h2 className="text-base font-bold text-slate-100">Tech & AI Innovations 2026</h2>
            </div>
            <div className="text-xs text-slate-400">
              Next item: <span className="font-semibold text-slate-200">"How AI Agents Are Changing Small Businesses"</span>
            </div>
          </div>

          {/* Stepped Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {[
              { step: '1. Research', desc: 'Trends & Keywords', done: true },
              { step: '2. Script', desc: 'Narrative Breakdown', done: true },
              { step: '3. Visuals', desc: 'Cinematic B-Roll', active: true },
              { step: '4. Render', desc: 'FFmpeg Assembly', done: false },
              { step: '5. Quality QA', desc: 'Compliance & SEO', done: false },
            ].map((st) => (
              <div
                key={st.step}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  st.active
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-300'
                    : st.done
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-slate-900/40 border-slate-800/40 text-slate-500'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{st.step}</span>
                  {st.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {st.active && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Today's Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="saas-card p-5 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Scheduled</div>
            <div className="text-3xl font-bold text-slate-100">2 Items</div>
            <p className="text-xs text-slate-400 mt-1">YouTube & Instagram Reels</p>
          </div>

          <div className="saas-card p-5 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">In Production</div>
            <div className="text-3xl font-bold text-blue-400">1 Item</div>
            <p className="text-xs text-slate-400 mt-1">Visual scene generation active</p>
          </div>

          <div className="saas-card p-5 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Published Today</div>
            <div className="text-3xl font-bold text-emerald-400">5 Items</div>
            <p className="text-xs text-slate-400 mt-1">Across connected channels</p>
          </div>
        </div>

        {/* 4. Upcoming Content Timeline & Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Feed */}
          <div className="saas-card p-6 border border-slate-800 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> Upcoming Content Schedule
              </h2>
              <Link href="/calendar" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                View Calendar →
              </Link>
            </div>

            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-lg bg-[#0b1220] border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700 relative">
                      <img src={post.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-200 line-clamp-1">{post.title}</h3>
                      <span className="text-[10px] text-slate-400">{post.platform} • {post.scheduledTime}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    {post.statusStep}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="saas-card p-6 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Engine Performance
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Views</span>
                <span className="text-sm font-bold text-slate-100">48,250</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Avg Engagement Rate</span>
                <span className="text-sm font-bold text-emerald-400">8.4%</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Published Assets</span>
                <span className="text-sm font-bold text-slate-100">142</span>
              </div>
            </div>

            <TestRunSandbox />
          </div>
        </div>
      </div>
    </Shell>
  );
}
}
