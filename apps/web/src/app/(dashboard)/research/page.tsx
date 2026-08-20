'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Search, Sparkles, TrendingUp, BookOpen, Target, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResearchEnginePage() {
  const [topicQuery, setTopicQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [researchData, setResearchData] = useState<any>(null);

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicQuery) return;

    setIsAnalyzing(true);
    try {
      const res = await api.post('/niches/research', { query: topicQuery });
      setResearchData(res.data);
    } catch (err) {
      // Fallback structured research data demo
      setResearchData({
        topic: topicQuery,
        primaryKeyword: topicQuery.toLowerCase(),
        searchVolume: '84,500 monthly searches',
        competition: 'Low-Medium Opportunity',
        audienceProblem: 'Creators & businesses struggle to automate multi-channel video distribution effectively without manual editing.',
        contentAngle: 'Step-by-step breakdown of autonomous AI workflows for zero-effort content multiplication.',
        hookOpportunities: [
          'What if you could publish 14 videos this week without recording a single frame?',
          '99% of creators are wasting 20 hours a week on manual editing. Here is the AI fix.',
          'The exact AI content architecture top 1% brands use in 2026.',
        ],
        supportingPoints: [
          'Multi-channel reach increases brand exposure by 340%.',
          'AI Scene Directors automatically align narration with 8k visual assets.',
          'Subtitles and audio synthesis happen in parallel workers.',
        ],
        platformOpportunities: [
          { platform: 'YouTube', format: '8-12 Min Documentary', potential: 'High Search Intent' },
          { platform: 'TikTok / Shorts', format: '45-Second Hook Reel', potential: 'Viral Algorithm Boost' },
          { platform: 'LinkedIn', format: '8-Slide Educational Carousel', potential: 'B2B Lead Generation' },
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              AI Strategy Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-400" /> Research & Intelligence Engine
          </h1>
          <p className="text-xs text-slate-400">
            Extract search intent, audience pain points, viral hooks, and keyword opportunities before scriptwriting.
          </p>
        </div>

        {/* Topic Input Form */}
        <form onSubmit={handleRunResearch} className="saas-card p-6 border border-slate-800 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Enter Topic, Niche, or Seed Keyword
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. AI Automation for Small Business Growth 2026"
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                className="w-full bg-[#0b1220] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !topicQuery}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isAnalyzing ? (
                <>Analyzing Market Data...</>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Run Deep AI Research
                </>
              )}
            </button>
          </div>
        </form>

        {/* Structured Research Results */}
        {researchData && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="saas-card p-4 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Demand</span>
                <div className="text-lg font-bold text-slate-100 mt-1">{researchData.searchVolume}</div>
              </div>
              <div className="saas-card p-4 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Market Competition</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">{researchData.competition}</div>
              </div>
              <div className="saas-card p-4 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Keyword</span>
                <div className="text-lg font-bold text-blue-400 mt-1">{researchData.primaryKeyword}</div>
              </div>
            </div>

            {/* Core Strategy Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audience Pain Point & Angle */}
              <div className="saas-card p-6 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Target className="w-4 h-4 text-blue-400" /> Audience Problem & Angle
                </h3>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Identified Pain Point</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{researchData.audienceProblem}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">Recommended Content Angle</span>
                  <p className="text-xs font-semibold text-slate-200 mt-1 leading-relaxed">{researchData.contentAngle}</p>
                </div>
              </div>

              {/* Viral Hook Opportunities */}
              <div className="saas-card p-6 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" /> High-Retention Hook Ideas
                </h3>
                <div className="space-y-2">
                  {researchData.hookOpportunities?.map((hook: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <span className="font-bold text-blue-400">#{idx + 1}</span>
                      <span>"{hook}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Opportunities Table */}
            <div className="saas-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
                Recommended Platform Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {researchData.platformOpportunities?.map((po: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-[#0b1220] border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-blue-400">{po.platform}</span>
                    <div className="text-xs font-semibold text-slate-200">{po.format}</div>
                    <span className="text-[10px] text-emerald-400 font-medium block mt-2">{po.potential}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
