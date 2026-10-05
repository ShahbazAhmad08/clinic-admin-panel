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
  Printer,
} from 'lucide-react';
import { formatTime, formatDate, getStatusBadge } from '@/lib/utils';
import PrescriptionUploadModal from '@/components/PrescriptionUploadModal';
import PrescriptionSlipModal from '@/components/PrescriptionSlipModal';
import VitalsModal from '@/components/VitalsModal';

export default function ConsultationPage() {
  const [todayVisits, setTodayVisits] = useState([]);
  const [activeVisit, setActiveVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Digital Rx state for active visit
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1-0-1', timing: 'After Meals', duration: '5 days', notes: '' },
  ]);
  const [savingRx, setSavingRx] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    if (activeVisit) {
      setDiagnosis(activeVisit.diagnosis || '');
      setNotes(activeVisit.doctorNotes || '');
      const rx = activeVisit.prescriptions?.[0];
      if (rx) {
        setInstructions(rx.instructions || '');
        if (rx.digitalRxJson) {
          try {
            setMedicines(JSON.parse(rx.digitalRxJson));
          } catch (e) {}
        }
      }
    }
  }, [activeVisit]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visits?date=today');
      const data = await res.json();
      const list = data.visits || [];
      setTodayVisits(list);

      const inConsult = list.find((v) => v.status === 'IN_CONSULTATION');
      const waiting = list.find((v) => v.status === 'WAITING');
      setActiveVisit((prev) => (prev ? list.find((v) => v.id === prev.id) || prev : inConsult || waiting || list[0] || null));
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

  const handleComplete = async (visit) => {
    try {
      await fetch(`/api/visits/${visit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          diagnosis,
          doctorNotes: notes,
        }),
      });
      loadVisits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1-0-1', timing: 'After Meals', duration: '5 days', notes: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSaveDigitalRx = async (e) => {
    e?.preventDefault();
    if (!activeVisit) return;
    setSavingRx(true);
    setSaveSuccess(false);

    try {
      // 1. Update Visit Diagnosis and Notes
      await fetch(`/api/visits/${activeVisit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis,
          doctorNotes: notes,
        }),
      });

      // 2. Save Prescription
      const validMeds = medicines.filter((m) => m.name.trim() !== '');
      await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: activeVisit.id,
          prescriptionType: 'DIGITAL',
          digitalRxJson: JSON.stringify(validMeds),
          instructions,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadVisits();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1329]/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor Consultation Station • Dr. Amitabh Upadhyay
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
            Clinical Consultation & Prescription Desk
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Examine patient, enter digital Rx or upload handwritten photo, and 1-click print doctor parcha.
          </p>
        </div>

        {activeVisit && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-700/25 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print OPD Parcha (1-Click)</span>
            </button>

            <button
              onClick={() => setIsVitalsModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Record Vitals</span>
            </button>

            <button
              onClick={() => setIsRxModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Upload Rx Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Queue Selector | Right Active Patient Examination */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Waiting Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#0b1329]/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Today's Patients ({todayVisits.length})
            </h3>
            <span className="text-[11px] text-blue-400 font-medium">Click to select</span>
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
                      ? 'bg-slate-800/90 border-blue-500/60 shadow-lg shadow-blue-950 ring-1 ring-blue-500/30'
                      : 'bg-[#0b1329]/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-mono font-bold text-xs border border-blue-500/30">
                      Token #{visit.tokenNo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.bg}`}>
                      {status.label}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{visit.patient.name}</h4>
                  <p className="text-xs text-slate-400">
                    {visit.patient.gender}, {visit.patient.age}y • UHID: {visit.patient.uhid}
                  </p>

                  {visit.chiefComplaints && (
                    <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                      "{visit.chiefComplaints}"
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(visit.visitDate)}
                    </span>

                    {visit.status === 'WAITING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallIn(visit);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Play className="w-3 h-3" />
                        <span>Call In</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {todayVisits.length === 0 && (
              <div className="p-8 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-2xl text-xs">
                No patients in queue today.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Patient Consultation Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeVisit ? (
            <>
              {/* Patient Banner */}
              <div className="bg-[#0b1329]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-white font-serif">{activeVisit.patient.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-mono font-bold text-xs border border-blue-500/30">
                        Token #{activeVisit.tokenNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeVisit.patient.gender}, {activeVisit.patient.age}y • UHID: {activeVisit.patient.uhid} • 📞 {activeVisit.patient.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleComplete(activeVisit)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Consultation Done</span>
                    </button>
                  </div>
                </div>

                {/* Patient Clinical Highlights & Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {activeVisit.patient.chronicDiseases && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span><strong>History:</strong> {activeVisit.patient.chronicDiseases}</span>
                    </div>
                  )}

                  {activeVisit.vitals?.[0] && (
                    <div className="col-span-full bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-slate-300 text-xs">
                      <span className="font-bold text-rose-400 font-sans">Latest Vitals:</span>
                      <span>BP: {activeVisit.vitals[0].bpSystolic}/{activeVisit.vitals[0].bpDiastolic}</span>
                      <span>Pulse: {activeVisit.vitals[0].pulseRate} bpm</span>
                      <span>Wt: {activeVisit.vitals[0].weight || '-'} kg</span>
                      <span>Temp: {activeVisit.vitals[0].temperature || '-'} °F</span>
                      <span>Sugar: {activeVisit.vitals[0].bloodSugar || '-'} mg/dL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Rx & Clinical Notes Form */}
              <div className="bg-[#0b1329]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Doctor's Examination, Diagnosis & Digital Prescription</span>
                  </h3>

                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved Successfully
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveDigitalRx} className="space-y-4">
                  {/* Diagnosis */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Clinical Diagnosis / Findings
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chronic Atopic Dermatitis with Secondary Infection"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Medicines List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Prescribed Medicines & Creams / Lotions
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Medicine</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {medicines.map((med, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 items-center"
                        >
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              placeholder="Medicine Name (e.g. Tab Levocet 5mg / Cream)"
                              value={med.name}
                              onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              placeholder="Dosage (1-0-1)"
                              value={med.dosage}
                              onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              placeholder="Timing"
                              value={med.timing}
                              onChange={(e) => handleMedicineChange(idx, 'timing', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              placeholder="Duration"
                              value={med.duration}
                              onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor's Advice & Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Doctor's Advice & Dietary / Bathing Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Use lukewarm water for bathing. Avoid synthetic clothes. Apply moisturizer twice daily."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Save & Print Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={savingRx}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingRx ? 'Saving...' : 'Save Prescription'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSaveDigitalRx();
                        setIsPrintModalOpen(true);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-700/25 flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Save & 1-Click Print Parcha 🖨️</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-3xl">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h3 className="text-base font-bold text-slate-300">No Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select a patient from today's queue on the left to begin consultation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Slip Print Modal */}
      {isPrintModalOpen && activeVisit && (
        <PrescriptionSlipModal
          isOpen={isPrintModalOpen}
          patientData={activeVisit.patient}
          visitData={{
            ...activeVisit,
            diagnosis,
            photoUrl: activeVisit.prescriptions?.[0]?.photoUrl,
            prescriptions: [
              {
                digitalRxJson: JSON.stringify(medicines.filter((m) => m.name.trim() !== '')),
                instructions,
                photoUrl: activeVisit.prescriptions?.[0]?.photoUrl,
              },
            ],
          }}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Upload Rx Photo Modal */}
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

      {/* Vitals Modal */}
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
