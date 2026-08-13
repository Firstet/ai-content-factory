'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Video as VideoIcon, Play, ExternalLink, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);

  async function loadVideos() {
    try {
      const res = await api.get('/videos');
      setVideos(res.data);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-indigo-400" />
              Generated Videos Repository
            </h1>
            <p className="text-xs text-slate-400 mt-1">Browse, view scripts, monitor renders, and manage all videos.</p>
          </div>
          <Link
            href="/content/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>New Video</span>
          </Link>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No videos generated yet. Launch one from the dashboard!</td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      <Link href={`/pipeline/${v.id}`} className="hover:text-indigo-400 transition-colors">
                        {v.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{v.brand?.name || 'Default Brand'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        v.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : v.status === 'RENDERED'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : v.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{v.durationSeconds ? `${v.durationSeconds}s` : 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/pipeline/${v.id}`} className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                          Monitor <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
