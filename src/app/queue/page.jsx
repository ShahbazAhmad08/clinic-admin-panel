'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  UserPlus,
  Search,
  Filter,
  Activity,
  Receipt,
  FileImage,
  Printer,
  RefreshCw,
  Phone,
  Calendar,
  AlertTriangle,
  Camera,
  Play,
  Check,
  XCircle,
} from 'lucide-react';
import { formatTime, formatDate, getStatusBadge, formatCurrency } from '@/lib/utils';
import QuickQueueModal from '@/components/QuickQueueModal';
import PrescriptionUploadModal from '@/components/PrescriptionUploadModal';
import PrescriptionSlipModal from '@/components/PrescriptionSlipModal';
import VitalsModal from '@/components/VitalsModal';
import BillingModal from '@/components/BillingModal';

export default function QueuePage() {
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [selectedVisitForRx, setSelectedVisitForRx] = useState(null);
  const [selectedVisitForVitals, setSelectedVisitForVitals] = useState(null);
  const [selectedVisitForBill, setSelectedVisitForBill] = useState(null);
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visits?date=today');
      const data = await res.json();
      setVisits(data.visits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (visitId, status) => {
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadVisits();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVisits = visits.filter((v) => {
    const matchesFilter = filter === 'ALL' ? true : v.status === filter;
    const matchesSearch =
      v.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.patient?.phone?.includes(search) ||
      v.patient?.uhid?.toLowerCase().includes(search.toLowerCase()) ||
      String(v.tokenNo).includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1329]/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            Live OPD Counter • Dr. Amitabh Upadhyay
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
            Daily OPD Queue & Token Desk
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time token management, 1-click Prescription slip (पर्चा) print, and consultation tracker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-700/25 active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Generate Token #</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b1329]/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All Tokens (${visits.length})` },
            {
              id: 'WAITING',
              label: `Waiting (${visits.filter((v) => v.status === 'WAITING').length})`,
            },
            {
              id: 'IN_CONSULTATION',
              label: `With Doctor (${visits.filter((v) => v.status === 'IN_CONSULTATION').length})`,
            },
            {
              id: 'COMPLETED',
              label: `Completed (${visits.filter((v) => v.status === 'COMPLETED').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search token, patient name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVisits.map((visit) => {
          const status = getStatusBadge(visit.status);
          const hasVitals = visit.vitals?.length > 0;
          const vitals = visit.vitals?.[0];
          const hasRx = visit.prescriptions?.length > 0;
          const hasBill = visit.invoices?.length > 0;

          return (
            <div
              key={visit.id}
              className={`bg-[#0b1329]/90 border rounded-2xl p-5 shadow-lg space-y-4 transition-all hover:border-slate-700 relative overflow-hidden ${
                visit.status === 'IN_CONSULTATION'
                  ? 'border-blue-500/60 ring-1 ring-blue-500/30 shadow-blue-950/50'
                  : 'border-slate-800'
              }`}
            >
              {/* Token Number & Status Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 font-bold font-mono text-base text-white flex items-center justify-center shadow-md shadow-blue-700/20">
                    #{visit.tokenNo}
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Token Issued At</span>
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      {formatTime(visit.visitDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 1-Click Print Button */}
                  <button
                    onClick={() => setSelectedVisitForPrint(visit)}
                    className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="1-Click Print Prescription Slip (पर्चा)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${status.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Patient Basic Info */}
              <div className="border-t border-b border-slate-800/80 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/patients/${visit.patient.id}`}
                    className="font-bold text-sm text-slate-100 hover:text-blue-400 transition-colors"
                  >
                    {visit.patient.name}
                  </Link>
                  <span className="text-xs text-slate-400 font-mono">
                    {visit.patient.gender}, {visit.patient.age}y
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>UHID: <span className="text-blue-400 font-mono">{visit.patient.uhid}</span></span>
                  <span>•</span>
                  <span>📞 {visit.patient.phone}</span>
                </p>
                {visit.patient.allergies && (
                  <p className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    ⚠️ Allergy: {visit.patient.allergies}
                  </p>
                )}
                {visit.chiefComplaints && (
                  <p className="text-xs text-slate-300 italic pt-1">
                    "{visit.chiefComplaints}"
                  </p>
                )}
              </div>

              {/* Doctor & Vitals Preview */}
              <div className="text-xs text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Consulting Doctor:</span>
                  <span className="font-semibold text-slate-200">
                    Dr. Amitabh Upadhyay (Main Cabin)
                  </span>
                </div>
                {hasVitals && (
                  <div className="flex justify-between bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-rose-400 font-semibold">Vitals:</span>
                    <span className="font-mono text-slate-200">
                      BP: {vitals.bpSystolic}/{vitals.bpDiastolic} | Pulse: {vitals.pulseRate} | Wt: {vitals.weight || '-'}kg
                    </span>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleStatusChange(visit.id, 'WAITING')}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                    visit.status === 'WAITING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Wait
                </button>
                <button
                  onClick={() => handleStatusChange(visit.id, 'IN_CONSULTATION')}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    visit.status === 'IN_CONSULTATION'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  Call In
                </button>
                <button
                  onClick={() => handleStatusChange(visit.id, 'COMPLETED')}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    visit.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  Done
                </button>
              </div>

              {/* Desk Action Tool Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedVisitForVitals(visit)}
                  className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Vitals</span>
                </button>

                <button
                  onClick={() => setSelectedVisitForRx(visit)}
                  className="py-2 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rx Photo</span>
                </button>

                <button
                  onClick={() => setSelectedVisitForBill(visit)}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Bill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVisits.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No tokens found in this view</h4>
          <p className="text-xs text-slate-500 mt-1">Generate a new token or register a patient.</p>
        </div>
      )}

      {/* Modals */}
      {isQueueModalOpen && (
        <QuickQueueModal
          isOpen={isQueueModalOpen}
          onClose={() => setIsQueueModalOpen(false)}
          onSuccess={() => {
            setIsQueueModalOpen(false);
            loadVisits();
          }}
        />
      )}

      {selectedVisitForPrint && (
        <PrescriptionSlipModal
          isOpen={!!selectedVisitForPrint}
          patientData={selectedVisitForPrint.patient}
          visitData={selectedVisitForPrint}
          onClose={() => setSelectedVisitForPrint(null)}
        />
      )}

      {selectedVisitForRx && (
        <PrescriptionUploadModal
          isOpen={!!selectedVisitForRx}
          visitData={selectedVisitForRx}
          onClose={() => setSelectedVisitForRx(null)}
          onSuccess={() => {
            setSelectedVisitForRx(null);
            loadVisits();
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
            loadVisits();
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
            loadVisits();
          }}
        />
      )}
    </div>
  );
}
