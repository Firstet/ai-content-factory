'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Tv, CheckCircle2, Film, RefreshCw, Volume2, ShieldCheck, Flame, Smartphone, Monitor, Square, Dice5 } from 'lucide-react';
import { ContentPreviewModal, SceneItem, AspectRatioType, getPollinationsUrl } from './ContentPreviewModal';
import { useToast } from './Toast';

interface TestRunSandboxProps {
  niche?: string;
  targetAudience?: string;
  growthGoal?: string;
}

// Randomized dynamic templates generator for testing
const HOOK_VARIATIONS = [
  (n: string, a: string) => `Did you know this 1 secret in ${n} will completely transform how ${a} operate in 2026?`,
  (n: string, a: string) => `Attention ${a}! Stop wasting hours on manual work. Here is the ultimate ${n} automation strategy.`,
  (n: string, a: string) => `Is AI about to replace traditional workflows in ${n}? We tested the top tools to find out.`,
  (n: string, a: string) => `Here are 3 game-changing ${n} hacks that top creators don't want you to know about.`,
  (n: string, a: string) => `Why everyone in ${n} is switching to autonomous AI content pipelines right now.`,
];

const BODY_1_VARIATIONS = [
  (n: string) => `Step 1 is deploying automated trend discovery to analyze millions of viral data points across YouTube and TikTok in real time.`,
  (n: string) => `First, the AI script synthesizer crafts high-retention hooks and SEO-optimized teleprompter scripts tailored for ${n}.`,
  (n: string) => `Next, automated neural networks extract high-converting keywords and generate high-definition B-Roll visual prompts.`,
  (n: string) => `By leveraging cloud GPU serverless nodes, video rendering speeds are accelerated by over 500% with zero local resource usage.`,
];

const BODY_2_VARIATIONS = [
  (n: string) => `Then, the Piper TTS engine synthesizes hyper-realistic studio voiceover narration synced frame-by-frame with 1080p Pollinations AI B-Roll visuals.`,
  (n: string) => `Meanwhile, dynamic Ken Burns pan-and-zoom transitions and karaoke-style subtitle captions are automatically encoded into the final MP4 container.`,
  (n: string) => `All generated video assets are stored securely on S3/MinIO cloud storage and scheduled for multi-platform distribution on autopilot.`,
];

const CTA_VARIATIONS = [
  (g: string) => `If your goal is to gain more ${g.toLowerCase()} automatically, smash the subscribe button and hit the notification bell now!`,
  (g: string) => `Ready to supercharge your content creation? Click the link below and launch your autonomous AI factory today!`,
  (g: string) => `Don't forget to like, comment your thoughts, and subscribe for daily AI automation breakdowns!`,
];

const VISUAL_PROMPTS = [
  (n: string) => `Futuristic AI neural network glowing in 8k cinematic lighting, highly detailed for ${n}`,
  (n: string) => `High tech analytics dashboard showing viral growth graphs and data streams for ${n}`,
  (n: string) => `Digital audio soundwave synthesizer with vibrant neon particle trails for ${n}`,
  (n: string) => `Glowing subscribe button with sparkling golden particles background for ${n}`,
  (n: string) => `3D holographic globe spinning with futuristic data nodes for ${n}`,
];

