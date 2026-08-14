'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Sparkles,
  Play,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  Image as ImageIcon,
  Video,
  FileText,
  Share2,
  Sliders,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AutoPilotSchedulerPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [runningNow, setRunningNow] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State
  const [autoPilotEnabled, setAutoPilotEnabled] = useState<boolean>(true);
  const [scheduleFrequency, setScheduleFrequency] = useState<string>('TWICE_DAILY');
  const [contentFormats, setContentFormats] = useState<string[]>([
    'SHORT_VIDEO',
    'STILL_IMAGE',
    'CAROUSEL',
    'LONG_VIDEO',
  ]);
  const [niche, setNiche] = useState<string>('AI & Future Tech Automation');
  const [keywords, setKeywords] = useState<string>('ai tools, automation, productivity, software, tutorials');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [watermarkUrl, setWatermarkUrl] = useState<string>('');
  const [watermarkPosition, setWatermarkPosition] = useState<string>('bottom-right');
  const [voiceTone, setVoiceTone] = useState<string>('High-energy, engaging, and professional');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      setBrands(res.data || []);
      if (res.data && res.data.length > 0) {
        const b = res.data[0];
        setSelectedBrandId(b.id);
        applyBrandToState(b);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyBrandToState = (b: any) => {
    setAutoPilotEnabled(b.autoPilotEnabled ?? true);
    setScheduleFrequency(b.scheduleFrequency || 'TWICE_DAILY');
    setContentFormats(b.contentFormats || ['SHORT_VIDEO', 'STILL_IMAGE', 'CAROUSEL', 'LONG_VIDEO']);
    setNiche(b.niche || 'AI & Future Tech Automation');
    setKeywords(Array.isArray(b.keywords) ? b.keywords.join(', ') : b.keywords || '');
    setLogoUrl(b.logoUrl || '');
    setWatermarkUrl(b.watermarkUrl || '');
    setWatermarkPosition(b.watermarkPosition || 'bottom-right');
    setVoiceTone(b.voiceTone || 'High-energy, engaging, and professional');
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    const b = brands.find((x) => x.id === brandId);
    if (b) applyBrandToState(b);
  };

  const toggleFormat = (format: string) => {
    if (contentFormats.includes(format)) {
      if (contentFormats.length === 1) return; // keep at least 1
      setContentFormats(contentFormats.filter((f) => f !== format));
    } else {
      setContentFormats([...contentFormats, format]);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) return;

    setSaving(true);
    try {
      await api.put(`/brands/${selectedBrandId}`, {
        autoPilotEnabled,
        scheduleFrequency,
        contentFormats,
        niche,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        logoUrl,
        watermarkUrl,
        watermarkPosition,
        voiceTone,
      });

      setSuccessMsg('Auto-Pilot Schedule & Brand Watermarks Saved Successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchBrands();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save auto-pilot configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerNow = async () => {
    if (!selectedBrandId) return;
    setRunningNow(true);
    try {
      const topicSuggestions = [
        `Top 5 ${niche || 'AI'} Automation Hacks for 2026`,
        `How AI is revolutionizing ${niche || 'Content Creation'} Today`,
        `The Ultimate Guide to ${keywords.split(',')[0] || 'Automation'}`,
      ];
      const randomTopic = topicSuggestions[Math.floor(Math.random() * topicSuggestions.length)];

      const res = await api.post('/pipeline/start', {
        topic: randomTopic,
        brandId: selectedBrandId,
        targetDuration: 5,
        targetAudience: `People interested in ${niche}`,
        language: 'English',
        tone: voiceTone,
        runFullPipeline: true,
      });

      setSuccessMsg(`🚀 Auto-Pilot Cycle Launched for "${randomTopic}"! (ID: ${res.data.videoId.substring(0, 8)})`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to trigger auto-pilot run');
    } finally {
      setRunningNow(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                Fully Autonomous Content Factory
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Auto-Pilot Content Scheduler
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configure automatic research, content generation, brand logo watermarking, SEO optimization, and scheduled auto-posting across all channels.
            </p>
          </div>

          <button
            onClick={handleTriggerNow}
            disabled={runningNow || !selectedBrandId}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {runningNow ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Run Auto-Pilot Cycle Now</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Brand Selector Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Brand Profile
              </label>
              <span className="text-xs text-slate-300">Choose which brand schedule and watermark settings to configure</span>
            </div>
          </div>

          {brands.length > 0 ? (
            <select
              value={selectedBrandId}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500 min-w-[240px]"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.channels?.length || 0} channels connected)
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-amber-400">No brands found. Please create one in Admin → Brands.</div>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* 1. Master Auto-Pilot Control & Posting Frequency */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Posting Schedule & Frequency</h2>
                  <p className="text-xs text-slate-400">Set how often content is autonomously researched, created, and published</p>
                </div>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">
                  Auto-Pilot Status:
                </span>
                <button
                  type="button"
                  onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all border flex items-center gap-2 ${
                    autoPilotEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${autoPilotEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {autoPilotEnabled ? 'ENABLED (ACTIVE)' : 'DISABLED'}
                </button>
              </div>
            </div>

            {/* Frequency Options */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider mb-3">
                Automated Schedule Frequency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { id: 'TWICE_DAILY', label: '2x Daily', sub: 'Morning & Evening', badge: 'Popular' },
                  { id: 'THREE_TIMES_DAILY', label: '3x Daily', sub: 'Morning, Midday, Night', badge: 'High Volume' },
                  { id: 'DAILY_1X', label: '1x Daily', sub: 'Once per day (12 PM)', badge: 'Balanced' },
                  { id: 'EVERY_2_DAYS', label: 'Every 2 Days', sub: 'Alternate days schedule', badge: 'Standard' },
                  { id: 'EVERY_3_DAYS', label: 'Every 3 Days', sub: 'Longer form focus', badge: 'Relaxed' },
                ].map((freq) => {
                  const selected = scheduleFrequency === freq.id;
                  return (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setScheduleFrequency(freq.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative ${
                        selected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      {freq.badge && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {freq.badge}
                        </span>
                      )}
                      <div className="font-black text-sm text-white">{freq.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{freq.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Content Formats Selection */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Content Formats to Auto-Generate</h2>
                <p className="text-xs text-slate-400">Select which media formats the auto-pilot engine should produce</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 'SHORT_VIDEO',
                  title: 'Short-Form Video',
                  sub: 'TikTok, YouTube Shorts, Reels (9:16)',
                  icon: Video,
                  color: 'from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30',
                },
                {
                  id: 'LONG_VIDEO',
                  title: 'Long-Form Video',
                  sub: 'Full YouTube Videos (16:9 10m+)',
                  icon: Play,
                  color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-300 border-indigo-500/30',
                },
                {
                  id: 'STILL_IMAGE',
                  title: 'Still Image / Flyer',
                  sub: 'Instagram & Facebook Posts',
                  icon: ImageIcon,
                  color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
                },
                {
                  id: 'CAROUSEL',
                  title: 'Carousel Post',
                  sub: 'Multi-slide LinkedIn & Instagram',
                  icon: Layers,
                  color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
                },
              ].map((fmt) => {
                const active = contentFormats.includes(fmt.id);
                const Icon = fmt.icon;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => toggleFormat(fmt.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      active
                        ? `bg-gradient-to-br ${fmt.color} shadow-lg shadow-indigo-500/10`
                        : 'bg-slate-900/60 border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-0"
                      />
                    </div>
                    <div>
                      <h3 className={`font-black text-xs ${active ? 'text-white' : 'text-slate-400'}`}>
                        {fmt.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fmt.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Niche, Research & Brand Watermarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Niche & Voice Tone */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Niche & Auto-Research Scope
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Niche / Industry
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. AI Tools, Crypto Trading, Fitness Tips"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Keywords & Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="ai tools, automation, tech news, python"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Voice & Script Tone
                </label>
                <input
                  type="text"
                  value={voiceTone}
                  onChange={(e) => setVoiceTone(e.target.value)}
                  placeholder="High-energy, educational, viral hook, professional"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Brand Logo & Watermarks */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Brand Logo & Watermark Overlay
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Logo URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://yourbrand.com/logo.png"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Watermark Image / Icon URL
                </label>
                <input
                  type="text"
                  value={watermarkUrl}
                  onChange={(e) => setWatermarkUrl(e.target.value)}
                  placeholder="https://yourbrand.com/watermark.png"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Watermark Screen Position
                </label>
                <select
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="bottom-right">Bottom Right Corner (Default)</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="top-left">Top Left Corner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={saving || !selectedBrandId}
              className="py-3.5 px-10 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <span>Saving Configuration...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 fill-white text-indigo-600" />
                  <span>Save Auto-Pilot & Watermark Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
