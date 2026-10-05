'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  Stethoscope,
  Activity,
  Receipt,
  FileImage,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  ArrowRight,
  RefreshCw,
  Phone,
  Eye,
  Camera,
  Printer,
} from 'lucide-react';
import { formatCurrency, formatTime, formatDate, getStatusBadge } from '@/lib/utils';
import PatientModal from '@/components/PatientModal';
import QuickQueueModal from '@/components/QuickQueueModal';
import PrescriptionUploadModal from '@/components/PrescriptionUploadModal';
import PrescriptionSlipModal from '@/components/PrescriptionSlipModal';
import VitalsModal from '@/components/VitalsModal';
import BillingModal from '@/components/BillingModal';
import ClinicLogo from '@/components/ClinicLogo';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [todayVisits, setTodayVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [selectedVisitForRx, setSelectedVisitForRx] = useState(null);
  const [selectedVisitForVitals, setSelectedVisitForVitals] = useState(null);
  const [selectedVisitForBill, setSelectedVisitForBill] = useState(null);
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, visitsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/visits?date=today'),
      ]);
      const statsData = await statsRes.json();
      const visitsData = await visitsRes.json();
      setStats(statsData);
      setTodayVisits(visitsData.visits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1329]/95 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-lg shadow-blue-700/30 hidden sm:flex shrink-0">
            <ClinicLogo className="w-11 h-11" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Dr. Amitabh Upadhyay • OPD Console Active
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-serif">
              Skin & HIV Care Clinic
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Patient registration, 1-click Prescription Slip (पर्चा) print, live waiting TV queue & lab reports.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Generate Token</span>
          </button>

          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-700/25 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register & Print Parcha 🖨️</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
        {/* Total Patients */}
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Patients</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.totalPatients ?? '...'}</p>
          <p className="text-[11px] text-blue-400/80 mt-1 font-medium">Digital records saved</p>
        </div>

        {/* Today's Queue / OPD Visits */}
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Today's OPD Queue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.todayVisits ?? '...'}</p>
          <p className="text-[11px] text-amber-400 mt-1 font-medium">Tokens issued today</p>
        </div>

        {/* In Consultation */}
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">With Doctor</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {stats?.inConsultationVisits ?? '...'}
          </p>
          <p className="text-[11px] text-blue-400 mt-1 font-medium">Main Cabin</p>
        </div>

        {/* Prescriptions Created */}
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Prescriptions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileImage className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {stats?.totalPrescriptions ?? '...'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Digital & photos</p>
        </div>

        {/* Today's Collection */}
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(stats?.todayRevenue || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Consultation fees</p>
        </div>
      </div>

      {/* Main Grid: Today's Live Queue & Doctor Cabin Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Live Queue List (8 cols) */}
        <div className="lg:col-span-8 bg-[#0b1329]/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Today's OPD Queue & Tokens</span>
              </h3>
              <p className="text-xs text-slate-400">Real-time status of patients in clinic today</p>
            </div>

            <Link
              href="/queue"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View Full Queue ➔</span>
            </Link>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {todayVisits.map((visit) => {
              const status = getStatusBadge(visit.status);
              const vitals = visit.vitals?.[0];

              return (
                <div
                  key={visit.id}
                  className={`p-4 rounded-2xl bg-slate-950/80 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700 ${
                    visit.status === 'IN_CONSULTATION'
                      ? 'border-blue-500/50 ring-1 ring-blue-500/30'
                      : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-bold font-mono text-lg flex items-center justify-center shadow-md">
                      #{visit.tokenNo}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/patients/${visit.patient.id}`}
                          className="font-bold text-sm text-slate-100 hover:text-blue-400 transition-colors"
                        >
                          {visit.patient.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">
                          ({visit.patient.gender}, {visit.patient.age}y)
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>UHID: <strong className="text-blue-400 font-mono">{visit.patient.uhid}</strong></span>
                        <span>•</span>
                        <span>📞 {visit.patient.phone}</span>
                      </p>

                      {vitals && (
                        <p className="text-[11px] text-slate-300 font-mono mt-1">
                          BP: {vitals.bpSystolic}/{vitals.bpDiastolic} | Pulse: {vitals.pulseRate} | Wt: {vitals.weight || '-'}kg
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* 1-Click Print Parcha Button */}
                    <button
                      onClick={() => setSelectedVisitForPrint(visit)}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      title="1-Click Print Doctor Prescription Slip (पर्चा)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Parcha</span>
                    </button>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${status.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {todayVisits.length === 0 && (
              <div className="p-12 text-center text-slate-500 bg-slate-950/40 border border-slate-800 rounded-2xl">
                No tokens generated yet today. Click "Generate Token" to begin OPD counter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Doctor Info & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Doctor Profile Card */}
          <div className="bg-[#0b1329]/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Dr. Amitabh Upadhyay</h3>
                <p className="text-xs text-blue-400 font-semibold">Consultant Dermatology & AIDS</p>
                <p className="text-[10px] text-slate-400">M.B.B.S., FHM (Delhi), MIAS (Geneva)</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-[11px]">Civil Lines Clinic:</p>
                <p className="text-slate-400 text-[11px]">P Square Mall, Behind Fashion City</p>
                <p className="text-blue-400 font-semibold text-[11px] mt-0.5">Mon to Fri: 3 PM - 6 PM</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-[11px]">Jhunsi Clinic:</p>
                <p className="text-slate-400 text-[11px]">1/101 MIG, Behind PNB, Yojna-3</p>
                <p className="text-blue-400 font-semibold text-[11px] mt-0.5">Mon to Sun: 9:30 AM - 2 PM</p>
              </div>
            </div>

            <Link
              href="/consultation"
              className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open Doctor Consultation Desk</span>
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#0b1329]/60 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/queue"
                className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span>⏱️ Today's Live OPD Queue & Tokens</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </Link>
              <Link
                href="/lab-reports"
                className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span>🧪 Specialized Diagnostic Lab Reports</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </Link>
              <Link
                href="/patients"
                className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span>🔍 Search Patient Directory & Medical History</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Slip Print Modal */}
      {selectedVisitForPrint && (
        <PrescriptionSlipModal
          isOpen={!!selectedVisitForPrint}
          patientData={selectedVisitForPrint.patient}
          visitData={selectedVisitForPrint}
          onClose={() => setSelectedVisitForPrint(null)}
        />
      )}

      {/* Modals */}
      {isPatientModalOpen && (
        <PatientModal
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={() => {
            setIsPatientModalOpen(false);
            loadData();
          }}
        />
      )}

      {isQueueModalOpen && (
        <QuickQueueModal
          isOpen={isQueueModalOpen}
          onClose={() => setIsQueueModalOpen(false)}
          onSuccess={() => {
            setIsQueueModalOpen(false);
            loadData();
          }}
        />
      )}

      {selectedVisitForRx && (
        <PrescriptionUploadModal
          isOpen={!!selectedVisitForRx}
          visitData={selectedVisitForRx}
          onClose={() => setSelectedVisitForRx(null)}
          onSuccess={() => {
            setSelectedVisitForRx(null);
            loadData();
          }}
        />
      )}

      {selectedVisitForVitals && (
        <VitalsModal
          isOpen={!!selectedVisitForVitals}
          visitData={selectedVisitForVitals}
          onClose={() => setSelectedVisitForVitals(null)}
          onSuccess={() => {
            setSelectedVisitForVitals(null);
            loadData();
          }}
        />
      )}

      {selectedVisitForBill && (
        <BillingModal
          isOpen={!!selectedVisitForBill}
          visitData={selectedVisitForBill}
          onClose={() => setSelectedVisitForBill(null)}
          onSuccess={() => {
            setSelectedVisitForBill(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
