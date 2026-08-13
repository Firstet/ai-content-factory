'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Share2, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

export default function PublishingAdminPage() {
  const [uploads, setUploads] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/publishing');
        setUploads(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            Cross-Platform Publishing Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitor scheduled and completed uploads across YouTube, TikTok, Instagram, and X.</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Video Title</th>
                <th className="px-6 py-4 font-semibold">Platform</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Published At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No uploads recorded yet.</td>
                </tr>
              ) : (
                uploads.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{u.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                        {u.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {u.publishedAt ? new Date(u.publishedAt).toLocaleString() : 'Pending'}
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
