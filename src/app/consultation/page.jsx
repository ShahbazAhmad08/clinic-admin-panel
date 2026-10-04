'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Camera,
  Activity,
  User,
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  RotateCw,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Play,
  ArrowRight,
} from 'lucide-react';
import { formatTime, formatDate, getStatusBadge } from '@/lib/utils';
import PrescriptionUploadModal from '@/components/PrescriptionUploadModal';
import VitalsModal from '@/components/VitalsModal';

export default function ConsultationPage() {
  const [todayVisits, setTodayVisits] = useState([]);
  const [activeVisit, setActiveVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visits?date=today');
      const data = await res.json();
      const list = data.visits || [];
      setTodayVisits(list);

      // Auto-select patient who is currently IN_CONSULTATION or first WAITING
      const inConsult = list.find((v) => v.status === 'IN_CONSULTATION');
      const waiting = list.find((v) => v.status === 'WAITING');
      setActiveVisit(inConsult || waiting || list[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallIn = async (visit) => {
    try {
      await fetch(`/api/visits/${visit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_CONSULTATION' }),
      });
      loadVisits();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor Consultation Station • Cabin 1
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Clinical Consultation & Prescription Desk
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Examine patient, review vitals, take photo of handwritten Rx or enter digital prescriptions.
          </p>
        </div>

        {activeVisit && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVitalsModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Record Vitals</span>
            </button>

            <button
              onClick={() => setIsRxModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Upload Prescription Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Queue Selector | Right Active Patient Examination */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Waiting Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Today's Patients ({todayVisits.length})
            </h3>
            <span className="text-[11px] text-cyan-400 font-medium">Click to examine</span>
          </div>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {todayVisits.map((visit) => {
              const status = getStatusBadge(visit.status);
              const isSelected = activeVisit?.id === visit.id;

              return (
                <div
                  key={visit.id}
                  onClick={() => setActiveVisit(visit)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-950 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                      Token #{visit.tokenNo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.bg}`}>
                      {status.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{visit.patient.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {visit.patient.gender}, {visit.patient.age}y • 📞 {visit.patient.phone}
                  </p>

                  {visit.chiefComplaints && (
                    <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-1">
                      "{visit.chiefComplaints}"
                    </p>
                  )}
                </div>
              );
            })}

            {todayVisits.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                No patients in today's queue yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Patient Examination View (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeVisit ? (
            <>
              {/* Active Header */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        TOKEN #{activeVisit.tokenNo}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{activeVisit.patient.uhid}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {activeVisit.patient.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeVisit.patient.gender}, {activeVisit.patient.age} years • Blood: {activeVisit.patient.bloodGroup || 'N/A'} • 📞 {activeVisit.patient.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeVisit.status !== 'IN_CONSULTATION' && (
                      <button
                        onClick={() => handleCallIn(activeVisit)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Call In Cabin</span>
                      </button>
                    )}

                    <Link
                      href={`/patients/${activeVisit.patient.id}`}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                    >
                      <span>Full History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Allergies Warning */}
                {activeVisit.patient.allergies && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>⚠️ DRUG ALLERGIES: {activeVisit.patient.allergies}</span>
                  </div>
                )}

                {/* Symptoms / Complaints */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Chief Symptoms Reported by Front-Desk
                  </span>
                  <p className="text-sm font-medium text-slate-200">
                    {activeVisit.chiefComplaints || 'General health consultation.'}
                  </p>
                </div>

                {/* Vitals Snapshot */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4" /> Vitals Snapshot
                    </span>
                    <button
                      onClick={() => setIsVitalsModalOpen(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      + Update Vitals
                    </button>
                  </div>

                  {activeVisit.vitals?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {activeVisit.vitals[0].bpSystolic}/{activeVisit.vitals[0].bpDiastolic}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">mmHg</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {activeVisit.vitals[0].pulseRate}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">bpm</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Body Weight</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {activeVisit.vitals[0].weight || '-'}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">kg</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {activeVisit.vitals[0].spo2 || '-'}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/50 rounded-xl text-center text-xs text-slate-500">
                      No vitals recorded for this visit yet. Click "+ Update Vitals" to enter BP & Pulse.
                    </div>
                  )}
                </div>

                {/* Prescription Section */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> Doctor Prescription
                    </span>
                    <button
                      onClick={() => setIsRxModalOpen(true)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{activeVisit.prescriptions?.length > 0 ? 'Edit Rx' : 'Upload Rx Photo'}</span>
                    </button>
                  </div>

                  {activeVisit.prescriptions?.length > 0 ? (
                    <div className="space-y-3">
                      {activeVisit.prescriptions[0].photoUrl && (
                        <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <img
                            src={activeVisit.prescriptions[0].photoUrl}
                            alt="Rx Photo"
                            className="w-24 h-24 object-cover rounded-lg border border-slate-700"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Prescription Photo Stored
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Diagnosis: {activeVisit.diagnosis || 'Clinical Rx'}
                            </p>
                            <button
                              onClick={() => setIsRxModalOpen(true)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold mt-2 block"
                            >
                              Inspect Full Size Photo ➔
                            </button>
                          </div>
                        </div>
                      )}

                      {activeVisit.diagnosis && (
                        <p className="text-xs text-slate-300">
                          <strong>Diagnosis:</strong> {activeVisit.diagnosis}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center">
                      <p className="text-xs text-slate-400 mb-3">
                        Upload a photo of the handwritten prescription or create a digital Rx table.
                      </p>
                      <button
                        onClick={() => setIsRxModalOpen(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-cyan-400" />
                        <span>Open Rx Camera / Upload Tool</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
              <Stethoscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select a patient from today's queue list on the left to begin consultation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isRxModalOpen && activeVisit && (
        <PrescriptionUploadModal
          isOpen={isRxModalOpen}
          visitData={activeVisit}
          onClose={() => setIsRxModalOpen(false)}
          onSuccess={() => {
            setIsRxModalOpen(false);
            loadVisits();
          }}
        />
      )}

      {isVitalsModalOpen && activeVisit && (
        <VitalsModal
          isOpen={isVitalsModalOpen}
          visitData={activeVisit}
          onClose={() => setIsVitalsModalOpen(false)}
          onSuccess={() => {
            setIsVitalsModalOpen(false);
            loadVisits();
          }}
        />
      )}
    </div>
  );
}
