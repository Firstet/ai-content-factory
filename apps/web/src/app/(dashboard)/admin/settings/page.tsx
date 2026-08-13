'use client';

import { Shell } from '@/components/layout/Shell';
import { Settings, Save } from 'lucide-react';

export default function SettingsAdminPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            System Settings & Environment
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure global FFmpeg pathways, Redis URLs, MinIO endpoints, and retries.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-2">Max BullMQ Job Retries</label>
              <input
                type="number"
                defaultValue={3}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-2">FFmpeg Binary Path (Docker)</label>
              <input
                type="text"
                defaultValue="/usr/bin/ffmpeg"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-2">MinIO Asset Bucket Name</label>
              <input
                type="text"
                defaultValue="acf-assets"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-2">JWT Expiration Window</label>
              <input
                type="text"
                defaultValue="15m"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => alert('System settings updated')}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
