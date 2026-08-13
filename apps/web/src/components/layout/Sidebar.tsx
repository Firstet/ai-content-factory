'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Tv,
  FileCode2,
  Cpu,
  KeyRound,
  ListTodo,
  BarChart3,
  Share2,
  HardDrive,
  Terminal,
  CreditCard,
  Settings,
  Sparkles,
  PlusCircle,
  Video,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Create Content', href: '/content/new', icon: PlusCircle, badge: 'New' },
  { name: 'Videos', href: '/videos', icon: Video },
];

const adminNav = [
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck },
  { name: 'Brands', href: '/admin/brands', icon: Building2 },
  { name: 'Channels', href: '/admin/channels', icon: Tv },
  { name: 'Prompt Library', href: '/admin/prompts', icon: FileCode2 },
  { name: 'AI Providers', href: '/admin/providers', icon: Cpu },
  { name: 'API Key Vault', href: '/admin/api-keys', icon: KeyRound },
  { name: 'Queues & Jobs', href: '/admin/queues', icon: ListTodo },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Publishing', href: '/admin/publishing', icon: Share2 },
  { name: 'Storage', href: '/admin/storage', icon: HardDrive },
  { name: 'System Logs', href: '/admin/logs', icon: Terminal },
  { name: 'Billing Ready', href: '/admin/billing', icon: CreditCard },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
            Content Factory
          </h1>
          <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">Super Admin OS</p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Overview
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Administration
          </div>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / System Health */}
      <div className="p-4 border-t border-white/10 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Active
          </span>
          <span className="font-mono text-[10px] text-slate-500">v1.0.0-prod</span>
        </div>
      </div>
    </aside>
  );
}
