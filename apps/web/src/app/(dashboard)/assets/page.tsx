'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { FolderOpen, Image as ImageIcon, Video, Music2, Upload, FileText, Trash2 } from 'lucide-react';
import { MediaUploader } from '@/components/common/MediaUploader';

export default function AssetsLibraryPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO'>('ALL');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const sampleAssets = [
    { id: '1', name: 'Brand Logo Dark.png', type: 'IMAGE', size: '240 KB', date: '2026-08-19', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200' },
    { id: '2', name: 'Watermark Overlay.png', type: 'IMAGE', size: '110 KB', date: '2026-08-18', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200' },
    { id: '3', name: 'Tech B-Roll Lab Shot.mp4', type: 'VIDEO', size: '14.2 MB', date: '2026-08-17', url: '' },
    { id: '4', name: 'Upbeat Tech Audio Bed.mp3', type: 'AUDIO', size: '3.1 MB', date: '2026-08-16', url: '' },
  ];

  const filtered = sampleAssets.filter((a) => activeTab === 'ALL' || a.type === activeTab);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                Asset Vault
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-1">
              <FolderOpen className="w-6 h-6 text-blue-400" /> Media Asset Library
            </h1>
            <p className="text-xs text-slate-400">
              Manage brand logos, background watermarks, B-roll clips, and audio tracks across projects.
            </p>
          </div>
        </div>

        {/* Upload New Asset Container */}
        <div className="saas-card p-6 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Upload New Asset</h2>
          <MediaUploader
            label="Drag & Drop Media Files"
            accept="image/*,video/*,audio/*"
            value={uploadedUrl}
            onChange={(url) => setUploadedUrl(url)}
            helperText="Supports PNG, JPG, MP4, MP3, WAV"
          />
        </div>

        {/* Filter Tabs & Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'ALL', label: 'All Media' },
              { id: 'IMAGE', label: 'Images & Logos' },
              { id: 'VIDEO', label: 'B-Roll & Video' },
              { id: 'AUDIO', label: 'Audio & Music' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map((asset) => (
              <div key={asset.id} className="saas-card p-4 border border-slate-800 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    {asset.type === 'IMAGE' && <ImageIcon className="w-5 h-5 text-blue-400" />}
                    {asset.type === 'VIDEO' && <Video className="w-5 h-5 text-purple-400" />}
                    {asset.type === 'AUDIO' && <Music2 className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-200 truncate">{asset.name}</h3>
                    <span className="text-[10px] text-slate-500">{asset.size} • {asset.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[10px] font-semibold text-slate-400">{asset.type}</span>
                  <button className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
