'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  Stethoscope,
  FileImage,
  Receipt,
  FlaskConical,
  BarChart3,
  Tv,
  Settings,
  HeartPulse,
  PlusCircle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'OPD Live Queue', href: '/queue', icon: Clock, badge: 'Live' },
  { name: 'Doctor Consultation', href: '/consultation', icon: Stethoscope },
  { name: 'Patients Directory', href: '/patients', icon: Users },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileImage },
  { name: 'Billing & Invoices', href: '/billing', icon: Receipt },
  { name: 'Lab Reports', href: '/lab-reports', icon: FlaskConical },
  { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
  { name: 'Waiting Room TV', href: '/display', icon: Tv, external: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 hidden md:flex flex-col bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl ring-2 ring-cyan-400/20">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            Arogya<span className="text-cyan-400">Care</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Doctor & OPD Desk</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Doctor/Assistant Active Info Card */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 m-3 rounded-2xl border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-cyan-500/30">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Dr. Rajesh Sharma</p>
            <p className="text-[10px] text-cyan-400 truncate">Senior Physician • Cabin 1</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Online" />
        </div>
      </div>
    </aside>
  );
}
