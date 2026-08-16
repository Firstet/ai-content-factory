'use client';

import React from 'react';
import { Target, Users, TrendingUp, MessageSquare, UserPlus, Eye, DollarSign, Sparkles } from 'lucide-react';

export type GrowthGoal = 'SUBSCRIBERS' | 'ENGAGEMENT' | 'VIEWS' | 'MONETIZATION';

export interface StrategicGoalSelectorProps {
  niche: string;
  setNiche: (niche: string) => void;
  targetAudience: string;
  setTargetAudience: (audience: string) => void;
  growthGoal: GrowthGoal;
  setGrowthGoal: (goal: GrowthGoal) => void;
  compact?: boolean;
}

export const GROWTH_GOALS = [
  {
    id: 'SUBSCRIBERS' as GrowthGoal,
    title: 'Subscriber & Channel Growth',
    icon: UserPlus,
    description: 'High-value educational structure with strong subscribe CTAs & end screen teasers.',
    color: 'from-purple-500 to-indigo-500',
    badge: 'High Conversion',
  },
  {
    id: 'ENGAGEMENT' as GrowthGoal,
    title: 'High Comments & Debate',
    icon: MessageSquare,
    description: 'Hooks with controversial questions & open debate prompts to boost algorithm comments.',
    color: 'from-pink-500 to-rose-500',
    badge: 'Algorithm Boost',
  },
  {
    id: 'VIEWS' as GrowthGoal,
    title: 'Maximum Views & Viral Reach',
    icon: Eye,
    description: 'Curiosity-gap hooks, fast visual scene switches, and trending viral topics.',
    color: 'from-cyan-500 to-blue-500',
    badge: 'Viral Focus',
  },
  {
    id: 'MONETIZATION' as GrowthGoal,
    title: 'Monetization & Sales',
    icon: DollarSign,
    description: 'Problem-solution storytelling with mid-roll sponsor prompts & lead magnet links.',
    color: 'from-emerald-500 to-teal-500',
    badge: 'High RPM',
  },
];

const PRESET_NICHES = [
  'Tech & AI Innovations',
  'Personal Finance & Crypto',
  'Business & Entrepreneurship',
  'Gaming & Esports',
  'Health & Fitness',
  'Self-Improvement & Productivity',
  'History & Science Mysteries',
];

export function StrategicGoalSelector({
  niche,
  setNiche,
  targetAudience,
  setTargetAudience,
  growthGoal,
  setGrowthGoal,
  compact = false,
}: StrategicGoalSelectorProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Target className="w-3 h-3 text-indigo-400" />
              Strategic AI Optimizer
            </span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            Target Audience, Niche & Growth Objectives
          </h3>
        </div>
        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Niche Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Content Niche / Category
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. AI Tools & Automation, Personal Finance"
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_NICHES.slice(0, 4).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setNiche(item)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  niche === item
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Target Audience Profile
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. Developers & Tech Enthusiasts aged 20-35"
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Tech Enthusiasts', 'Gen-Z Creators', 'Busy Professionals', 'Beginner Investors'].map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setTargetAudience(aud)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  targetAudience === aud
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Channel Growth Objective */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Select Primary Channel Goal (AI Prompt Tailoring)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GROWTH_GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = growthGoal === goal.id;
            return (
              <div
                key={goal.id}
                onClick={() => setGrowthGoal(goal.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative group ${
                  isSelected
                    ? `bg-slate-950 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]`
                    : `bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-950/90`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${goal.color} flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      isSelected ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {goal.badge}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  {goal.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">{goal.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
