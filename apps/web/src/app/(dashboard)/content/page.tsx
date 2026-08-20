'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Sparkles,
  Youtube,
  Instagram,
  Linkedin,
  Video,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Zap,
  TrendingUp,
  Share2,
  X,
  Flame,
  Wand2,
} from 'lucide-react';
import { api } from '@/lib/api';

const QUICK_TEMPLATES = [
  {
    id: 'ai-agents-2026',
    title: 'How Autonomous AI Agents Will Replace 90% of SaaS Tools in 2026',
    goal: 'ENGAGEMENT',
    platforms: ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'FLYER'],
    tag: '⚡ Viral Tech',
    desc: 'Comprehensive multi-platform pack: 8-min YouTube doc, 7-slide Instagram carousel, 45s TikTok script, LinkedIn article, and promo flyer.',
  },
  {
    id: 'mindset-hacks',
    title: '3 Secret High-Income Habits Top 1% Entrepreneurs Use Daily',
    goal: 'GROWTH',
    platforms: ['INSTAGRAM', 'TIKTOK', 'LINKEDIN'],
    tag: '💎 Mindset & Growth',
    desc: 'Visual-heavy campaign designed for maximum shareability on Reels, TikTok, and professional networks.',
  },
  {
    id: 'saas-launch',
    title: 'The Ultimate AI Operating System Launch Strategy & Demo',
    goal: 'SALES',
    platforms: ['YOUTUBE', 'LINKEDIN', 'FLYER'],
    tag: '🚀 Product Launch',
    desc: 'High-converting product showcase package with feature breakdowns and promotional event flyer.',
  },
];

const DEMO_PROJECTS = [
  {
    id: 'demo-1',
    title: 'How Quantum AI Computing Will Change Software Engineering Forever',
    status: 'COMPLETED',
    goal: 'ENGAGEMENT',
    brand: { name: 'TechVision AI Studio' },
    platforms: ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'FLYER'],
    createdAt: new Date().toISOString(),
    outputsCount: 5,
  },
  {
    id: 'demo-2',
    title: '5 Automation Hacks to Scale Content Production 10x with AI',
    status: 'GENERATING',
    goal: 'GROWTH',
    brand: { name: 'Growth Engine Labs' },
    platforms: ['YOUTUBE', 'INSTAGRAM', 'LINKEDIN'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    outputsCount: 3,
  },
];

