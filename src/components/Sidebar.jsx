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
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ClinicLogo from './ClinicLogo';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'OPD Live Queue', href: '/queue', icon: Clock, badge: 'Live' },
  { name: 'Doctor Consultation', href: '/consultation', icon: Stethoscope },
  { name: 'Patients Directory', href: '/patients', icon: Users },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileImage },
  { name: 'Billing & Invoices', href: '/billing', icon: Receipt },
  { name: 'Lab Reports', href: '/lab-reports', icon: FlaskConical },
  { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 hidden md:flex flex-col bg-[#0b1329]/95 border-r border-slate-800/80 backdrop-blur-xl transition-all duration-300">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-5 gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-700/25 p-1 ring-1 ring-blue-500/30">
          <ClinicLogo className="w-8 h-8" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-sm tracking-tight text-white truncate font-serif">
            Skin & HIV Care
          </span>
          <span className="text-[11px] text-blue-400 font-semibold truncate">
            Dr. Amitabh Upadhyay
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Clinic Console
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
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/15 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Doctor & Admin Session Info Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 m-3 rounded-2xl border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-700/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">
              Dr. Amitabh Upadhyay
            </p>
            <p className="text-[10px] text-blue-400 truncate font-mono">
              Main OPD Desk
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
