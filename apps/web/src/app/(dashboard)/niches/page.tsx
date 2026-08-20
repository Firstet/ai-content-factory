'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Compass, Sparkles, Plus, CheckCircle2, Search, ArrowRight, BrainCircuit, Users, Target, HelpCircle, Layers } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function NichesPage() {
  const [niches, setNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState<any>(null);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState('Technology');
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchNiches();
  }, []);

  const fetchNiches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/niches`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNiches(data);
        if (data.length > 0) setSelectedNiche(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch niches', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName) return;
    try {
      const res = await fetch(`${API_BASE}/niches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName, description: customDesc, category: customCategory }),
      });
      const created = await res.json();
      setCustomName('');
      setCustomDesc('');
      setIsCreating(false);
      fetchNiches();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshIntelligence = async (nicheId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/niches/${nicheId}/intelligence/refresh`, { method: 'POST' });
      const updatedIntel = await res.json();
      setSelectedNiche((prev: any) => ({ ...prev, intelligence: updatedIntel }));
      fetchNiches();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Shell>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Niche Selection & AI Intelligence
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-400" /> Niche Intelligence Studio
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Explore 18+ predefined industry niches or create your own. Our AI engine builds deep audience intelligence profiles, content gaps, search intents, and evergreen topics—completely free.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Custom Niche
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Niches Catalog */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Niche Catalog ({niches.length})</h2>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium">Loading niches...</div>
          ) : (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-2">
              {niches.map((niche) => {
                const isSelected = selectedNiche?.id === niche.id;
                return (
                  <button
                    key={niche.id}
                    onClick={() => setSelectedNiche(niche)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{niche.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300">
                        {niche.category}
                      </span>
                    </div>
                    {niche.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{niche.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Niche Intelligence Deep Dive */}
        <div className="lg:col-span-8">
          {selectedNiche ? (
            <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">{selectedNiche.category}</span>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedNiche.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedNiche.description}</p>
                </div>

                <button
                  onClick={() => handleRefreshIntelligence(selectedNiche.id)}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 font-bold text-xs transition-all disabled:opacity-50"
                >
                  <BrainCircuit className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyzing Niche...' : 'Generate/Refresh AI Intelligence'}
                </button>
              </div>

              {/* Intelligence Grid */}
              {selectedNiche.intelligence ? (
                <div className="space-y-6">
                  {/* Target Audience */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" /> Target Audience Profile
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedNiche.intelligence.audienceDescription}</p>
                  </div>

                  {/* 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pain Points */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Audience Pain Points
                      </h4>
                      <ul className="space-y-2">
                        {selectedNiche.intelligence.painPoints.map((item: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-rose-400 font-bold">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evergreen Topics */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Evergreen Content Series
                      </h4>
                      <ul className="space-y-2">
                        {selectedNiche.intelligence.evergreenTopics.map((item: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Search Intent */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Top Search Intent Queries
                      </h4>
                      <ul className="space-y-2">
                        {selectedNiche.intelligence.searchIntent.map((item: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span> "{item}"
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Content Gaps */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> High-Growth Content Gaps
                      </h4>
                      <ul className="space-y-2">
                        {selectedNiche.intelligence.contentGaps.map((item: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-purple-400 font-bold">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center space-y-4 rounded-2xl bg-slate-950/40 border border-dashed border-white/10">
                  <BrainCircuit className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
                  <div>
                    <h3 className="text-sm font-bold text-white">No AI Niche Intelligence Generated Yet</h3>
                    <p className="text-xs text-slate-400 mt-1">Click the button above to build deep audience, keyword, and topic intelligence for this niche.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">Select a niche from the catalog to inspect intelligence.</div>
          )}
        </div>
      </div>

      {/* Custom Niche Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-6">
            <h3 className="text-lg font-bold text-white">Create Custom Niche</h3>
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Niche Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Energy Tech"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Energy"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  placeholder="Short summary of target topic area..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm h-24 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Save Niche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Shell>
  );
}
