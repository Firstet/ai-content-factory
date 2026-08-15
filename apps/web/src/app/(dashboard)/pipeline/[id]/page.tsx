'use client';

import { useEffect, useState, use } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Volume2,
  Image as ImageIcon,
  Film,
  Share2,
  Play,
} from 'lucide-react';
import { api } from '@/lib/api';
import { subscribeToVideo } from '@/lib/ws';
import { ContentPreviewModal } from '@/components/common/ContentPreviewModal';

const STEPS = [
  { id: 'RESEARCH', label: '1. Topic Research' },
  { id: 'SCRIPT', label: '2. Script Writing' },
  { id: 'FACT_CHECK', label: '3. Fact Checking' },
  { id: 'SEO', label: '4. SEO Optimization' },
  { id: 'STORYBOARD', label: '5. Storyboarding' },
  { id: 'VOICE', label: '6. TTS Voice Audio' },
  { id: 'IMAGE', label: '7. AI Scene Images' },
  { id: 'SUBTITLE', label: '8. Subtitle Sync' },
  { id: 'VIDEO', label: '9. FFmpeg Render' },
  { id: 'THUMBNAIL', label: '10. AI Thumbnail' },
  { id: 'PUBLISHING', label: '11. Social Upload' },
];

export default function PipelineMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = use(params);
  const [video, setVideo] = useState<any>(null);
  const [activeStep, setActiveStep] = useState('RESEARCH');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing pipeline...');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  async function loadData() {
    try {
      const res = await api.get(`/pipeline/status/${videoId}`);
      setVideo(res.data);
      if (res.data?.pipelineStep) setActiveStep(res.data.pipelineStep);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();

    // Subscribe to real-time WebSocket progress updates
    const unsubscribe = subscribeToVideo(videoId, (data: any) => {
      if (data.step) setActiveStep(data.step);
      if (data.progress !== undefined) setProgress(data.progress);
      if (data.message) setMessage(data.message);
      loadData(); // refresh full video object
    });

    return () => unsubscribe();
  }, [videoId]);

  const currentStepIdx = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {video?.status || 'PROCESSING'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {videoId.substring(0, 8)}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {video?.title || 'Video Generation Pipeline'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-black shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition-all"
            >
              <Film className="w-4 h-4 text-amber-300" />
              Preview Video & Teleprompter
            </button>

            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-all"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              {message}
            </span>
            <span className="font-mono text-indigo-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/50"
              style={{ width: `${Math.max(progress, 5)}%` }}
            ></div>
          </div>
        </div>

        {/* 11 Steps Visual Timeline */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-6">Pipeline Step Progression</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STEPS.map((s, idx) => {
              const isPassed = currentStepIdx > idx || video?.status === 'RENDERED' || video?.status === 'PUBLISHED';
              const isCurrent = currentStepIdx === idx && video?.status === 'PROCESSING';

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isPassed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px]">{s.label}</span>
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rendered Video Player & Script */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Script Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Generated Script
            </h2>

            {video?.script ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-xs text-slate-300 space-y-3 max-h-96 overflow-y-auto leading-relaxed">
                <div>
                  <span className="font-bold text-indigo-400 uppercase text-[10px] block">Hook</span>
                  <p>{(video.script.content as any)?.hook}</p>
                </div>
                {(video.script.content as any)?.sections?.map((sec: any, i: number) => (
                  <div key={i} className="pt-2 border-t border-white/5">
                    <span className="font-bold text-purple-400 uppercase text-[10px] block">{sec.heading}</span>
                    <p>{sec.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic text-xs py-12 text-center">Script is being generated by AI...</div>
            )}
          </div>

          {/* Rendered Video Player */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" /> Final Rendered Video
            </h2>

            {video?.videoUrl ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                  <video src={video.videoUrl} controls className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready to Publish
                  </span>
                  <a
                    href={video.videoUrl}
                    download
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                  >
                    Download MP4
                  </a>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-950 rounded-xl border border-white/5 flex flex-col items-center justify-center text-slate-500 text-xs gap-3">
                <Film className="w-8 h-8 opacity-40" />
                <span>Video is rendering with FFmpeg...</span>
              </div>
            )}
          </div>
        </div>

        {/* Content & Video Preview Modal */}
        <ContentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={video?.title || 'Automated YouTube Video Studio Preview'}
          videoUrl={video?.videoUrl}
          audioUrl={video?.audioUrl}
        />
      </div>
    </Shell>
  );
}
