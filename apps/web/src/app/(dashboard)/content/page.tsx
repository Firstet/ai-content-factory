'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Plus, Sparkles, Youtube, Instagram, Linkedin, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://169.58.142.29:3001/api';

export default function ContentPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/content/projects`);
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-indigo-400" /> Multi-Platform Content Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, adapt, and manage coordinated AI content campaigns across YouTube, Instagram, TikTok, LinkedIn, and Flyers.
          </p>
        </div>

        <Link
          href="/content/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Content Campaign
        </Link>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading content campaigns...</div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center space-y-4 rounded-3xl bg-slate-900/50 border border-white/10">
          <Layers className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
          <h2 className="text-lg font-bold text-white">No Content Campaigns Created Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "New Content Campaign" to generate your first multi-platform content suite tailored to your Brand and Niche.
          </p>
          <Link
            href="/content/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Create First Campaign <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/content/${proj.id}`}
              className="group p-6 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all backdrop-blur-xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    proj.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : proj.status === 'GENERATING'
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {proj.status}
                </span>

                <span className="text-[10px] font-bold text-slate-400">{proj.brand?.name || 'Brand'}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {proj.title}
                </h3>
                {proj.niche && <p className="text-xs text-indigo-400 mt-1 font-medium">{proj.niche.name}</p>}
              </div>

              {/* Outputs Summary */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {proj.platforms?.includes('YOUTUBE') && <Youtube className="w-4 h-4 text-red-400" />}
                  {proj.platforms?.includes('INSTAGRAM') && <Instagram className="w-4 h-4 text-pink-400" />}
                  {proj.platforms?.includes('LINKEDIN') && <Linkedin className="w-4 h-4 text-blue-400" />}
                </div>

                <span className="font-bold text-slate-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Campaign <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
