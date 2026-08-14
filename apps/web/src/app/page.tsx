'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Tv,
  Calendar,
  Layers,
  Zap,
  ShieldCheck,
  Play,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function CreatorLandingPage() {
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Navigation Top Bar */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight">AI Content Studio</span>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">v2.0 Autonomous Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-extrabold text-slate-300 hover:text-white transition-all px-4 py-2 rounded-xl hover:bg-white/5"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
          <span>The Next-Gen AI Content Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Automate Your Entire Content Engine from{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Idea to Upload
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          YouTube Studio + Buffer + Canva + Notion Calendar combined into an autonomous AI factory. Everything technical happens silently in the background.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-black text-sm shadow-2xl shadow-indigo-500/30 flex items-center gap-3 transition-all scale-[1.02]"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>Launch Content Studio Now</span>
          </Link>

          <Link
            href="/content/wizard"
            className="px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-extrabold text-sm border border-white/10 flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
            <span>Setup 9-Step Strategy</span>
          </Link>
        </div>

        {/* Studio Preview Showcase Card */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="glass-panel p-4 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-slate-950/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 px-4 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-300">aicontentstudio.app/dashboard</span>
              </div>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Autopilot Active
              </span>
            </div>

            <div className="p-6 text-left space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Today's Progress</div>
                  <div className="text-xl font-black text-white mt-1">2 / 2 Videos</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">100% On Schedule</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Next Publish Time</div>
                  <div className="text-xl font-black text-white mt-1">06:00 PM EST</div>
                  <div className="text-[10px] text-purple-300 font-bold mt-0.5">YouTube & TikTok</div>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">AI Cost Optimizer</div>
                  <div className="text-xl font-black text-white mt-1">Smart Routing</div>
                  <div className="text-[10px] text-cyan-300 font-bold mt-0.5">Local Piper + Gemini Flash</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE GRID */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Built for Modern Creators & Content Studios
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Everything you need to scale your channels automatically without technical complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">YouTube Studio & Channels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect unlimited YouTube channels via OAuth 2.0 with automated background video & Shorts publishing.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">Buffer & Notion Calendar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive monthly/weekly publishing calendar with side-panel script previews and drag-and-drop scheduling.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-pink-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">Canva Storyboard Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload custom brand logos, watermark overlays, and visual themes to customize your video rendering pipeline.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">AI Cost Optimizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart task router selects lowest-cost compatible models (Gemini Flash, Piper TTS, Whisper local captions, FFmpeg).
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 py-8 px-6 text-center text-xs text-slate-400 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-extrabold text-white">AI Content Studio Engine</span>
        </div>
        <p className="text-[11px] text-slate-500">
          © 2026 AI Content Factory. Self-hosted & automated studio architecture.
        </p>
      </footer>
    </div>
  );
}
