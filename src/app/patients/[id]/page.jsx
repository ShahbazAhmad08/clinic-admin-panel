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

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TIMELINE'); // 'TIMELINE' | 'PRESCRIPTIONS' | 'LAB' | 'BILLING'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

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
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading Patient Electronic Health Record...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-2">Patient Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">The requested patient record does not exist.</p>
        <Link
          href="/patients"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
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

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </Link>
      </div>

      {/* Patient Profile Card Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-cyan-600/20">
              {patient.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black text-white">{patient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
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

          <div className="flex items-center gap-3">
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
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-cyan-400 uppercase tracking-wide text-[10px]">
                    Chronic Medical Conditions
                  </strong>
                  <span>{patient.chronicDiseases}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Address / City</span>
            <span className="font-semibold text-slate-200">{patient.address || 'Not Provided'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Emergency Contact</span>
            <span className="font-semibold text-slate-200">{patient.emergencyContact || 'None'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">First Registered</span>
            <span className="font-semibold text-slate-200">{formatDate(patient.createdAt)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Total Consultations</span>
            <span className="font-semibold text-cyan-400 font-mono">
              {patient.visits?.length || 0} Visits
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        {[
          { id: 'TIMELINE', label: `Visits & Clinical Timeline (${patient.visits?.length || 0})`, icon: Calendar },
          { id: 'PRESCRIPTIONS', label: `Prescription Photos (${allPrescriptions.length})`, icon: FileImage },
          { id: 'LAB', label: `Lab Reports (${patient.labReports?.length || 0})`, icon: FlaskConical },
          { id: 'BILLING', label: `Invoices & Receipts (${patient.invoices?.length || 0})`, icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'TIMELINE' && <PatientTimeline visits={patient.visits || []} />}

      {/* Prescription Gallery Tab */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPrescriptions.map((rx, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{formatDate(rx.visitDate)}</span>
                <span className="text-[11px] text-cyan-400">{rx.doctor?.name}</span>
              </div>

              {rx.photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-[3/4] flex items-center justify-center group cursor-pointer">
                  <img
                    src={rx.photoUrl}
                    alt="Prescription Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click to Open
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-xl text-center text-xs text-slate-500">
                  Digital Prescription Only (No photo)
                </div>
              )}

              {rx.diagnosis && (
                <p className="text-xs text-slate-300 font-medium">
                  <strong>Diagnosis:</strong> {rx.diagnosis}
                </p>
              )}
            </div>
          ))}
          {allPrescriptions.length === 0 && (
            <div className="col-span-3 p-12 text-center text-xs text-slate-500">
              No prescriptions uploaded for this patient yet.
            </div>
          )}
        </div>
      )}

      {/* Lab Reports Tab */}
      {activeTab === 'LAB' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(patient.labReports || []).map((lab) => (
            <div
              key={lab.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{lab.testName}</h4>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                  {lab.testCategory}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Date: {formatDate(lab.testDate)} • Lab: {lab.labName}
              </p>
              {lab.notes && <p className="text-xs text-slate-300 italic">{lab.notes}</p>}
            </div>
          ))}
          {(patient.labReports || []).length === 0 && (
            <div className="col-span-2 p-12 text-center text-xs text-slate-500">
              No lab or diagnostic reports uploaded yet.
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'BILLING' && (
        <div className="space-y-3">
          {(patient.invoices || []).map((inv) => (
            <div
              key={inv.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-100 font-mono">{inv.invoiceNo}</span>
                <p className="text-[11px] text-slate-400">{formatDate(inv.createdAt)}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(inv.totalAmount)}
                </span>
                <p className="text-[10px] text-slate-400 uppercase">
                  {inv.paymentMethod} • {inv.paymentStatus}
                </p>
              </div>
            </div>
          ))}
          {(patient.invoices || []).length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500">
              No billing records found.
            </div>
          )}
        </div>
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

      {/* Generate Token Modal */}
      {isQueueModalOpen && (
        <QuickQueueModal
          isOpen={isQueueModalOpen}
          onClose={() => setIsQueueModalOpen(false)}
          onSuccess={() => {
            setIsQueueModalOpen(false);
            router.push('/queue');
          }}
        />
      )}
    </div>
  );
}
