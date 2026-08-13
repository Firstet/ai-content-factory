'use client';

import { Bell, Search, UserCheck, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search videos, brands, queues, logs..."
          className="w-full bg-slate-900/80 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </div>

      {/* Actions & User menu */}
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-1.5 right-1.5"></span>
        </button>

        <div className="h-4 w-px bg-white/10"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user?.name || 'Super Admin'}</p>
            <p className="text-[10px] text-indigo-400 font-medium">{user?.role || 'SUPER_ADMIN'}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
