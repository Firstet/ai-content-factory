'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Sparkles, Play, Globe, Clock, MessageSquare, Layers, Volume2 } from 'lucide-react';
import { api } from '@/lib/api';
import { DEFAULT_VOICES } from '@/components/common/VoicePreviewPlayer';

export default function NewContentPage() {
  const [topic, setTopic] = useState('');
  const [targetDuration, setTargetDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [brandId, setBrandId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [targetAudience, setTargetAudience] = useState('Tech-savvy professionals & AI enthusiasts');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Engaging, educational, and high-energy');
  const [voiceId, setVoiceId] = useState('en_US-lessac-medium');
  const [brands, setBrands] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, cRes] = await Promise.all([api.get('/brands'), api.get('/channels')]);
        setBrands(bRes.data);
        setChannels(cRes.data);
        if (bRes.data.length > 0) setBrandId(bRes.data[0].id);
        if (cRes.data.length > 0) setChannelId(cRes.data[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !brandId) return;

    setLoading(true);
    try {
      const res = await api.post('/pipeline/start', {
        topic,
        brandId,
        channelId: channelId || undefined,
        targetDuration: Number(targetDuration),
        aspectRatio,
        targetAudience,
        language,
        tone,
        runFullPipeline: true,
      });

      const { videoId } = res.data;
      router.push(`/pipeline/${videoId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Automated 13-Step Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Launch New AI Content Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Research → Script → Fact Check → SEO → Storyboard → TTS Voice → AI Images → Subtitles → FFmpeg Render → Thumbnail → Publishing
          </p>
        </div>

        <form onSubmit={handleLaunch} className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          {/* Topic */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider mb-2">
              Video Topic / Seed Idea
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              rows={3}
              placeholder="e.g. How NVIDIA Quantum Computing is changing AI in 2026..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Grid settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Brand */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Target Brand
              </label>
              {brands.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900 text-amber-400 text-xs">
                  No brands configured yet. Please create one in Admin → Brands.
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Target Duration */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Target Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={targetDuration}
                onChange={(e) => setTargetDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Video Screen Aspect Ratio */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Screen Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-300 font-extrabold focus:outline-none focus:border-indigo-500"
              >
                <option value="9:16">📱 9:16 Vertical (Shorts, Reels, TikTok)</option>
                <option value="16:9">🖥️ 16:9 Widescreen (YouTube Long-form)</option>
                <option value="1:1">🟦 1:1 Square (Instagram / Social Feed)</option>
                <option value="AUTO">⚡ Auto-Detect Based on Content</option>
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>

            {/* Voice Narrator Selector */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Voice Narrator (Piper TTS & AI Studio Voices)
              </label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-extrabold focus:outline-none focus:border-emerald-500"
              >
                {DEFAULT_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    🎙️ {v.name} — {v.accent} ({v.style})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={loading || !brands.length}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Starting Pipeline...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Autonomous Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
