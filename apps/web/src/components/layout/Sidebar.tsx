import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Search,
  FolderOpen,
  Wand2,
  Video,
  Share2,
  Sparkles,
  Building2,
  Compass,
  Tv,
  BarChart3,
  Cpu,
  Settings,
  Pin,
  PinOff,
} from 'lucide-react';

const navGroups = [
  {
    title: 'WORKSPACE',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Content', href: '/content', icon: Layers },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
      { name: 'Research', href: '/research', icon: Search },
      { name: 'Assets', href: '/assets', icon: FolderOpen },
    ],
  },
  {
    title: 'CREATE',
    items: [
      { name: 'Content Studio', href: '/content/wizard', icon: Wand2, badge: 'AI' },
      { name: 'Video', href: '/videos', icon: Video },
      { name: 'Campaigns', href: '/content/new', icon: Sparkles },
    ],
  },
  {
    title: 'BRAND',
    items: [
      { name: 'Brand Kit', href: '/settings?tab=brand', icon: Building2 },
      { name: 'Niches', href: '/niches', icon: Compass },
      { name: 'Channels', href: '/channels', icon: Tv },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'AI Providers', href: '/settings?tab=providers', icon: Cpu },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isExpanded: boolean;
  isPinned: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTogglePin: () => void;
}

export function Sidebar({
  isExpanded,
  isPinned,
  isMobileOpen,
  onCloseMobile,
  onMouseEnter,
  onMouseLeave,
  onTogglePin,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`border-r border-slate-800 bg-[#0b1220] flex flex-col h-screen fixed left-0 top-0 z-50 shadow-xl transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'w-64 translate-x-0' : isExpanded ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-[#111827] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>

            {isExpanded && (
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm text-slate-100 truncate">
                  AI Content OS
                </h1>
                <p className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">Operating System</p>
              </div>
            )}
          </div>

          {/* Pin Toggle Button */}
          {isExpanded && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
              className={`p-1.5 rounded-md text-xs transition-all ${
                isPinned
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5 fill-blue-400" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 overflow-x-hidden">
          {navGroups.map((group) => (
            <div key={group.title}>
              {isExpanded ? (
                <div className="px-3 mb-2 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                  {group.title}
                </div>
              ) : (
                <div className="h-3 mb-1" />
              )}

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name + item.href}
                      href={item.href}
                      title={!isExpanded ? item.name : undefined}
                      className={`flex items-center ${
                        isExpanded ? 'justify-between px-3' : 'justify-center px-0'
                      } py-2 rounded-lg text-xs font-semibold transition-all duration-150 group relative ${
                        active
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        {isExpanded && <span className="truncate">{item.name}</span>}
                      </div>

                      {isExpanded && item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {item.badge}
                        </span>
                      )}

                      {!isExpanded && active && (
                        <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* System Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#111827] shrink-0">
          <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} text-[11px] text-slate-400`}>
            <span className="flex items-center gap-2 font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {isExpanded && <span>Engine Ready</span>}
            </span>

            {isExpanded && (
              <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                v2.5
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
