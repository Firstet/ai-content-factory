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
    <header className="h-16 border-b border-slate-800 bg-[#111827] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu Button & Search Bar */}
      <div className="flex items-center gap-3 w-auto md:w-80">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white md:hidden"
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
            className="w-full bg-[#0b1220] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Center/Right Actions & User Controls */}
      <div className="flex items-center gap-4">
        {/* Automation Pause/Resume Button */}
        <button
          onClick={() => setAutomationActive(!automationActive)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
            automationActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {automationActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Automation Active</span>
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
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Content Plan</span>
        </Link>

        <div className="h-4 w-px bg-slate-800"></div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300">
            {user?.name?.[0] || 'C'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-200">{user?.name || 'Content Studio'}</p>
            <p className="text-[10px] text-slate-400 font-medium">{user?.role || 'Creator'}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
