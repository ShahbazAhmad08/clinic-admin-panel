'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const isPublicRoute = pathname === '/login' || pathname === '/display';

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isPublicRoute, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b0f19] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs mt-4 font-medium tracking-wide">Loading ArogyaCare Clinic Desk...</p>
      </div>
    );
  }

  // If on login or display screen, render full screen without admin shell
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If not authenticated and not public route, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0b0f19] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Protected Admin Layout
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
