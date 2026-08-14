'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Tv,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Calendar', href: '/calendar', icon: Calendar, badge: 'Live' },
  { name: 'Content', href: '/content', icon: Layers, badge: null },
  { name: 'Channels', href: '/channels', icon: Tv, badge: null },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: '+18%' },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10 bg-slate-950/90">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            AI Content Studio
          </h1>
          <p className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase">Auto Studio v2.0</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-6 space-y-6">
        <div>
          <div className="px-3 mb-3 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            Studio Navigation
          </div>
          <nav className="space-y-1.5">
            {mainNav.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-indigo-600/20 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        active
                          ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Studio Status Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-950/90">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-2 font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-500"></span>
            Autopilot Active
          </span>
          <span className="font-mono text-[10px] text-indigo-400 font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
            LIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
