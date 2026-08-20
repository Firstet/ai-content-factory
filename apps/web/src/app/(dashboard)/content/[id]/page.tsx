'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import {
  Layers,
  Sparkles,
  Youtube,
  Instagram,
  Linkedin,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  Volume2,
  FileText,
  LayoutGrid,
  Play,
  Wand2,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Tv,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ContentStudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('YOUTUBE');
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/content/projects/${id}`);
      setProject(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImprovePrompt = async () => {
    setIsImprovingPrompt(true);
    setTimeout(() => {
      setIsImprovingPrompt(false);
    }, 800);
  };

  const handleGenerateVisual = async () => {
    setIsGeneratingVisual(true);
    setTimeout(() => {
      setIsGeneratingVisual(false);
    }, 1200);
  };

  if (loading) {
    return (
      <Shell>
        <div className="p-12 text-center text-slate-500 font-semibold">Loading Content Studio...</div>
      </Shell>
    );
  }

  if (!project) {
    return (
      <Shell>
        <div className="p-12 text-center text-slate-500 font-semibold">Project not found.</div>
      </Shell>
    );
  }

  const ytOutput = project.outputs?.find((o: any) => o.platform === 'YOUTUBE') || {
    scenes: [
      {
        id: 'sc-1',
        sceneIndex: 1,
        type: 'HOOK',
        durationSeconds: 5,
        narrationText: 'What if you could build a complete 8K automated video channel in under 10 minutes?',
        visualPrompt: 'Cinematic 8k photorealistic shot of futuristic AI hologram interface hovering above a sleek dark obsidian studio desk. Volumetric blue rim lighting, 35mm lens --ar 16:9',
        imageUrl: null,
        visualTreatment: 'CINEMATIC_BROLL',
        status: 'READY',
      },
      {
        id: 'sc-2',
        sceneIndex: 2,
        type: 'PROBLEM',
        durationSeconds: 8,
        narrationText: '99% of creators spend over 20 hours a week struggling with tedious manual video editing and color grading.',
        visualPrompt: 'Overhead shot of a frustrated content creator surrounded by multiple glowing monitors with video editing timelines. Moody atmospheric lighting, deep shadows --ar 16:9',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        visualTreatment: 'CINEMATIC_BROLL',
        status: 'RENDERED',
      },
      {
        id: 'sc-3',
        sceneIndex: 3,
        type: 'INSIGHT',
        durationSeconds: 12,
        narrationText: 'Autonomous AI Content Operating Systems now execute narrative research, scene classification, visual prompt styling, and rendering in parallel.',
        visualPrompt: 'Sleek futuristic server rack with glowing blue neural fiber optic cables transmitting data packets. 8k photorealistic, Octane render --ar 16:9',
        imageUrl: null,
        visualTreatment: 'DATA_VISUALIZATION',
        status: 'READY',
      },
    ],
  };

  const selectedScene = ytOutput.scenes[selectedSceneIndex] || ytOutput.scenes[0];

  return (
    <Shell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <button
              onClick={() => router.push('/content')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Content Studio
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-100">{project.title}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {project.status || 'IN_PRODUCTION'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProject}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh State
            </button>
          </div>
        </div>

        {/* 3-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1. LEFT PANEL: Scene Timeline (3 cols) */}
          <div className="lg:col-span-3 saas-card p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> Scene Timeline
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold">{ytOutput.scenes.length} Scenes</span>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {ytOutput.scenes.map((scene: any, idx: number) => (
                <button
                  key={scene.id || idx}
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    selectedSceneIndex === idx
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold'
                      : 'bg-[#0b1220] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[10px] text-blue-400 uppercase">
                      Scene #{scene.sceneIndex || idx + 1} • {scene.type || 'B-ROLL'}
                    </span>
                    <span className="text-[10px] text-slate-500">{scene.durationSeconds}s</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-slate-300">{scene.narrationText}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. CENTER PANEL: Video Preview Screen (5 cols) */}
          <div className="lg:col-span-5 saas-card p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Tv className="w-4 h-4 text-blue-400" /> Visual Preview (16:9 8K)
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {selectedScene?.imageUrl ? 'Asset Rendered' : 'Pending Render'}
              </span>
            </div>

            {/* Main Canvas Viewport */}
            <div className="w-full aspect-video rounded-lg bg-[#0b1220] border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center">
              {selectedScene?.imageUrl ? (
                <img src={selectedScene.imageUrl} alt="Scene Visual" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-300">Visual not generated yet</h3>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">
                      Ready to synthesize structured 8k cinematic visual prompt for Scene #{selectedScene?.sceneIndex}.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateVisual}
                    disabled={isGeneratingVisual}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isGeneratingVisual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    <span>Generate Visual</span>
                  </button>
                </div>
              )}

              {/* On-Screen Caption Overlay Preview */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="px-3 py-1 rounded bg-black/80 text-white font-bold text-xs shadow-md border border-white/10">
                  {selectedScene?.narrationText?.substring(0, 50)}...
                </span>
              </div>
            </div>

            {/* Narration Preview Bar */}
            <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-blue-400" /> Narration Audio Line
              </span>
              <p className="text-xs text-slate-200 font-medium">"{selectedScene?.narrationText}"</p>
            </div>
          </div>

          {/* 3. RIGHT PANEL: Scene Inspector & Prompt Inspector (4 cols) */}
          <div className="lg:col-span-4 saas-card p-5 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" /> Prompt Inspector
              </h2>
            </div>

            {/* Scene Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#0b1220] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Treatment</span>
                <span className="font-semibold text-blue-400">{selectedScene?.visualTreatment || 'CINEMATIC_BROLL'}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0b1220] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Duration</span>
                <span className="font-semibold text-slate-200">{selectedScene?.durationSeconds} Seconds</span>
              </div>
            </div>

            {/* Structured Visual Prompt Specification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Synthesized Production Prompt
                </label>
                <button
                  onClick={handleImprovePrompt}
                  disabled={isImprovingPrompt}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Improve Prompt
                </button>
              </div>

              <textarea
                rows={5}
                value={selectedScene?.visualPrompt}
                onChange={(e) => {
                  const copy = { ...project };
                  selectedScene.visualPrompt = e.target.value;
                  setProject(copy);
                }}
                className="w-full bg-[#0b1220] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Camera & Motion Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Camera & Motion Direction
              </label>
              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 text-xs text-slate-300 space-y-1">
                <div>Camera: <span className="font-semibold text-slate-200">Slow forward dolly zoom, 35mm lens</span></div>
                <div>Lighting: <span className="font-semibold text-blue-400">Volumetric rim lighting</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

