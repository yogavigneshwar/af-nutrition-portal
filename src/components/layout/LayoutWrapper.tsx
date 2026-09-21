'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public fullscreen routes that should NOT render sidebar or header
  const isFullscreenRoute = pathname === '/login' || pathname === '/token-tv';

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated && !isFullscreenRoute) {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [mounted, isAuthenticated, pathname, isFullscreenRoute, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#02110c] flex items-center justify-center text-xs font-bold text-emerald-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span>Loading AF Nutrition System...</span>
        </div>
      </div>
    );
  }

  if (isFullscreenRoute) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // If not authenticated and on a protected route, show redirecting splash
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#02110c] flex items-center justify-center text-xs font-bold text-emerald-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span>Redirecting to Terminal Login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left Nav Sidebar */}
      <Sidebar />

      {/* Main Operational Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 bg-slate-50/60">
          {children}
        </main>
      </div>
    </div>
  );
};
