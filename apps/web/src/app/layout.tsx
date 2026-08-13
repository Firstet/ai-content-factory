import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Content Factory — Production AI Operating System',
  description: 'Self-hosted AI content generation, rendering, and publishing OS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