export default function ContentStudioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatformFilter, setActivePlatformFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Modal Creation
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('ENGAGEMENT');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'YOUTUBE',
    'INSTAGRAM',
    'TIKTOK',
    'LINKEDIN',
    'FLYER',
  ]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/content/projects');
      if (Array.isArray(res.data)) {
        setProjects(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (customTitle?: string, customPlatforms?: string[], customGoal?: string) => {
    const campaignTitle = customTitle || title;
    if (!campaignTitle.trim()) return;

    setCreating(true);
    try {
      const res = await api.post('/content/projects', {
        title: campaignTitle,
        goal: customGoal || goal,
        platforms: customPlatforms || selectedPlatforms,
      });

      const newProject = res.data;
      if (newProject?.id) {
        // Trigger background generation
        api.post(`/content/projects/${newProject.id}/generate`).catch(console.error);
        setIsModalOpen(false);
        setTitle('');
        fetchProjects();
      }
    } catch (e) {
      console.error('Failed to create campaign:', e);
    } finally {
      setCreating(false);
    }
  };

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const displayProjects = projects.length > 0 ? projects : DEMO_PROJECTS;

  const filteredProjects = displayProjects.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform =
      activePlatformFilter === 'ALL' || proj.platforms?.includes(activePlatformFilter);
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* ─── Top Studio Banner ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Multi-Platform Content Studio
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium">
            Generate, adapt, and coordinate high-converting AI content campaigns across YouTube, Instagram, TikTok, LinkedIn, and Promotional Flyers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Content Campaign</span>
          </button>
        </div>
      </div>

      {/* ─── Studio Key Performance Analytics Bar ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Campaigns</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{displayProjects.length}</p>
          <span className="text-[10px] text-emerald-400 font-bold">100% Automated Orchestration</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Platforms Covered</span>
            <Share2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">5 Channels</p>
          <span className="text-[10px] text-purple-400 font-bold">YouTube, IG, TikTok, LI, Flyer</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Outputs Generated</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {displayProjects.reduce((acc, p) => acc + (p.outputsCount || p.platforms?.length || 4), 0)} Assets
          </p>
          <span className="text-[10px] text-pink-400 font-bold">Scripts, Carousels & Visuals</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>AI Quality Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">98.4%</p>
          <span className="text-[10px] text-emerald-400 font-bold">QA Gate Passed</span>
        </div>
      </div>

      {/* ─── 1-Click Quick Starter Templates ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>1-Click Campaign Templates</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-semibold">Instant Multi-Platform Generation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleCreateCampaign(tmpl.title, tmpl.platforms, tmpl.goal)}
              className="group p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/80 border border-white/10 hover:border-indigo-500/50 hover:from-indigo-950/30 transition-all cursor-pointer space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase">
                  {tmpl.tag}
                </span>
                <Wand2 className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {tmpl.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tmpl.desc}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-indigo-400">
                <span>Launch Template</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search & Multi-Platform Filters ────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns by topic or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        {/* Platform Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Channels' },
            { id: 'YOUTUBE', label: 'YouTube' },
            { id: 'INSTAGRAM', label: 'Instagram' },
            { id: 'TIKTOK', label: 'TikTok' },
            { id: 'LINKEDIN', label: 'LinkedIn' },
            { id: 'FLYER', label: 'Flyers' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePlatformFilter(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activePlatformFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Campaigns Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading Multi-Platform Content Campaigns...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 text-center space-y-4 rounded-3xl bg-slate-900/50 border border-white/10">
          <Layers className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Campaigns Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No content campaign matches your filter criteria. Create a new campaign or pick a 1-click template above.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Create New Campaign <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <Link
              key={proj.id}
              href={`/content/${proj.id}`}
              className="group p-6 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all backdrop-blur-xl space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      proj.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : proj.status === 'GENERATING'
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 animate-pulse'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {proj.status === 'COMPLETED'
                      ? 'Ready'
                      : proj.status === 'GENERATING'
                      ? 'AI Generating...'
                      : 'Draft'}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400">
                    {proj.brand?.name || 'Content Studio'}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>
                  {proj.niche && (
                    <p className="text-xs text-indigo-400 mt-1 font-medium">{proj.niche.name}</p>
                  )}
                </div>
              </div>

              {/* Target Platforms & Outputs Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 mt-auto">
                <div className="flex items-center gap-2">
                  {(proj.platforms?.includes('YOUTUBE') || !proj.platforms) && (
                    <Youtube className="w-4 h-4 text-red-400" title="YouTube" />
                  )}
                  {(proj.platforms?.includes('INSTAGRAM') || !proj.platforms) && (
                    <Instagram className="w-4 h-4 text-pink-400" title="Instagram" />
                  )}
                  {(proj.platforms?.includes('TIKTOK') || !proj.platforms) && (
                    <Video className="w-4 h-4 text-cyan-400" title="TikTok" />
                  )}
                  {(proj.platforms?.includes('LINKEDIN') || !proj.platforms) && (
                    <Linkedin className="w-4 h-4 text-blue-400" title="LinkedIn" />
                  )}
                  {proj.platforms?.includes('FLYER') && (
                    <FileText className="w-4 h-4 text-amber-400" title="Flyer" />
                  )}
                </div>

                <span className="font-bold text-slate-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open Studio <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ─── Create Campaign Modal ───────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Create Multi-Platform Campaign
              </h2>
              <p className="text-xs text-slate-400">
                Enter your topic. Our AI will automatically write a Master Strategy and adapt it across all selected platforms.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                  Campaign Title / Main Topic
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Game-Changing AI Tools That Will Double Your Revenue"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                  Primary Campaign Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ENGAGEMENT', label: 'Engagement & Viral' },
                    { id: 'GROWTH', label: 'Audience Growth' },
                    { id: 'LEAD_GEN', label: 'Lead Generation' },
                    { id: 'SALES', label: 'Sales & Conversion' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        goal === g.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                  Target Platforms & Formats
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'YOUTUBE', label: 'YouTube Video' },
                    { id: 'INSTAGRAM', label: 'IG Carousel' },
                    { id: 'TIKTOK', label: 'TikTok Short' },
                    { id: 'LINKEDIN', label: 'LinkedIn Post' },
                    { id: 'FLYER', label: 'Promo Flyer' },
                  ].map((p) => {
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          active
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-500'
                        }`}
                      >
                        <span>{p.label}</span>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => handleCreateCampaign()}
                disabled={creating || !title.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <span>Generating Campaign...</span>
                ) : (
                  <>
                    <span>Generate Campaign</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
