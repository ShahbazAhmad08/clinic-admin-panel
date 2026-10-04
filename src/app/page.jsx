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
} from 'lucide-react';
import { formatCurrency, formatTime, formatDate, getStatusBadge } from '@/lib/utils';
import PatientModal from '@/components/PatientModal';
import QuickQueueModal from '@/components/QuickQueueModal';
import PrescriptionUploadModal from '@/components/PrescriptionUploadModal';
import VitalsModal from '@/components/VitalsModal';
import BillingModal from '@/components/BillingModal';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Front-Office & Doctor Desk Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Clinic Overview & <span className="gradient-text">OPD Console</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage patient registrations, live token queue, vitals, prescriptions, and billing in one place.
          </p>
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
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/25 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
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
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Patients</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.totalPatients ?? '...'}</p>
          <p className="text-[11px] text-cyan-400/80 mt-1 font-medium">Digital records stored</p>
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
          <p className="text-2xl font-bold text-white font-mono">{stats?.inConsultationVisits ?? '...'}</p>
          <p className="text-[11px] text-blue-400 mt-1 font-medium">Currently inside cabin</p>
        </div>

        {/* Waiting in Queue */}
        <div className="glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Waiting in Lounge</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.waitingVisits ?? '...'}</p>
          <p className="text-[11px] text-rose-400 mt-1 font-medium">Next in line</p>
        </div>

        {/* Today's Collection */}
        <div className="col-span-2 lg:col-span-1 glass-card p-4 md:p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Today's Collection</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(stats?.todayRevenue)}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">Consultation & fees</p>
        </div>
      </div>

      {/* Main Content: Today's Live OPD Queue Table & Consultation Station */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's OPD Live Queue Desk */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">
                  Today's Live OPD Queue Desk
                </h3>
                <p className="text-xs text-slate-400">Manage patient status, vitals, Rx & billing</p>
              </div>
            </div>
            <Link
              href="/queue"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Full Queue View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {todayVisits.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No OPD tokens issued today yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Click below to add a walk-in patient or generate a new token.
                </p>
                <button
                  onClick={() => setIsQueueModalOpen(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
                >
                  Issue First Token
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Token #</th>
                      <th className="py-3 px-4">Patient Details</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Vitals / Rx</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {todayVisits.map((visit) => {
                      const status = getStatusBadge(visit.status);
                      const hasVitals = visit.vitals?.length > 0;
                      const hasRx = visit.prescriptions?.length > 0;
                      const hasBill = visit.invoices?.length > 0;

                      return (
                        <tr
                          key={visit.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Token Number Badge */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                                #{visit.tokenNo}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {formatTime(visit.visitDate)}
                              </span>
                            </div>
                          </td>

                          {/* Patient Name & Details */}
                          <td className="py-3.5 px-4">
                            <div>
                              <Link
                                href={`/patients/${visit.patient.id}`}
                                className="font-bold text-slate-100 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                              >
                                <span>{visit.patient.name}</span>
                              </Link>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                <span className="font-mono text-cyan-400">{visit.patient.uhid}</span> • {visit.patient.gender}, {visit.patient.age}y • 📞 {visit.patient.phone}
                              </div>
                              {visit.patient.allergies && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                                  ⚠️ Allergy: {visit.patient.allergies}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Doctor */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <p className="font-semibold text-[11px]">{visit.doctor.name}</p>
                            <p className="text-[10px] text-slate-500">{visit.doctor.cabinNo}</p>
                          </td>

                          {/* Live Status Toggle */}
                          <td className="py-3.5 px-4">
                            <select
                              value={visit.status}
                              onChange={(e) => handleStatusChange(visit.id, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${status.bg}`}
                            >
                              <option value="WAITING" className="bg-slate-900 text-amber-400">
                                Waiting
                              </option>
                              <option value="IN_CONSULTATION" className="bg-slate-900 text-blue-400">
                                With Doctor
                              </option>
                              <option value="COMPLETED" className="bg-slate-900 text-emerald-400">
                                Completed
                              </option>
                              <option value="CANCELLED" className="bg-slate-900 text-rose-400">
                                Cancelled
                              </option>
                            </select>
                          </td>

                          {/* Vitals / Rx Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {/* Vitals button */}
                              <button
                                onClick={() => setSelectedVisitForVitals(visit)}
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${
                                  hasVitals
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                                title={hasVitals ? 'Vitals Recorded' : 'Record Vitals'}
                              >
                                <Activity className="w-3 h-3" />
                                {hasVitals ? 'BP/Vitals ✓' : '+ Vitals'}
                              </button>

                              {/* Prescription Upload button */}
                              <button
                                onClick={() => setSelectedVisitForRx(visit)}
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${
                                  hasRx
                                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                                title="Upload / Edit Doctor Prescription"
                              >
                                <Camera className="w-3 h-3 text-cyan-400" />
                                {hasRx ? 'Rx Photo ✓' : '+ Upload Rx'}
                              </button>
                            </div>
                          </td>

                          {/* Quick Billing */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedVisitForBill(visit)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 transition-all ${
                                hasBill
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm'
                              }`}
                            >
                              <Receipt className="w-3 h-3" />
                              <span>{hasBill ? 'Receipt' : 'Bill'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Doctor Cabin Status & Quick Rx Access */}
        <div className="space-y-4">
          {/* Active Doctor Cabin Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Doctor On Duty
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold animate-pulse">
                OPD Open
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-cyan-500/20">
                DR
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dr. Rajesh Sharma</h4>
                <p className="text-xs text-cyan-400">Senior Consultant Physician</p>
                <p className="text-[11px] text-slate-400">MBBS, MD • Cabin 1</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                <span className="font-bold text-slate-100 font-mono">₹500 / visit</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">OPD Timings</span>
                <span className="font-bold text-slate-100">09:00 AM - 02:00 PM</span>
              </div>
            </div>

            <Link
              href="/consultation"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open Doctor Consultation Desk</span>
            </Link>
          </div>

          {/* Quick Info / Shortcuts */}
          <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/display"
                target="_blank"
                className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span>📺 Waiting Lounge TV Display Mode</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
              <Link
                href="/prescriptions"
                className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span>📸 Prescription Photo Archive</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
              <Link
                href="/patients"
                className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span>🔍 Search Patient Medical History</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

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
