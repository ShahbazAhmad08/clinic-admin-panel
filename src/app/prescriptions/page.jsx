'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileImage,
  Search,
  Calendar,
  User,
  Stethoscope,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Printer,
  Download,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import PrescriptionSlipModal from '@/components/PrescriptionSlipModal';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedRxForPrint, setSelectedRxForPrint] = useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prescriptions');
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = prescriptions.filter(
    (p) =>
      p.visit?.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.visit?.patient?.uhid?.toLowerCase().includes(search.toLowerCase()) ||
      p.visit?.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.visit?.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1329]/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <FileImage className="w-3.5 h-3.5" />
            Digital Rx & Prescription Records • Dr. Amitabh Upadhyay
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
            Prescriptions Archive & Print Desk
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse all prescriptions, 1-click print doctor parcha, and view historical medical records.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0b1329]/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, UHID, diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong className="text-blue-400">{filtered.length}</strong> Prescriptions
        </span>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((rx) => {
          const patient = rx.visit?.patient;
          const doctor = rx.visit?.doctor;
          let digitalMeds = [];
          if (rx.digitalRxJson) {
            try {
              digitalMeds = JSON.parse(rx.digitalRxJson);
            } catch (e) {}
          }

          return (
            <div
              key={rx.id}
              className="bg-[#0b1329]/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Info */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Link
                      href={`/patients/${patient?.id}`}
                      className="font-bold text-sm text-white hover:text-blue-400 transition-colors"
                    >
                      {patient?.name}
                    </Link>
                    <p className="text-[11px] text-slate-400 font-mono">
                      UHID: <span className="text-blue-400">{patient?.uhid}</span> • {patient?.gender}, {patient?.age}y
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(rx.visit?.visitDate || rx.createdAt)}
                  </span>
                </div>

                {/* Diagnosis & Complaints */}
                {rx.visit?.diagnosis && (
                  <div className="text-xs">
                    <span className="text-slate-400 font-medium">Diagnosis:</span>
                    <p className="font-semibold text-blue-300">{rx.visit.diagnosis}</p>
                  </div>
                )}

                {/* Medicines Preview */}
                {digitalMeds.length > 0 && (
                  <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Prescribed Medicines ({digitalMeds.length}):</span>
                    {digitalMeds.slice(0, 3).map((m, idx) => (
                      <p key={idx} className="text-slate-200 truncate">
                        • {m.name} ({m.dosage})
                      </p>
                    ))}
                    {digitalMeds.length > 3 && (
                      <p className="text-[10px] text-blue-400 font-semibold">+{digitalMeds.length - 3} more</p>
                    )}
                  </div>
                )}

                {/* Photo Preview if photo uploaded */}
                {rx.photoUrl && (
                  <div
                    onClick={() => {
                      setLightboxPhoto(rx.photoUrl);
                      setZoom(1);
                      setRotation(0);
                    }}
                    className="relative h-36 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer group flex items-center justify-center"
                  >
                    <img
                      src={rx.photoUrl}
                      alt="Prescription Scan"
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5">
                      <Eye className="w-4 h-4" /> Click to Zoom Photo
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Dr. Amitabh Upadhyay</span>
                <button
                  onClick={() =>
                    setSelectedRxForPrint({
                      ...rx,
                      patient,
                      prescriptions: [rx],
                    })
                  }
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-700/20 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Prescription</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-2xl">
          <FileImage className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-300">No prescriptions found</h4>
          <p className="text-xs text-slate-500 mt-1">Prescriptions issued during OPD visits will appear here.</p>
        </div>
      )}

      {/* Prescription Slip Print Modal */}
      {selectedRxForPrint && (
        <PrescriptionSlipModal
          isOpen={!!selectedRxForPrint}
          patientData={selectedRxForPrint.patient}
          visitData={selectedRxForPrint.visit || selectedRxForPrint}
          onClose={() => setSelectedRxForPrint(null)}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Prescription Photo High-Res Viewer</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRxForPrint({
                      photoUrl: lightboxPhoto,
                      patient: { name: 'Prescription Document' },
                    });
                  }}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-4 min-h-0">
              <img
                src={lightboxPhoto}
                alt="Prescription High Res"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                }}
                className="max-h-[65vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
