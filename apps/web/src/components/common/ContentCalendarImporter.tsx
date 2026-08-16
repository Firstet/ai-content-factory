'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Youtube,
  Instagram,
  Facebook,
  Video,
  Play,
  CheckCircle2,
  Plus,
  Trash2,
  Rocket,
  Clock,
  Layers,
  FileText,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from './Toast';

export interface CalendarTopicItem {
  id: string;
  title: string;
  platform: 'YouTube' | 'Instagram' | 'Facebook' | 'TikTok';
  videoFormat: 'LONG_FORM_16_9' | 'SHORT_VERTICAL_9_16';
  scheduledDate: string;
  targetDuration: number;
  niche: string;
  status: 'READY' | 'QUEUED' | 'GENERATING' | 'FAILED';
}

interface ContentCalendarImporterProps {
  niche?: string;
  targetAudience?: string;
  growthGoal?: string;
  onImportComplete?: (items: CalendarTopicItem[]) => void;
}

export function ContentCalendarImporter({
  niche = 'AI & Technology',
  targetAudience = 'Tech Enthusiasts',
  growthGoal = 'SUBSCRIBERS',
  onImportComplete,
}: ContentCalendarImporterProps) {
  const { success, error, info } = useToast();
  const [rawText, setRawText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkEnqueueing, setIsBulkEnqueueing] = useState(false);
  const [parsedItems, setParsedItems] = useState<CalendarTopicItem[]>([
    {
      id: 'cal-item-1',
      title: 'Top 5 AI Automation Tools Every Creator Needs in 2026',
      platform: 'YouTube',
      videoFormat: 'LONG_FORM_16_9',
      scheduledDate: '2026-08-17',
      targetDuration: 8,
      niche: niche,
      status: 'READY',
    },
    {
      id: 'cal-item-2',
      title: '3 Secret Productivity Shortcuts You Didnt Know! #Shorts',
      platform: 'Instagram',
      videoFormat: 'SHORT_VERTICAL_9_16',
      scheduledDate: '2026-08-18',
      targetDuration: 1,
      niche: niche,
      status: 'READY',
    },
    {
      id: 'cal-item-3',
      title: 'How Quantum AI Computing Will Change Software Forever',
      platform: 'Facebook',
      videoFormat: 'LONG_FORM_16_9',
      scheduledDate: '2026-08-19',
      targetDuration: 10,
      niche: niche,
      status: 'READY',
    },
  ]);

  // AI Auto-Generate 7-Day Calendar
  const handleAIGenerateCalendar = async () => {
    setIsGenerating(true);
    info('Generating Content Calendar', `Synthesizing 7 viral topics optimized for ${growthGoal}...`);

    try {
      // Simulate AI structured generation based on Niche and Goal
      await new Promise((res) => setTimeout(res, 1200));

      const newTopics: CalendarTopicItem[] = [
        {
          id: `ai-${Date.now()}-1`,
          title: `Why ${niche} will explode in 2026 (Full Breakdown)`,
          platform: 'YouTube',
          videoFormat: 'LONG_FORM_16_9',
          scheduledDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
          targetDuration: 10,
          niche,
          status: 'READY',
        },
        {
          id: `ai-${Date.now()}-2`,
          title: `3 Mind-Blowing ${niche} Hacks in 30 Seconds! #Shorts`,
          platform: 'TikTok',
          videoFormat: 'SHORT_VERTICAL_9_16',
          scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          targetDuration: 1,
          niche,
          status: 'READY',
        },
        {
          id: `ai-${Date.now()}-3`,
          title: `Are human workers being replaced? The Truth for ${targetAudience}`,
          platform: 'Instagram',
          videoFormat: 'SHORT_VERTICAL_9_16',
          scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          targetDuration: 1,
          niche,
          status: 'READY',
        },
        {
          id: `ai-${Date.now()}-4`,
          title: `Step-by-Step ${niche} Masterclass for Beginners`,
          platform: 'YouTube',
          videoFormat: 'LONG_FORM_16_9',
          scheduledDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
          targetDuration: 12,
          niche,
          status: 'READY',
        },
        {
          id: `ai-${Date.now()}-5`,
          title: `How to 10x your speed using ${niche} tools today`,
          platform: 'Facebook',
          videoFormat: 'LONG_FORM_16_9',
          scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          targetDuration: 8,
          niche,
          status: 'READY',
        },
      ];

      setParsedItems(newTopics);
      success('Content Calendar Ready! 🗓️', 'Generated 5 multi-platform optimized video schedules.');
    } catch (err) {
      error('Generation Failed', 'Could not generate calendar topics.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse Raw Pasted Text
  const handleParsePastedText = () => {
    if (!rawText.trim()) return;

    const lines = rawText.split('\n').filter((l) => l.trim().length > 3);
    const newItems: CalendarTopicItem[] = lines.map((line, idx) => {
      const isShort = line.toLowerCase().includes('short') || line.toLowerCase().includes('reel') || line.toLowerCase().includes('tiktok');
      let platform: CalendarTopicItem['platform'] = 'YouTube';
      if (line.toLowerCase().includes('instagram') || line.toLowerCase().includes('reel')) platform = 'Instagram';
      if (line.toLowerCase().includes('facebook')) platform = 'Facebook';
      if (line.toLowerCase().includes('tiktok')) platform = 'TikTok';

      return {
        id: `parsed-${Date.now()}-${idx}`,
        title: line.replace(/^(mon|tue|wed|thu|fri|sat|sun|day \d+:?|\d+\.|-)\s*/i, '').trim(),
        platform,
        videoFormat: isShort ? 'SHORT_VERTICAL_9_16' : 'LONG_FORM_16_9',
        scheduledDate: new Date(Date.now() + 86400000 * (idx + 1)).toISOString().split('T')[0],
        targetDuration: isShort ? 1 : 8,
        niche,
        status: 'READY',
      };
    });

    setParsedItems(newItems);
    setRawText('');
    success('Calendar Parsed! 🪄', `Imported ${newItems.length} topics into platform schedule.`);
  };

  // Bulk Enqueue Pipelines
  const handleBulkQueue = async () => {
    setIsBulkEnqueueing(true);
    info('Queueing Pipelines...', `Launching ${parsedItems.length} video generation jobs.`);

    try {
      for (const item of parsedItems) {
        await api.post('/pipeline/start', {
          topic: item.title,
          targetDuration: item.targetDuration,
          targetAudience,
          language: 'English',
          tone: 'High-energy, educational, engaging',
          runFullPipeline: true,
          tags: [item.platform.toLowerCase(), item.niche.toLowerCase(), 'calendar-auto'],
        });
      }

      setParsedItems((prev) => prev.map((it) => ({ ...it, status: 'QUEUED' })));
      success('All Pipelines Launched! 🚀', `Successfully queued ${parsedItems.length} videos in background worker queue.`);
      if (onImportComplete) onImportComplete(parsedItems);
    } catch (err: any) {
      error('Bulk Launch Error', err.response?.data?.message || 'Failed to launch pipelines for calendar items.');
    } finally {
      setIsBulkEnqueueing(false);
    }
  };

  const getPlatformIcon = (platform: CalendarTopicItem['platform']) => {
    switch (platform) {
      case 'YouTube':
        return <Youtube className="w-4 h-4 text-red-400" />;
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'Facebook':
        return <Facebook className="w-4 h-4 text-blue-400" />;
      default:
        return <Video className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl bg-slate-900/80 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-400" />
              Platform-Aware AI Content Calendar
            </span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Paste Content Calendar or Auto-Generate
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAIGenerateCalendar}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isGenerating ? 'Synthesizing...' : '✨ AI Generate 7-Day Calendar'}</span>
          </button>
        </div>
      </div>

      {/* Input Paste Area */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Paste Raw Calendar Notes / Topics List
        </label>
        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={3}
            placeholder={`Paste your schedule here:\nMonday: Top 5 AI Automation Tools (YouTube)\nWednesday: 3 Secret Code Hacks (Instagram Reels)\nFriday: Future of Quantum Computing (Facebook)`}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
          />
          {rawText.trim().length > 0 && (
            <button
              onClick={handleParsePastedText}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Parse Topics</span>
            </button>
          )}
        </div>
      </div>

      {/* Parsed Platform Routing Schedule Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Auto-Tagged Platform Video Queue ({parsedItems.length} Topics)
          </h4>
          <button
            onClick={handleBulkQueue}
            disabled={isBulkEnqueueing || parsedItems.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Rocket className="w-4 h-4 text-white" />
            <span>{isBulkEnqueueing ? 'Queueing Pipelines...' : '🚀 Launch All Pipelines'}</span>
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/60 divide-y divide-white/5">
          {parsedItems.map((item, idx) => (
            <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.scheduledDate}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{item.targetDuration} mins</span>
                  </div>
                </div>
              </div>

              {/* Platform Controls */}
              <div className="flex items-center gap-3">
                {/* Platform Selector */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white">
                  {getPlatformIcon(item.platform)}
                  <select
                    value={item.platform}
                    onChange={(e) => {
                      const newPlat = e.target.value as CalendarTopicItem['platform'];
                      setParsedItems((prev) =>
                        prev.map((it) => (it.id === item.id ? { ...it, platform: newPlat } : it)),
                      );
                    }}
                    className="bg-transparent border-none focus:outline-none text-xs font-bold text-white cursor-pointer"
                  >
                    <option value="YouTube" className="bg-slate-900 text-white">YouTube</option>
                    <option value="Instagram" className="bg-slate-900 text-white">Instagram Reels</option>
                    <option value="Facebook" className="bg-slate-900 text-white">Facebook Video</option>
                    <option value="TikTok" className="bg-slate-900 text-white">TikTok / Shorts</option>
                  </select>
                </div>

                {/* Aspect Ratio Badge */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase ${
                    item.videoFormat === 'SHORT_VERTICAL_9_16'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {item.videoFormat === 'SHORT_VERTICAL_9_16' ? '9:16 Vertical' : '16:9 Widescreen'}
                </span>

                {/* Status */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    item.status === 'QUEUED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.status}
                </span>

                <button
                  onClick={() => setParsedItems((prev) => prev.filter((it) => it.id !== item.id))}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
