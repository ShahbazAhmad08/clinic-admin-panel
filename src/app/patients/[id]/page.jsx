'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Clock,
  PlusCircle,
  FileImage,
  Receipt,
  FlaskConical,
  Edit,
  Activity,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import PatientTimeline from '@/components/PatientTimeline';
import PatientModal from '@/components/PatientModal';
import QuickQueueModal from '@/components/QuickQueueModal';
import PrescriptionSlipModal from '@/components/PrescriptionSlipModal';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TIMELINE'); // 'TIMELINE' | 'PRESCRIPTIONS' | 'LAB' | 'BILLING'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading Patient Electronic Health Record...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center bg-[#0b1329] border border-slate-800 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-2">Patient Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">The requested patient record does not exist.</p>
        <Link
          href="/patients"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const allPrescriptions = (patient.visits || [])
    .flatMap((v) =>
      (v.prescriptions || []).map((p) => ({
        ...p,
        visitDate: v.visitDate,
        doctor: v.doctor,
        diagnosis: v.diagnosis,
        tokenNo: v.tokenNo,
      }))
    );

  const latestVisit = patient.visits?.[0];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </Link>
      </div>

      {/* Patient Profile Card Header */}
      <div className="bg-[#0b1329]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-700/25">
              {patient.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black text-white font-serif">{patient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-mono font-bold text-xs border border-blue-500/30">
                  {patient.uhid}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>{patient.gender}, {patient.age} years</span>
                <span>•</span>
                <span>Blood Group: <strong className="text-rose-400">{patient.bloodGroup || 'N/A'}</strong></span>
                <span>•</span>
                <span>📞 {patient.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 1-Click Print Parcha Button */}
            <button
              onClick={() => {
                setSelectedVisitForPrint(latestVisit);
                setIsPrintModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-700/25 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print OPD Parcha (पर्चा प्रिंट करें)</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => setIsQueueModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Issue Today Token</span>
            </button>
          </div>
        </div>

        {/* Clinical Alert Warning Banner for Allergies & Chronic illness */}
        {(patient.allergies || patient.chronicDiseases) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {patient.allergies && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-400 uppercase tracking-wide text-[10px]">
                    Drug Allergies Alert
                  </strong>
                  <span>{patient.allergies}</span>
                </div>
              </div>
            )}

            {patient.chronicDiseases && (
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-blue-400 uppercase tracking-wide text-[10px]">
                    Chronic Condition / Medical History
                  </strong>
                  <span>{patient.chronicDiseases}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'TIMELINE', label: `Visits Timeline (${patient.visits?.length || 0})` },
          { id: 'PRESCRIPTIONS', label: `Prescriptions (${allPrescriptions.length})` },
          { id: 'LAB', label: `Lab Reports (${patient.labReports?.length || 0})` },
          { id: 'BILLING', label: `Invoices & Billing (${patient.invoices?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'TIMELINE' && (
        <PatientTimeline
          visits={patient.visits || []}
          onRefresh={loadPatientData}
        />
      )}

      {activeTab === 'PRESCRIPTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPrescriptions.map((rx, idx) => (
            <div
              key={rx.id || idx}
              className="bg-[#0b1329]/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold font-mono text-xs flex items-center justify-center">
                    #{rx.tokenNo || idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {formatDate(rx.visitDate || rx.createdAt)}
                    </p>
                    <p className="text-[11px] text-slate-400">Dr. Amitabh Upadhyay</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedVisitForPrint({
                      ...rx,
                      patient,
                      prescriptions: [rx],
                    });
                    setIsPrintModalOpen(true);
                  }}
                  className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>

              {rx.digitalRxJson && (
                <div className="space-y-2 text-xs">
                  {JSON.parse(rx.digitalRxJson).map((med, mIdx) => (
                    <div key={mIdx} className="flex justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200">{med.name}</span>
                        <p className="text-[10px] text-slate-400">{med.dosage} ({med.timing})</p>
                      </div>
                      <span className="font-mono text-slate-400">{med.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {rx.instructions && (
                <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 italic">
                  "{rx.instructions}"
                </p>
              )}
            </div>
          ))}

          {allPrescriptions.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-2xl">
              No prescriptions recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Lab Reports Tab */}
      {activeTab === 'LAB' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patient.labReports?.map((rep) => (
            <div
              key={rep.id}
              className="bg-[#0b1329]/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {rep.testCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatDate(rep.testDate)}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{rep.testName}</h4>
              <p className="text-xs text-slate-400">Lab: {rep.labName}</p>
              {rep.notes && (
                <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  {rep.notes}
                </p>
              )}
            </div>
          ))}

          {(!patient.labReports || patient.labReports.length === 0) && (
            <div className="col-span-full p-12 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-2xl">
              No diagnostic lab reports uploaded for this patient.
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'BILLING' && (
        <div className="space-y-3">
          {patient.invoices?.map((inv) => (
            <div
              key={inv.id}
              className="bg-[#0b1329]/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{inv.invoiceNo}</span>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(inv.createdAt)} • {inv.paymentMethod}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatCurrency(inv.totalAmount)}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {inv.paymentStatus}
                </span>
              </div>
            </div>
          ))}

          {(!patient.invoices || patient.invoices.length === 0) && (
            <div className="p-12 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-2xl">
              No billing records generated yet.
            </div>
          )}
        </div>
      )}

      {/* Prescription Slip Print Modal */}
      {isPrintModalOpen && (
        <PrescriptionSlipModal
          isOpen={isPrintModalOpen}
          patientData={patient}
          visitData={selectedVisitForPrint || latestVisit}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Edit Patient Modal */}
      {isEditModalOpen && (
        <PatientModal
          isOpen={isEditModalOpen}
          initialData={patient}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadPatientData();
          }}
        />
      )}

      {/* Quick Queue Issue Token Modal */}
      {isQueueModalOpen && (
        <QuickQueueModal
          isOpen={isQueueModalOpen}
          initialPatientId={patient.id}
          onClose={() => setIsQueueModalOpen(false)}
          onSuccess={() => {
            setIsQueueModalOpen(false);
            loadPatientData();
          }}
        />
      )}
    </div>
  );
}