export function TestRunSandbox({
  niche = 'Tech & AI Innovations',
  targetAudience = 'Tech & Productivity Enthusiasts',
  growthGoal = 'SUBSCRIBERS',
}: TestRunSandboxProps) {
  const { success, info } = useToast();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioType>('9:16');
  const [generatedScenes, setGeneratedScenes] = useState<SceneItem[]>([]);

  const handleLaunchTestRun = async () => {
    setIsGeneratingTest(true);
    info('Synthesizing Test Video...', `Generating randomized AI script, voiceover, and ${selectedAspectRatio} Pollinations B-Rolls for: ${niche}`);

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Pick random variations for fresh, dynamic content every click!
    const hookFn = HOOK_VARIATIONS[Math.floor(Math.random() * HOOK_VARIATIONS.length)];
    const body1Fn = BODY_1_VARIATIONS[Math.floor(Math.random() * BODY_1_VARIATIONS.length)];
    const body2Fn = BODY_2_VARIATIONS[Math.floor(Math.random() * BODY_2_VARIATIONS.length)];
    const ctaFn = CTA_VARIATIONS[Math.floor(Math.random() * CTA_VARIATIONS.length)];

    const seedBase = Math.floor(Math.random() * 900000) + 100000;

    const scenes: SceneItem[] = [
      {
        id: `ts-${Date.now()}-1`,
        title: 'Hook / Scene 1',
        content: hookFn(niche, targetAudience),
        visualPrompt: VISUAL_PROMPTS[0](niche),
        imageUrl: getPollinationsUrl(VISUAL_PROMPTS[0](niche), seedBase + 10, selectedAspectRatio),
        timestamp: '00:00 - 00:05',
        durationSeconds: 5,
      },
      {
        id: `ts-${Date.now()}-2`,
        title: 'Body / Scene 2',
        content: body1Fn(niche),
        visualPrompt: VISUAL_PROMPTS[1](niche),
        imageUrl: getPollinationsUrl(VISUAL_PROMPTS[1](niche), seedBase + 20, selectedAspectRatio),
        timestamp: '00:05 - 00:15',
        durationSeconds: 10,
      },
      {
        id: `ts-${Date.now()}-3`,
        title: 'Body / Scene 3',
        content: body2Fn(niche),
        visualPrompt: VISUAL_PROMPTS[2](niche),
        imageUrl: getPollinationsUrl(VISUAL_PROMPTS[2](niche), seedBase + 30, selectedAspectRatio),
        timestamp: '00:15 - 00:25',
        durationSeconds: 10,
      },
      {
        id: `ts-${Date.now()}-4`,
        title: 'Call to Action / Scene 4',
        content: ctaFn(growthGoal),
        visualPrompt: VISUAL_PROMPTS[3](niche),
        imageUrl: getPollinationsUrl(VISUAL_PROMPTS[3](niche), seedBase + 40, selectedAspectRatio),
        timestamp: '00:25 - 00:30',
        durationSeconds: 5,
      },
    ];

    setGeneratedScenes(scenes);
    setIsGeneratingTest(false);
    setIsTestModalOpen(true);
    success('Randomized Test Video Generated! 🎬', `Created unique script & ${selectedAspectRatio} Pollinations B-Rolls.`);
  };

  return (
    <>
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/40 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant Test Sandbox
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Dynamic Random AI Generator
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Preview Test Video Before Full Pipeline Launch
              </h3>
            </div>
          </div>

          <button
            onClick={handleLaunchTestRun}
            disabled={isGeneratingTest}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isGeneratingTest ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating Random Content & B-Rolls...</span>
              </>
            ) : (
              <>
                <Dice5 className="w-4 h-4 text-amber-300" />
                <span>⚡ Run Random 30s Test Preview</span>
              </>
            )}
          </button>
        </div>

        {/* Screen Size / Aspect Ratio Selector Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-white">Select Screen Size / Aspect Ratio:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                selectedAspectRatio === '9:16'
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> 9:16 Shorts/TikTok
            </button>

            <button
              onClick={() => setSelectedAspectRatio('16:9')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                selectedAspectRatio === '16:9'
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> 16:9 YouTube Widescreen
            </button>

            <button
              onClick={() => setSelectedAspectRatio('1:1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                selectedAspectRatio === '1:1'
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Square className="w-3.5 h-3.5" /> 1:1 Square Feed
            </button>

            <button
              onClick={() => setSelectedAspectRatio('AUTO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                selectedAspectRatio === 'AUTO'
                  ? 'bg-purple-600 text-white border border-purple-400 shadow-md shadow-purple-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Auto-Detect
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Niche Context</span>
              <span className="text-xs font-bold text-white truncate block">{niche}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Target Audience</span>
              <span className="text-xs font-bold text-white truncate block">{targetAudience}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Primary Goal</span>
              <span className="text-xs font-bold text-white truncate block">{growthGoal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Studio Previewer Modal */}
      <ContentPreviewModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={`[Test Run Preview] ${niche}: Viral Growth Breakdown`}
        scenes={generatedScenes}
        niche={niche}
        initialAspectRatio={selectedAspectRatio}
      />
    </>
  );
}

