'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { HardDrive, FileAudio, FileImage, Video, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

export default function StorageAdminPage() {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/assets');
        setAssets(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const getIcon = (type: string) => {
    if (type === 'AUDIO') return <FileAudio className="w-4 h-4 text-purple-400" />;
    if (type === 'IMAGE' || type === 'THUMBNAIL') return <FileImage className="w-4 h-4 text-cyan-400" />;
    return <Video className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            MinIO Asset Storage Browser
          </h1>
          <p className="text-xs text-slate-400 mt-1">S3-compatible audio, image, thumbnail, and video asset repository.</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Asset Key</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">MIME</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No assets stored in MinIO yet.</td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-200 truncate max-w-xs">{a.key}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                        {getIcon(a.type)}
                        <span>{a.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{a.mimeType}</td>
                    <td className="px-6 py-4 text-slate-400">{(Number(a.sizeBytes) / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-6 py-4">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
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
