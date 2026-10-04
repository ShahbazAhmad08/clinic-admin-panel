'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Stethoscope,
  Heart,
  FileImage,
  Receipt,
  FileText,
  AlertCircle,
  Eye,
  RotateCw,
  X,
  Pill,
} from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency, getStatusBadge } from '@/lib/utils';

export default function PatientTimeline({ visits = [] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!visits || visits.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">No Past Visits Recorded</h4>
        <p className="text-xs text-slate-500 mt-1">
          This patient has not attended any OPD consultations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-6 space-y-8 pb-4">
        {visits.map((visit, index) => {
          const status = getStatusBadge(visit.status);
          const prescription = visit.prescriptions?.[0];
          const vitals = visit.vitals?.[0];
          const invoice = visit.invoices?.[0];
          const digitalRx = prescription?.digitalRxJson
            ? JSON.parse(prescription.digitalRxJson)
            : [];

          return (
            <div key={visit.id} className="relative pl-6 md:pl-8 group">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  index === 0 ? 'bg-cyan-400 ring-4 ring-cyan-500/20' : 'bg-slate-700'
                }`}
              />

              {/* Card */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all space-y-4">
                {/* Visit Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      {formatDateTime(visit.visitDate)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.bg}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      Token #{visit.tokenNo}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Attended by:</span>
                    <span className="font-semibold text-slate-200">
                      {visit.doctor?.name || 'Dr. On Duty'}
                    </span>
                  </div>
                </div>

                {/* Complaints & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visit.chiefComplaints && (
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Chief Complaints / Symptoms
                      </p>
                      <p className="text-xs text-slate-200">{visit.chiefComplaints}</p>
                    </div>
                  )}

                  {visit.diagnosis && (
                    <div className="bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
                      <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                        Doctor's Diagnosis
                      </p>
                      <p className="text-xs font-medium text-slate-100">{visit.diagnosis}</p>
                    </div>
                  )}
                </div>

                {/* Vitals snapshot */}
                {vitals && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                      <Heart className="w-3.5 h-3.5" /> Recorded Vitals
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {vitals.bpSystolic && vitals.bpDiastolic && (
                        <div className="text-slate-300">
                          BP:{' '}
                          <span className="font-bold text-slate-100 font-mono">
                            {vitals.bpSystolic}/{vitals.bpDiastolic}
                          </span>{' '}
                          mmHg
                        </div>
                      )}
                      {vitals.pulseRate && (
                        <div className="text-slate-300">
                          Pulse:{' '}
                          <span className="font-bold text-slate-100 font-mono">
                            {vitals.pulseRate}
                          </span>{' '}
                          bpm
                        </div>
                      )}
                      {vitals.weight && (
                        <div className="text-slate-300">
                          Weight:{' '}
                          <span className="font-bold text-slate-100 font-mono">
                            {vitals.weight}
                          </span>{' '}
                          kg
                        </div>
                      )}
                      {vitals.temperature && (
                        <div className="text-slate-300">
                          Temp:{' '}
                          <span className="font-bold text-slate-100 font-mono">
                            {vitals.temperature}
                          </span>{' '}
                          °F
                        </div>
                      )}
                      {vitals.spo2 && (
                        <div className="text-slate-300">
                          SpO2:{' '}
                          <span className="font-bold text-slate-100 font-mono">{vitals.spo2}%</span>
                        </div>
                      )}
                      {vitals.bloodSugar && (
                        <div className="text-slate-300">
                          Sugar:{' '}
                          <span className="font-bold text-slate-100 font-mono">
                            {vitals.bloodSugar}
                          </span>{' '}
                          mg/dL
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Prescription Section (Photo OR Digital Rx) */}
                {prescription && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <FileImage className="w-4 h-4 text-cyan-400" />
                        Prescription Details
                      </span>
                    </div>

                    {/* Prescription Photo Attachment if available */}
                    {prescription.photoUrl && (
                      <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                        <div
                          onClick={() => setSelectedPhoto(prescription.photoUrl)}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 cursor-pointer group/img flex-shrink-0 bg-black"
                        >
                          <img
                            src={prescription.photoUrl}
                            alt="Doctor Rx"
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200">
                            Handwritten Prescription Photo
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Uploaded by Doctor / Front-desk assistant
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(prescription.photoUrl)}
                            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Click to View Full Size Photo</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Digital Rx Table if prescribed electronically */}
                    {digitalRx.length > 0 && (
                      <div className="bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
                        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-cyan-400" /> Prescribed Medicines ({digitalRx.length})
                        </div>
                        <div className="divide-y divide-slate-800/60">
                          {digitalRx.map((med, i) => (
                            <div
                              key={i}
                              className="px-3.5 py-2 text-xs flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-200">{med.name}</span>
                              <div className="flex items-center gap-3 text-slate-400">
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300">
                                  {med.dosage}
                                </span>
                                <span>{med.timing}</span>
                                <span className="text-slate-400">{med.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {prescription.instructions && (
                      <p className="text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/40">
                        <span className="font-semibold text-slate-300">Advice: </span>
                        {prescription.instructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Follow-up & Invoice summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-xs">
                  {visit.nextFollowUpDate ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Next Follow-up: {formatDate(visit.nextFollowUpDate)}
                    </span>
                  ) : (
                    <span className="text-slate-500">No scheduled follow-up</span>
                  )}

                  {invoice && (
                    <span className="text-slate-300 flex items-center gap-1 font-mono">
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      Billed: {formatCurrency(invoice.totalAmount)} (
                      <span className="text-emerald-400 font-semibold">{invoice.paymentStatus}</span>)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-white">Prescription Photo Inspection</h4>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={selectedPhoto}
                alt="Prescription Full"
                className="max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
