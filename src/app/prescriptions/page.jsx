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

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <FileImage className="w-3.5 h-3.5" />
            Digital Rx & Photo Archive
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Doctor Prescriptions Gallery
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse all uploaded handwritten prescription photos and digital Rx records.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, UHID, diagnosis, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong className="text-cyan-400">{filtered.length}</strong> Prescriptions
        </span>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((rx) => {
          const patient = rx.visit?.patient;
          const doctor = rx.visit?.doctor;

          return (
            <div
              key={rx.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Link
                      href={`/patients/${patient?.id}`}
                      className="font-bold text-sm text-slate-100 hover:text-cyan-400 transition-colors block"
                    >
                      {patient?.name}
                    </Link>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {patient?.uhid} • {patient?.gender}, {patient?.age}y
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 font-mono">
                    {formatDate(rx.createdAt)}
                  </span>
                </div>

                {/* Prescription Photo Card */}
                {rx.photoUrl ? (
                  <div
                    onClick={() => {
                      setLightboxPhoto(rx.photoUrl);
                      setZoom(1);
                      setRotation(0);
                    }}
                    className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-[4/3] flex items-center justify-center group cursor-pointer"
                  >
                    <img
                      src={rx.photoUrl}
                      alt="Prescription"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-semibold text-xs">
                      <Eye className="w-4 h-4" />
                      <span>Click to Inspect / Zoom</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-center text-xs text-slate-500">
                    Digital Rx Recorded
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1 text-xs">
                  {rx.visit?.diagnosis && (
                    <p className="text-slate-200">
                      <strong className="text-cyan-400">Diagnosis:</strong> {rx.visit.diagnosis}
                    </p>
                  )}
                  <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Prescribed by {doctor?.name}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <Link
                  href={`/patients/${patient?.id}`}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View Patient History ➔
                </Link>
                {rx.photoUrl && (
                  <button
                    onClick={() => {
                      setLightboxPhoto(rx.photoUrl);
                      setZoom(1);
                      setRotation(0);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" /> Full Size
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
          No prescription records match your query.
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-5 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileImage className="w-4 h-4 text-cyan-400" />
                Handwritten Doctor Prescription Inspection
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950 rounded-2xl">
              <img
                src={lightboxPhoto}
                alt="Prescription"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transition: 'transform 0.2s ease',
                }}
                className="max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
