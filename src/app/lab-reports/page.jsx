'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Search,
  UploadCloud,
  Calendar,
  User,
  Eye,
  FileText,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function LabReportsPage() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testName, setTestName] = useState('');
  const [testCategory, setTestCategory] = useState('PATHOLOGY');
  const [labName, setLabName] = useState('Arogya Pathology Lab');
  const [reportFileBase64, setReportFileBase64] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        fetch('/api/lab-reports'),
        fetch('/api/patients'),
      ]);
      const rData = await rRes.json();
      const pData = await pRes.json();
      setReports(rData.labReports || []);
      setPatients(pData.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReportFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!reportFileBase64) {
      setError('Please select a report image or PDF file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const res = await fetch('/api/lab-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          testName,
          testCategory,
          labName,
          reportFileUrl: reportFileBase64,
          fileType: 'IMAGE',
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload report');

      setIsUploadModalOpen(false);
      setReportFileBase64('');
      setTestName('');
      setNotes('');
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const filtered = reports.filter(
    (r) =>
      r.testName?.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.uhid?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            Diagnostics & Pathology Records
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Lab & Diagnostic Reports Archive
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Store and access blood tests, X-rays, ECG, and pathology results.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Lab Report</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test name, patient, UHID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong className="text-cyan-400">{filtered.length}</strong> Reports
        </span>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 font-bold text-[11px] border border-cyan-500/30">
                  {r.testCategory}
                </span>
                <span className="text-xs text-slate-400">{formatDate(r.testDate)}</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{r.testName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lab: <span className="text-slate-200">{r.labName}</span>
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                <p className="text-slate-400 font-semibold mb-1">Patient Details:</p>
                <Link
                  href={`/patients/${r.patient?.id}`}
                  className="font-bold text-slate-100 hover:text-cyan-400 transition-colors block"
                >
                  {r.patient?.name} ({r.patient?.uhid})
                </Link>
                <p className="text-slate-500 text-[11px] mt-0.5">📞 {r.patient?.phone}</p>
              </div>

              {r.notes && (
                <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <strong>Notes:</strong> {r.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link
                href={`/patients/${r.patient?.id}`}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                View Patient History ➔
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
          No lab reports found. Click "Upload New Lab Report" to attach test files.
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" /> Upload Diagnostic / Lab Report
            </h3>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Patient *
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid}) • {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Test / Investigation Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, Chest X-Ray"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="PATHOLOGY">Pathology (Blood/Urine)</option>
                    <option value="RADIOLOGY">Radiology (X-Ray/MRI/USG)</option>
                    <option value="BIOCHEMISTRY">Biochemistry</option>
                    <option value="CARDIOLOGY">ECG / Cardiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lab Center</label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Upload Report File (JPG, PNG, PDF) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Findings / Doctor's Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hemoglobin normal, elevated TLC"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
                >
                  {uploading ? 'Uploading...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
