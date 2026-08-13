'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
