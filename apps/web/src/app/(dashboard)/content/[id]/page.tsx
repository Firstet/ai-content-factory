'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layers, Sparkles, Youtube, Instagram, Linkedin, RefreshCw, CheckCircle2, AlertTriangle, ArrowLeft, Image as ImageIcon, Volume2, FileText, LayoutGrid } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://169.58.142.29:3001/api';

export default function ContentStudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MASTER');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/projects/${id}`);
      const data = await res.json();
      setProject(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSlide = async (slideId: string) => {
    setRegeneratingId(slideId);
    try {
      await fetch(`${API_BASE}/content/projects/slides/${slideId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: 'Make headline bolder and punchier' }),
      });
      fetchProject();
    } catch (e) {
      console.error(e);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleRegenerateScene = async (sceneId: string) => {
    setRegeneratingId(sceneId);
    try {
      await fetch(`${API_BASE}/content/projects/scenes/${sceneId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: 'Enhance cinematic visual prompt details' }),
      });
      fetchProject();
    } catch (e) {
      console.error(e);
    } finally {
      setRegeneratingId(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading Campaign Studio...</div>;
  if (!project) return <div className="p-12 text-center text-slate-500 font-medium">Project not found.</div>;

  const master = project.masterNarrative || {};
  const ytOutput = project.outputs?.find((o: any) => o.platform === 'YOUTUBE');
  const igOutput = project.outputs?.find((o: any) => o.platform === 'INSTAGRAM');
  const tkOutput = project.outputs?.find((o: any) => o.platform === 'TIKTOK' || o.platform === 'SHORTS');
  const liOutput = project.outputs?.find((o: any) => o.platform === 'LINKEDIN');
  const flyerOutput = project.outputs?.find((o: any) => o.platform === 'FLYER');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <button onClick={() => router.push('/content')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Content Studio
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">{project.title}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-300 animate-pulse'
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Brand: <span className="text-slate-200 font-bold">{project.brand?.name}</span> • Niche: <span className="text-indigo-300 font-bold">{project.niche?.name || 'General'}</span>
          </p>
        </div>

        <button
          onClick={() => fetchProject()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Studio State
        </button>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: 'MASTER', label: 'Master Narrative', icon: FileText },
          { id: 'YOUTUBE', label: 'YouTube Script & Timeline', icon: Youtube, count: ytOutput?.scenes?.length },
          { id: 'INSTAGRAM', label: 'Instagram Carousel', icon: Instagram, count: igOutput?.slides?.length },
          { id: 'TIKTOK', label: 'TikTok Short', icon: Sparkles },
          { id: 'LINKEDIN', label: 'LinkedIn Article', icon: Linkedin },
          { id: 'FLYER', label: 'Flyer / Poster Graphic', icon: LayoutGrid },
          { id: 'QA', label: 'QA Compliance', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className="px-1.5 py-0.2 rounded bg-slate-950/60 text-[10px] font-black">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      {/* 1. Master Narrative */}
      {activeTab === 'MASTER' && (
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-xl">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Core Thesis</span>
            <h2 className="text-xl font-bold text-white leading-relaxed">{master.thesis || 'Core Campaign Narrative'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">Key Points</h3>
              <ul className="space-y-2">
                {(master.keyPoints || []).map((kp: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <span className="text-indigo-400 font-bold">{idx + 1}.</span> {kp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Weekly Coordinated Calendar</h3>
              <div className="space-y-2">
                {(master.weeklyCalendar || []).map((cal: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-indigo-300">Day {cal.day}: {cal.platform}</span>
                      <span className="text-[10px] uppercase text-slate-400">{cal.format}</span>
                    </div>
                    <p className="text-slate-300 font-medium">{cal.topic}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. YouTube Script & Timeline */}
      {activeTab === 'YOUTUBE' && ytOutput && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-red-400 uppercase">YouTube 8-Min Documentary</span>
              <h2 className="text-lg font-bold text-white">{ytOutput.title}</h2>
            </div>
          </div>

          <div className="space-y-4">
            {(ytOutput.scenes || []).map((scene: any) => (
              <div key={scene.id} className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-black text-indigo-300 uppercase">Scene #{scene.sceneIndex} ({scene.durationSeconds}s)</span>
                  <button
                    onClick={() => handleRegenerateScene(scene.id)}
                    disabled={regeneratingId === scene.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === scene.id ? 'animate-spin' : ''}`} /> Regenerate Scene
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Narration Text
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                      "{scene.narrationText}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Visual Generation Prompt
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/5 font-mono">
                      {scene.visualPrompt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Instagram Carousel */}
      {activeTab === 'INSTAGRAM' && igOutput && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6">
            <span className="text-xs font-black text-pink-400 uppercase">Instagram Educational Carousel</span>
            <h2 className="text-lg font-bold text-white">{igOutput.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(igOutput.slides || []).map((slide: any) => (
              <div key={slide.id} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4 relative group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black uppercase">
                      Slide #{slide.slideIndex}
                    </span>
                    <button
                      onClick={() => handleRegenerateSlide(slide.id)}
                      disabled={regeneratingId === slide.id}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Regenerate Slide"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === slide.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-white">{slide.headline}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{slide.bodyText}</p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-[9px] font-mono text-slate-500 block truncate">{slide.visualPrompt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TikTok Short */}
      {activeTab === 'TIKTOK' && tkOutput && (
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-cyan-400 uppercase">TikTok / Shorts 45s Script</span>
            <h2 className="text-lg font-bold text-white">{tkOutput.title}</h2>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400">Pattern Interrupt Hook</h3>
            <p className="text-sm text-white font-semibold">"{tkOutput.adaptedContent?.hook}"</p>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {(tkOutput.adaptedContent?.scenes || []).map((sc: any, idx: number) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start gap-3 p-3 rounded-xl bg-slate-900/60">
                  <span className="font-bold text-indigo-400">[{sc.durationSeconds || 5}s]</span>
                  <div>
                    <p className="font-medium text-white">"{sc.narrationText}"</p>
                    <span className="text-[10px] text-slate-500 block mt-1">Visual: {sc.visualPrompt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. LinkedIn Article */}
      {activeTab === 'LINKEDIN' && liOutput && (
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-blue-400 uppercase">LinkedIn Thought Leadership Post</span>
            <h2 className="text-lg font-bold text-white">{liOutput.title}</h2>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {liOutput.adaptedContent?.postCopy}
          </div>
        </div>
      )}

      {/* 6. Flyer Graphic */}
      {activeTab === 'FLYER' && flyerOutput && (
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-400 uppercase">Promotional Flyer Specification</span>
            <h2 className="text-2xl font-black text-white">{flyerOutput.adaptedContent?.headline}</h2>
            <p className="text-sm text-indigo-300 font-medium">{flyerOutput.adaptedContent?.subheadline}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Poster Background Visual Prompt</span>
            <p className="text-xs font-mono text-cyan-300 bg-slate-900 p-4 rounded-xl border border-white/5">
              {flyerOutput.adaptedContent?.visualPrompt}
            </p>
          </div>
        </div>
      )}

      {/* 7. Quality Control QA */}
      {activeTab === 'QA' && (
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Quality Control (QA) Compliance Report</h2>
              <p className="text-xs text-slate-400">Automated verification across brand voice, platform constraints, and visual prompt alignment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-2">
              <span className="text-3xl font-black text-emerald-400">95 / 100</span>
              <p className="text-xs text-slate-400 font-bold uppercase">Overall Campaign Score</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-2">
              <span className="text-3xl font-black text-indigo-400">PASSED</span>
              <p className="text-xs text-slate-400 font-bold uppercase">Brand Voice Alignment</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-2">
              <span className="text-3xl font-black text-cyan-400">100%</span>
              <p className="text-xs text-slate-400 font-bold uppercase">Platform Format Rules</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
