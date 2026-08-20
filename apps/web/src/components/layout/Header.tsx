'use client';

import { useState } from 'react';
import { Bell, Search, PlusCircle, LogOut, Zap, Play, Pause, Menu } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user, logout } = useAppStore();
  const router = useRouter();
  const [automationActive, setAutomationActive] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu Button & Search Bar */}
      <div className="flex items-center gap-3 w-auto md:w-80">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white md:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search content plans, scheduled posts, channels..."
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Center/Right Actions & User Controls */}
      <div className="flex items-center gap-4">
        {/* Automation Pause/Resume Button */}
        <button
          onClick={() => setAutomationActive(!automationActive)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 ${
            automationActive
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          {automationActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Automation Running</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-amber-400" />
              <span>Automation Paused</span>
            </>
          )}
        </button>

        {/* Quick Create Button */}
        <Link
          href="/content/wizard"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Content Plan</span>
        </Link>

        <div className="h-4 w-px bg-white/10"></div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.name?.[0] || 'C'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.name || 'Content Studio'}</p>
            <p className="text-[10px] text-indigo-400 font-semibold">{user?.role || 'Creator'}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
