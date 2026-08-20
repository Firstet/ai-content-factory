'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  Image as ImageIcon,
  Palette,
  Tv,
  KeyRound,
  Clock,
  Zap,
  Layers,
} from 'lucide-react';
import { MediaUploader } from '@/components/common/MediaUploader';
import { VoicePreviewPlayer } from '@/components/common/VoicePreviewPlayer';
import { api } from '@/lib/api';

export default function ContentWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State across 9 steps
  const [formData, setFormData] = useState({
    // Step 1: Niche
    niche: 'AI Tools & Tech Automation',
    keywords: 'ai tools, productivity, automation, software, python',
    // Step 2: Brand
    brandName: 'TechPulse AI',
    targetAudience: 'Software developers, tech enthusiasts, founders',
    voiceTone: 'High-energy, educational, authoritative',
    // Step 3: Logo & Watermark (Uploadable!)
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    watermarkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    watermarkPosition: 'bottom-right',
    // Step 4: Aspect Ratio & Captions (InVideo / CapCut Style!)
    aspectRatio: '16:9', // 16:9, 9:16, 1:1
    captionStyle: 'HORMOZI_YELLOW', // HORMOZI_YELLOW, NEON_CYBERPUNK, MINIMALIST_DARK, BOLD_WHITE
    captionPosition: 'BOTTOM', // BOTTOM, MIDDLE, TOP
    primaryColor: '#6366f1',
    themeStyle: 'Dark Cyberpunk',
    // Step 5: Social Accounts
    platforms: ['YouTube', 'TikTok'],
    // Step 6: AI Providers & Neural Voice
    llmProvider: 'OpenAI GPT-4o',
    voiceProvider: 'en-US-AndrewMultilingualNeural',
    // Step 7: Schedule
    longVideosPerDay: 1,
    shortsPerDay: 1,
    postingTimes: '09:00 AM, 06:00 PM',
    timezone: 'UTC-5 (EST)',
  });

  const steps = [
    { num: 1, title: 'Choose Niche', icon: Layers },
    { num: 2, title: 'Describe Brand', icon: Building2 },
    { num: 3, title: 'Upload Logo', icon: ImageIcon },
    { num: 4, title: 'Aspect & Captions', icon: Palette },
    { num: 5, title: 'Social Accounts', icon: Tv },
    { num: 6, title: 'Neural Voice', icon: KeyRound },
    { num: 7, title: 'Set Schedule', icon: Clock },
    { num: 8, title: 'Review', icon: CheckCircle2 },
    { num: 9, title: 'Start Automation', icon: Zap },
  ];

  const handleNext = () => {
    if (currentStep < 9) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const bRes = await api.post('/brands', {
        name: formData.brandName,
        voiceTone: formData.voiceTone,
        logoUrl: formData.logoUrl,
        watermarkUrl: formData.watermarkUrl,
        watermarkPosition: formData.watermarkPosition,
        niche: formData.niche,
        aspectRatio: formData.aspectRatio,
        captionStyle: formData.captionStyle,
        captionPosition: formData.captionPosition,
        autoPilotEnabled: true,
        scheduleFrequency: 'TWICE_DAILY',
      });

      await api.post('/pipeline/start', {
        topic: `Top 5 ${formData.niche} Trends for 2026`,
        brandId: bRes.data?.id,
        targetDuration: 5,
        targetAudience: formData.targetAudience,
        language: 'English',
        tone: formData.voiceTone,
        runFullPipeline: true,
      });

      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start automation plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Wizard Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Step-by-Step Creator Wizard
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Create Autonomous Content Plan
          </h1>
          <p className="text-xs text-slate-400">
            Configure your brand identity, media watermarks, and posting schedule in 9 simple steps.
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div className="grid grid-cols-9 gap-1 glass-panel p-3 rounded-2xl border border-white/10">
          {steps.map((s) => {
            const active = currentStep === s.num;
            const completed = currentStep > s.num;
            const Icon = s.icon;

            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all text-center ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : completed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[9px] font-extrabold hidden md:block truncate max-w-full">
                  Step {s.num}
                </span>
              </button>
            );
          })}
        </div>

        {/* Wizard Step Body Container */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          {/* STEP 1: CHOOSE NICHE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 1: Choose Your Content Niche</h2>
                <p className="text-xs text-slate-400 mt-1">Select your industry domain or type a custom niche.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  'AI Tools & Tech Automation',
                  'Finance & Wealth Building',
                  'Health, Fitness & Longevity',
                  'Gaming & Esports News',
                  'Motivation & Productivity',
                  'Custom Niche...',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFormData({ ...formData, niche: item })}
                    className={`p-4 rounded-2xl border text-left font-bold text-xs transition-all ${
                      formData.niche === item
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                  Target Seed Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DESCRIBE BRAND */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 2: Describe Your Brand & Voice</h2>
                <p className="text-xs text-slate-400 mt-1">Set your brand name, target audience, and script tone.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Script Voice & Tone</label>
                  <input
                    type="text"
                    value={formData.voiceTone}
                    onChange={(e) => setFormData({ ...formData, voiceTone: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD LOGO & WATERMARK (UPLOADABLE!) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 3: Upload Brand Logo & Watermark</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your logo and watermark overlay files to automatically embed on rendered videos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MediaUploader
                  label="Brand Logo Image"
                  accept="image/*"
                  value={formData.logoUrl}
                  onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                  helperText="Upload PNG, JPG, or SVG logo"
                />

                <MediaUploader
                  label="Watermark Overlay Image"
                  accept="image/*"
                  value={formData.watermarkUrl}
                  onChange={(url) => setFormData({ ...formData, watermarkUrl: url })}
                  helperText="Upload transparent PNG watermark"
                />

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Watermark Screen Position
                  </label>
                  <select
                    value={formData.watermarkPosition}
                    onChange={(e) => setFormData({ ...formData, watermarkPosition: e.target.value })}
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
          )}

          {/* STEP 4: ASPECT RATIO & CAPTION STYLING ENGINE */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  Step 4: Video Aspect Ratio & Caption Styling Engine
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    CapCut / InVideo Studio Mode
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose your permanent video aspect ratio and customize automated captions across all channel outputs.
                </p>
              </div>

              {/* 1. Permanent Video Aspect Ratio Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Select Video Aspect Ratio (Permanent Auto-Pilot Setting)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { ratio: '16:9', title: '16:9 Landscape', desc: 'YouTube Longform, TV, Desktop', icon: '📺' },
                    { ratio: '9:16', title: '9:16 Vertical', desc: 'TikTok, Shorts, IG Reels', icon: '📱' },
                    { ratio: '1:1', title: '1:1 Square', desc: 'Instagram Feed, LinkedIn', icon: '🖼️' },
                  ].map((item) => (
                    <button
                      key={item.ratio}
                      type="button"
                      onClick={() => setFormData({ ...formData, aspectRatio: item.ratio })}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        formData.aspectRatio === item.ratio
                          ? 'bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-500/25 scale-[1.02]'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-extrabold text-sm text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Caption Styling Engine Presets */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Caption Style Preset
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'HORMOZI_YELLOW', name: 'Alex Hormozi Yellow', bg: 'bg-yellow-400 text-slate-950 font-black px-3 py-1 rounded shadow-md' },
                    { id: 'NEON_CYBERPUNK', name: 'Neon Cyberpunk', bg: 'bg-cyan-500 text-slate-950 font-black px-3 py-1 rounded shadow-md shadow-cyan-500/50' },
                    { id: 'MINIMALIST_DARK', name: 'Minimalist Clean Pill', bg: 'bg-slate-900 text-white font-bold px-3 py-1 rounded-full border border-white/20' },
                    { id: 'BOLD_WHITE', name: 'Bold Impact White', bg: 'text-white font-black text-sm tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, captionStyle: preset.id })}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        formData.captionStyle === preset.id
                          ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-xs text-white block">{preset.name}</span>
                        <span className="text-[10px] text-slate-400">High retention text engine</span>
                      </div>
                      <div className={preset.bg}>SAMPLE CAPTION</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Caption Position Selector */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                  Caption Screen Position
                </label>
                <select
                  value={formData.captionPosition}
                  onChange={(e) => setFormData({ ...formData, captionPosition: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BOTTOM">Bottom Center (Standard)</option>
                  <option value="MIDDLE">Middle Center (High Impact Shorts)</option>
                  <option value="TOP">Top Third (Banner Overlay)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: SOCIAL ACCOUNTS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 5: Connect Social Accounts</h2>
                <p className="text-xs text-slate-400 mt-1">Select channels to auto-publish rendered videos.</p>
              </div>

              <div className="space-y-3">
                {['YouTube Channel (OAuth 2.0 Connected)', 'TikTok v2 Posting API', 'Instagram Reels Graph API'].map(
                  (platform) => (
                    <div
                      key={platform}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-white">{platform}</span>
                      <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Connected
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* STEP 6: AI PROVIDERS & VOICE PREVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 6: AI Provider & Voice Narrator Selection</h2>
                <p className="text-xs text-slate-400 mt-1">Select and test your preferred Piper TTS voice narrator.</p>
              </div>

              {/* Voice Synthesizer Player */}
              <VoicePreviewPlayer
                selectedVoiceId={formData.voiceProvider.includes('Amy') ? 'en_US-amy-medium' : 'en_US-lessac-medium'}
                onSelectVoice={(vId) => setFormData({ ...formData, voiceProvider: `Piper (${vId})` })}
              />

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between">
                <span>⚡ Smart Cost Optimizer Active: Using free built-in Piper TTS & Pollinations AI visual generator.</span>
              </div>
            </div>
          )}

          {/* STEP 7: SET SCHEDULE */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 7: Automated Posting Schedule</h2>
                <p className="text-xs text-slate-400 mt-1">Configure daily volume and posting windows.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Long Videos Per Day</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={formData.longVideosPerDay}
                    onChange={(e) => setFormData({ ...formData, longVideosPerDay: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Shorts / Reels Per Day</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formData.shortsPerDay}
                    onChange={(e) => setFormData({ ...formData, shortsPerDay: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-white">Step 8: Review Content Plan</h2>
                <p className="text-xs text-slate-400 mt-1">Confirm configuration before launching automation.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Brand Name:</span>
                  <span className="font-bold text-white">{formData.brandName}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Niche:</span>
                  <span className="font-bold text-white">{formData.niche}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Daily Schedule:</span>
                  <span className="font-bold text-emerald-400">
                    {formData.longVideosPerDay} Long Video + {formData.shortsPerDay} Shorts / day
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: START AUTOMATION */}
          {currentStep === 9 && (
            <div className="space-y-6 text-center animate-in fade-in py-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-emerald-400 fill-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-black text-white">Ready to Launch Automation!</h2>
                <p className="text-xs text-slate-300">
                  Click below to activate your AI Content Studio. The system will start topic research, script generation, video rendering, and scheduled uploading automatically.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 9 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="py-3.5 px-10 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-90 text-white font-black text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Launching Automation...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Start Automation Engine Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
