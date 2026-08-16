'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const isExpanded = isSidebarPinned || isSidebarHovered;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex relative overflow-x-hidden">
      {/* Ambient Glow Orbs Background */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/3 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <Sidebar
        isExpanded={isExpanded}
        isPinned={isSidebarPinned}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        onTogglePin={() => setIsSidebarPinned((prev) => !prev)}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300 ease-in-out ${
          isExpanded ? 'pl-64' : 'pl-20'
        }`}
      >
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
