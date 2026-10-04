'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  PlusCircle,
  Bell,
  Clock,
  Menu,
  X,
  UserPlus,
  Stethoscope,
  ChevronDown,
  Calendar,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PatientModal from './PatientModal';
import QuickQueueModal from './QuickQueueModal';

export default function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const [time, setTime] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick live search for patients
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/patients?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.patients || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Global Live Search */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient by Name, Phone, or UHID (e.g. PAT-2026-0001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-slate-800">
                Patients Found ({searchResults.length})
              </div>
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    router.push(`/patients/${patient.id}`);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-3 hover:bg-slate-800/70 border-b border-slate-800/50 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400">
                      {patient.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      UHID: <span className="text-cyan-400 font-mono">{patient.uhid}</span> • {patient.gender}, {patient.age} yrs • 📞 {patient.phone}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200">View Record ➔</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls & Clock */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Live Digital Clock */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-mono text-cyan-300 font-semibold">{time}</span>
          </div>

          {/* Quick Token / Queue Trigger */}
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shadow-sm"
            title="Add Patient to Today's Queue"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Add to Queue</span>
          </button>

          {/* New Patient Registration Button */}
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all shadow-sm"
            title="Sign Out of Admin Desk"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Patient Registration Modal */}
      {isPatientModalOpen && (
        <PatientModal
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={(newPatient) => {
            setIsPatientModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* Quick Queue Add Modal */}
      {isQueueModalOpen && (
        <QuickQueueModal
          isOpen={isQueueModalOpen}
          onClose={() => setIsQueueModalOpen(false)}
          onSuccess={() => {
            setIsQueueModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
