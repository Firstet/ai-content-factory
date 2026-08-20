'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('acf_sidebar_pinned');
      if (saved !== null) {
        setIsSidebarPinned(saved === 'true');
      }
    }
  }, []);

  const handleTogglePin = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('acf_sidebar_pinned', String(next));
      }
      return next;
    });
  };

  const isExpanded = isSidebarPinned || isSidebarHovered || isMobileOpen;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex relative overflow-x-hidden">
      {/* Ambient Glow Orbs Background */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/3 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <Sidebar
        isExpanded={isExpanded}
        isPinned={isSidebarPinned}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        onTogglePin={handleTogglePin}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300 ease-in-out ${
          isSidebarPinned ? 'md:pl-64 pl-0' : 'md:pl-20 pl-0'
        }`}
      >
        <Header onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
