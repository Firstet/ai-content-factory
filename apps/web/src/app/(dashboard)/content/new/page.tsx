'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Layers, ArrowLeft, Check, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function NewContentCampaignPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [goal, setGoal] = useState('ENGAGEMENT');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [captionStyle, setCaptionStyle] = useState('HORMOZI_YELLOW');
  const [captionPosition, setCaptionPosition] = useState('BOTTOM');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [bRes, nRes] = await Promise.all([fetch(`${API_BASE}/brands`), fetch(`${API_BASE}/niches`)]);
      const [bData, nData] = await Promise.all([bRes.json(), nRes.json()]);
      if (Array.isArray(bData)) {
        setBrands(bData);
        if (bData.length > 0) setSelectedBrand(bData[0].id);
      }
      if (Array.isArray(nData)) {
        setNiches(nData);
        if (nData.length > 0) setSelectedNiche(nData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedBrand) return;

    setIsSubmitting(true);
    try {
      // 1. Create project
      const res = await fetch(`${API_BASE}/content/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brandId: selectedBrand,
          nicheId: selectedNiche || undefined,
          goal,
          platforms: selectedPlatforms,
          aspectRatio,
          captionStyle,
          captionPosition,
        }),
      });
      const project = await res.json();

      // 2. Trigger generation
      fetch(`${API_BASE}/content/projects/${project.id}/generate`, { method: 'POST' });

      // 3. Navigate to detail view
      router.push(`/content/${project.id}`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Content Studio
      </button>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-400" /> New Multi-Platform Content Campaign
        </h1>
        <p className="text-xs text-slate-400">
          Configure your core campaign parameters. Our AI Operating System will automatically write a Master Narrative and adapt it into YouTube scripts, Instagram Carousels, TikTok scenes, LinkedIn posts, and promotional flyers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-xl shadow-2xl">
        {/* Campaign Title */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-indigo-300">1. Campaign Title / Topic</label>
          <input
            type="text"
            required
            placeholder="e.g. The Future of AI Agents in 2026: Revolutionizing Automation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-950 border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>

        {/* Brand & Niche Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-indigo-300">2. Select Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.voiceTone || 'Default Voice'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-indigo-300">3. Select Niche (100% Free)</label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {niches.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaign Goal */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-indigo-300">4. Primary Campaign Goal</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'ENGAGEMENT', label: 'Engagement & Viral' },
              { id: 'GROWTH', label: 'Audience Growth' },
              { id: 'LEAD_GEN', label: 'Lead Generation' },
              { id: 'SALES', label: 'Sales & Conversion' },
            ].map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                  goal === g.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Aspect Ratio & Caption Styling Engine */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              5. Video Aspect Ratio & Subtitle Engine
            </label>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              InVideo / CapCut Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { ratio: '16:9', label: '16:9 Landscape (YouTube/TV)', icon: '📺' },
              { ratio: '9:16', label: '9:16 Vertical (TikTok/Reels)', icon: '📱' },
              { ratio: '1:1', label: '1:1 Square (Feed/LinkedIn)', icon: '🖼️' },
            ].map((item) => (
              <button
                type="button"
                key={item.ratio}
                onClick={() => setAspectRatio(item.ratio)}
                className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all flex items-center gap-3 ${
                  aspectRatio === item.ratio
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Caption Style Preset</label>
              <select
                value={captionStyle}
                onChange={(e) => setCaptionStyle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="HORMOZI_YELLOW">⚡ Alex Hormozi Yellow (High Retention)</option>
                <option value="NEON_CYBERPUNK">💎 Neon Cyberpunk Glow</option>
                <option value="MINIMALIST_DARK">✨ Minimalist Clean Dark Pill</option>
                <option value="BOLD_WHITE">🔥 Bold Impact Caps White</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Caption Screen Position</label>
              <select
                value={captionPosition}
                onChange={(e) => setCaptionPosition(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="BOTTOM">Bottom Center (Standard)</option>
                <option value="MIDDLE">Middle Center (Viral Shorts)</option>
                <option value="TOP">Top Third (Banner Overlay)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Target Platforms */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-indigo-300">6. Target Platforms & Formats</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'YOUTUBE', label: 'YouTube (8-Min Doc)' },
              { id: 'INSTAGRAM', label: 'Instagram (Carousel)' },
              { id: 'TIKTOK', label: 'TikTok (Short 45s)' },
              { id: 'LINKEDIN', label: 'LinkedIn (Post)' },
              { id: 'FLYER', label: 'Flyer / Poster' },
            ].map((p) => {
              const active = selectedPlatforms.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    active
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-950 border-white/10 text-slate-500'
                  }`}
                >
                  <span>{p.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Orchestrating Campaign...</>
            ) : (
              <>
                Generate Multi-Platform Campaign <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
