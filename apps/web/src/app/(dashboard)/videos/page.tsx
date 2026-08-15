'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Video as VideoIcon, Play, Trash2, Sparkles, PlusCircle, Eye, Film } from 'lucide-react';
import { api } from '@/lib/api';
import { ContentPreviewModal } from '@/components/common/ContentPreviewModal';
import Link from 'next/link';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  async function loadVideos() {
    try {
      const res = await api.get('/videos');
      setVideos(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      loadVideos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <VideoIcon className="w-3.5 h-3.5 text-indigo-400" />
                Rendered Studio Repository
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Generated Videos Repository
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Browse, monitor, and manage all rendered videos and shorts created by your AI Content Studio.
            </p>
          </div>

          <Link
            href="/content/wizard"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Launch Content Wizard</span>
          </Link>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Video Title</th>
                <th className="px-6 py-4 font-bold">Brand</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Duration</th>
                <th className="px-6 py-4 font-bold">Created Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    No videos generated yet. Launch your first content plan from the dashboard!
                  </td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <Link href="/dashboard" className="hover:text-indigo-300 transition-colors">
                        {v.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{v.brand?.name || 'Primary Studio Brand'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          v.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : v.status === 'RENDERED'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : v.status === 'FAILED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {v.durationSeconds ? `${v.durationSeconds}s` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedVideo(v)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* In-App Content Previewer Modal */}
        <ContentPreviewModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo?.title || 'Video Content Preview'}
          videoUrl={selectedVideo?.videoUrl}
          audioUrl={selectedVideo?.audioUrl}
        />
      </div>
    </Shell>
  );
}
