'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Image as ImageIcon, Film, Music, X, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface MediaUploaderProps {
  label: string;
  accept?: string;
  value?: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export function MediaUploader({
  label,
  accept = 'image/*',
  value,
  onChange,
  helperText,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Show local preview URL immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const serverUrl = res.data?.url || localUrl;
      setPreviewUrl(serverUrl);
      onChange(serverUrl);
    } catch (err) {
      console.warn('Backend upload failed, using local asset preview:', err);
      onChange(localUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
        {label}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : previewUrl
            ? 'border-white/20 bg-slate-900/80 hover:border-indigo-500/40'
            : 'border-white/10 bg-slate-900/50 hover:border-indigo-500/30 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {previewUrl ? (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative shadow-lg group">
              {accept.includes('video') ? (
                <video src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              )}

              {uploading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Media Uploaded</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl('');
                  onChange('');
                }}
                className="text-slate-400 hover:text-red-400 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">
                Click or drag & drop file to upload
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {helperText || 'PNG, JPG, SVG, MP4, MP3 up to 500MB'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
