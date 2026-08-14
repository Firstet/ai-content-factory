'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Building2, Plus, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [voiceTone, setVoiceTone] = useState('Professional, engaging, authoritative');
  const [niche, setNiche] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadBrands() {
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      await api.post('/brands', { name, voiceTone, niche, watermarkUrl });
      setName('');
      setNiche('');
      setWatermarkUrl('');
      loadBrands();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Brand Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure brand identities, voice tones, and video rendering strategies.</p>
          </div>
        </div>

        {/* Create Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Create New Brand Profile</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. TechPulse AI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Niche / Audience</label>
              <input
                type="text"
                placeholder="e.g. AI Tools & Tech Automation"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo / Watermark URL</label>
              <input
                type="text"
                placeholder="https://brand.com/logo.png"
                value={watermarkUrl}
                onChange={(e) => setWatermarkUrl(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Brand Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Brands List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b) => (
            <div key={b.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">{b.name}</h3>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {b.videoStrategy || 'FFMPEG_ASSEMBLY'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Voice Tone: <span className="text-slate-200">{b.voiceTone}</span></p>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Channels: {b.channels?.length || 0}</span>
                <span>Videos: {b._count?.videos || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
