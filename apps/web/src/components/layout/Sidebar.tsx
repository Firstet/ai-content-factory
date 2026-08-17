import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Compass,
  Tv,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  Pin,
  PinOff,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Calendar', href: '/calendar', icon: Calendar, badge: 'Live' },
  { name: 'Content', href: '/content', icon: Layers, badge: null },
  { name: 'Niches', href: '/niches', icon: Compass, badge: 'Free' },
  { name: 'Channels', href: '/channels', icon: Tv, badge: null },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: '+18%' },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

interface SidebarProps {
  isExpanded: boolean;
  isPinned: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTogglePin: () => void;
}

export function Sidebar({
  isExpanded,
  isPinned,
  onMouseEnter,
  onMouseLeave,
  onTogglePin,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`border-r border-white/10 bg-slate-950/90 backdrop-blur-2xl flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-slate-950/95 overflow-hidden shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>

          {isExpanded && (
            <div className="min-w-0 transition-all duration-300">
              <h1 className="font-extrabold text-sm tracking-tight text-white truncate flex items-center gap-1.5">
                AI Content Studio
              </h1>
              <p className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase">Auto Studio v2.0</p>
            </div>
          )}
        </div>

        {/* Pin Toggle Button */}
        {isExpanded && (
          <button
            onClick={onTogglePin}
            title={isPinned ? 'Unpin Sidebar (Auto Retract)' : 'Pin Sidebar (Always Expanded)'}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              isPinned
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5 fill-indigo-400" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 overflow-x-hidden">
        <div>
          {isExpanded ? (
            <div className="px-3 mb-3 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all">
              Studio Navigation
            </div>
          ) : (
            <div className="h-4 mb-2" />
          )}

          <nav className="space-y-2">
            {mainNav.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!isExpanded ? item.name : undefined}
                  className={`flex items-center ${
                    isExpanded ? 'justify-between px-3.5' : 'justify-center px-0'
                  } py-3 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-indigo-600/20 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
                    {isExpanded && <span className="truncate">{item.name}</span>}
                  </div>

                  {isExpanded && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                        active
                          ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {!isExpanded && active && (
                    <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-md shadow-indigo-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Studio Status Footer */}
      <div className="p-3.5 border-t border-white/10 bg-slate-950/95 overflow-hidden shrink-0">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} text-[11px] text-slate-400`}>
          <span className="flex items-center gap-2 font-bold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-500 shrink-0" />
            {isExpanded && <span>Autopilot Active</span>}
          </span>

          {isExpanded && (
            <span className="font-mono text-[10px] text-indigo-400 font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              LIVE
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
