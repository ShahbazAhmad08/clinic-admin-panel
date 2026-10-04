'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Calendar,
  AlertTriangle,
  Heart,
  ArrowRight,
  Edit2,
  Clock,
  Eye,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import PatientModal from '@/components/PatientModal';
import QuickQueueModal from '@/components/QuickQueueModal';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.uhid.toLowerCase().includes(search.toLowerCase()) ||
      p.bloodGroup?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['UHID,Name,Phone,Age,Gender,Blood Group,Allergies,Chronic Diseases,Registered Date\n'];
    const rows = filteredPatients.map((p) =>
      `"${p.uhid}","${p.name}","${p.phone}","${p.age}","${p.gender}","${p.bloodGroup || ''}","${p.allergies || ''}","${p.chronicDiseases || ''}","${formatDate(p.createdAt)}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            Electronic Health Records (EHR)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Patients Medical Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Search patient records, medical history, last visit details & prescription archives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingPatient(null);
              setIsPatientModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, Phone Number, UHID (e.g. PAT-2026-0001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-cyan-400 font-bold">{filteredPatients.length}</span> registered patients
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">UHID</th>
                <th className="py-3.5 px-5">Patient Name</th>
                <th className="py-3.5 px-5">Contact / Phone</th>
                <th className="py-3.5 px-5">Demographics</th>
                <th className="py-3.5 px-5">Allergies & Medical Notes</th>
                <th className="py-3.5 px-5">Last Visit Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.map((patient) => {
                const lastVisit = patient.visits?.[0];

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* UHID */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                        {patient.uhid}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-5">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors block"
                      >
                        {patient.name}
                      </Link>
                      <span className="text-[11px] text-slate-500">
                        Reg: {formatDate(patient.createdAt)}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-200">📞 {patient.phone}</p>
                      {patient.address && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {patient.address}
                        </p>
                      )}
                    </td>

                    {/* Age / Gender / Blood */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {patient.gender}, {patient.age}y
                        </span>
                        {patient.bloodGroup && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[11px] font-bold">
                            {patient.bloodGroup}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Allergies / Chronic */}
                    <td className="py-4 px-5 max-w-xs">
                      {patient.allergies ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                          ⚠️ {patient.allergies}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No known drug allergies</span>
                      )}
                      {patient.chronicDiseases && (
                        <p className="text-[11px] text-slate-400 mt-1 truncate">
                          • {patient.chronicDiseases}
                        </p>
                      )}
                    </td>

                    {/* Last Visit */}
                    <td className="py-4 px-5">
                      {lastVisit ? (
                        <div>
                          <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            {formatDate(lastVisit.visitDate)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {lastVisit.diagnosis || 'General Checkup'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Never Visited</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingPatient(patient);
                            setIsPatientModalOpen(true);
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/patients/${patient.id}`}
                          className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl font-semibold text-xs flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>History</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isPatientModalOpen && (
        <PatientModal
          isOpen={isPatientModalOpen}
          initialData={editingPatient}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={() => {
            setIsPatientModalOpen(false);
            loadPatients();
          }}
        />
      )}
    </div>
  );
}
