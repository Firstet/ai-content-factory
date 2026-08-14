'use client';

import { ToastProvider } from '@/components/common/Toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
