'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Video,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface CalendarItem {
  id: string;
  title: string;
  type: 'LONG_VIDEO' | 'SHORT_VIDEO';
  platform: 'YouTube' | 'TikTok' | 'Instagram';
  scheduledTime: string;
  date: number; // day of month
  status:
    | 'Scheduled'
    | 'Researching'
    | 'Writing Script'
    | 'Generating Voice'
    | 'Generating Images'
    | 'Rendering'
    | 'Uploading'
    | 'Published'
    | 'Failed';
  thumbnail: string;
  scriptSnippet?: string;
  tags?: string[];
}

export default function CalendarWorkspacePage() {
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [currentMonth, setCurrentMonth] = useState('August 2026');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // Calendar Items Data
  const calendarItems: CalendarItem[] = [
    {
      id: 'cal-1',
      title: 'Top 5 AI Automation Hacks for 2026',
      type: 'LONG_VIDEO',
      platform: 'YouTube',
      scheduledTime: '18:00 PM',
      date: 14,
      status: 'Rendering',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      scriptSnippet:
        'In this video, we reveal the top 5 AI productivity tools that will automate 80% of your workflow in 2026...',
      tags: ['ai tools', 'automation', 'productivity'],
    },
    {
      id: 'cal-2',
      title: '3 Secret Code Hacks You Didnt Know! #Shorts',
      type: 'SHORT_VIDEO',
      platform: 'TikTok',
      scheduledTime: '09:00 AM',
      date: 15,
      status: 'Writing Script',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      scriptSnippet: 'Stop writing boilerplate code! Here are 3 instant terminal shortcuts for developers...',
      tags: ['shorts', 'coding', 'tech'],
    },
    {
      id: 'cal-3',
      title: 'How NVIDIA Quantum AI is Changing Everything',
      type: 'LONG_VIDEO',
      platform: 'YouTube',
      scheduledTime: '18:00 PM',
      date: 16,
      status: 'Scheduled',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      scriptSnippet: 'Quantum computing is no longer science fiction. NVIDIA just announced groundbreaking chips...',
      tags: ['nvidia', 'quantum', 'ai'],
    },
    {
      id: 'cal-4',
      title: 'AI vs Human Graphic Designers Test #Shorts',
      type: 'SHORT_VIDEO',
      platform: 'Instagram',
      scheduledTime: '12:00 PM',
      date: 17,
      status: 'Scheduled',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      scriptSnippet: 'Can AI generate better logos than human designers? We put Midjourney to the test...',
      tags: ['design', 'ai', 'reels'],
    },
    {
      id: 'cal-5',
      title: 'The Ultimate AI Content Engine Walkthrough',
      type: 'LONG_VIDEO',
      platform: 'YouTube',
      scheduledTime: '18:00 PM',
      date: 12,
      status: 'Published',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      scriptSnippet: 'Watch how our autonomous AI factory creates, edits, renders, and uploads content automatically...',
      tags: ['youtube', 'content', 'automation'],
    },
  ];

  // Helper status badge color
  const getStatusBadge = (status: CalendarItem['status']) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Rendering':
      case 'Generating Voice':
      case 'Generating Images':
      case 'Writing Script':
      case 'Researching':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Shell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Workspace Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                Notion & Buffer Workspace
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Content Publishing Calendar
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Modes */}
            <div className="p-1 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-1">
              {(['MONTH', 'WEEK', 'DAY'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white">
              <button className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{currentMonth}</span>
              <button className="text-slate-400 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/content/wizard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Post</span>
            </Link>
          </div>
        </div>

        {/* Calendar Grid Workspace */}
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 bg-slate-950/80 border-b border-white/10 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider text-center py-3">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/5 bg-slate-950/30">
            {daysInMonth.map((day) => {
              const itemsOnDay = calendarItems.filter((item) => item.date === day);
              const isToday = day === 14;

              return (
                <div
                  key={day}
                  className={`min-h-[130px] p-2.5 transition-all flex flex-col justify-between group ${
                    isToday ? 'bg-indigo-950/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </span>

                    {itemsOnDay.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500">{itemsOnDay.length} posts</span>
                    )}
                  </div>

                  {/* Scheduled Items Cards */}
                  <div className="space-y-1.5 flex-1">
                    {itemsOnDay.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="cursor-pointer p-2 rounded-xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/50 transition-all shadow-md hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[9px] font-black text-indigo-300 truncate">
                            {item.scheduledTime}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${getStatusBadge(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-indigo-300">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel Detail Drawer */}
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end">
            <div className="w-full max-w-md bg-slate-900 border-l border-white/10 h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${getStatusBadge(
                      selectedItem.status,
                    )}`}
                  >
                    {selectedItem.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{selectedItem.platform}</span>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Preview */}
              <div className="space-y-3">
                <h2 className="text-lg font-black text-white">{selectedItem.title}</h2>
                <div className="w-full h-44 rounded-2xl bg-slate-950 overflow-hidden border border-white/10 relative">
                  <img
                    src={selectedItem.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 text-[10px] font-mono text-white font-bold border border-white/10">
                    Scheduled: {selectedItem.scheduledTime}
                  </div>
                </div>
              </div>

              {/* Generated Script Snippet */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  AI Generated Script Preview
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-sans leading-relaxed">
                  "{selectedItem.scriptSnippet}"
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  SEO Tags & Hashtags
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => alert('Post rescheduled for tomorrow!')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-all"
                >
                  Reschedule Time
                </button>
                <button
                  onClick={() => alert('Triggering instant retry...')}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
