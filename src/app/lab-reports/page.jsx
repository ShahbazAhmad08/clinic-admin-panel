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
  X,
  FileImage,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const TEST_PRESETS = [
  'Complete Blood Count (CBC) & AEC',
  'CD4 / CD8 Absolute Count',
  'HIV 1 & 2 Antibody / Viral Load',
  'Skin Scraping for Fungus (KOH Mount)',
  'Skin Biopsy & Histopathology',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT / RFT)',
  'Serum IgE Level (Allergy Panel)',
  'VDRL / RPR Syphilis Serology',
  'Blood Sugar (Fasting & PP)',
];

export default function LabReportsPage() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReportView, setSelectedReportView] = useState(null);

  // Upload state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testName, setTestName] = useState('');
  const [testCategory, setTestCategory] = useState('DERMATOLOGY');
  const [labName, setLabName] = useState('Skin & HIV Care Diagnostic Center');
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
      if (pData.patients?.length > 0 && !selectedPatientId) {
        setSelectedPatientId(pData.patients[0].id);
      }
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
    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }
    if (!testName) {
      setError('Please specify or select a test name.');
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
          reportFileUrl: reportFileBase64 || '',
          fileType: reportFileBase64?.startsWith('data:application/pdf') ? 'PDF' : 'IMAGE',
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

  const filtered = reports.filter((r) => {
    const matchesCategory = categoryFilter === 'ALL' || r.testCategory === categoryFilter;
    const matchesSearch =
      r.testName?.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.uhid?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1329]/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            Diagnostics & Pathology Records • Dr. Amitabh Upadhyay
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
            Specialized Lab & Pathology Reports
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage Dermatology, HIV / Immunology, and routine diagnostic laboratory reports.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-700/25 active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Lab Report</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b1329]/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All Reports (${reports.length})` },
            { id: 'DERMATOLOGY', label: 'Skin & Dermatology' },
            { id: 'IMMUNOLOGY', label: 'HIV & Immunology' },
            { id: 'PATHOLOGY', label: 'Blood & Pathology' },
            { id: 'BIOCHEMISTRY', label: 'Biochemistry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === tab.id
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
            placeholder="Search test, patient, UHID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rep) => (
          <div
            key={rep.id}
            className="bg-[#0b1329]/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                {rep.testCategory}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatDate(rep.testDate)}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white line-clamp-1">{rep.testName}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <Link
                  href={`/patients/${rep.patient?.id}`}
                  className="font-semibold text-slate-200 hover:text-blue-400"
                >
                  {rep.patient?.name}
                </Link>
                <span className="font-mono text-blue-400">({rep.patient?.uhid})</span>
              </p>
            </div>

            {rep.notes && (
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Test Findings:</span>
                <p className="font-mono">{rep.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[180px]">Lab: {rep.labName || 'In-House'}</span>
              {rep.reportFileUrl ? (
                <button
                  onClick={() => setSelectedReportView(rep)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Doc</span>
                </button>
              ) : (
                <span className="text-slate-500 italic text-[11px]">Values logged</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center text-slate-500 bg-[#0b1329]/40 border border-slate-800 rounded-2xl">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-300">No diagnostic reports found</h4>
          <p className="text-xs text-slate-500 mt-1">Upload a new test report for any registered patient.</p>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Upload Diagnostic Lab Report</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Patient <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid}) - 📞 {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Common Test Presets (Quick Select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TEST_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setTestName(preset);
                        if (preset.includes('HIV') || preset.includes('CD4')) {
                          setTestCategory('IMMUNOLOGY');
                        } else if (preset.includes('Skin') || preset.includes('IgE')) {
                          setTestCategory('DERMATOLOGY');
                        } else {
                          setTestCategory('PATHOLOGY');
                        }
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 border border-slate-700 transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Test Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. CD4 Count / Skin Biopsy"
                    className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="DERMATOLOGY">Skin & Dermatology</option>
                    <option value="IMMUNOLOGY">HIV & Immunology</option>
                    <option value="PATHOLOGY">Pathology / Blood</option>
                    <option value="BIOCHEMISTRY">Biochemistry</option>
                    <option value="OTHER">Other Diagnostic</option>
                  </select>
                </div>
              </div>

              {/* Lab Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Laboratory Name</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Attach Report File (Image / Scan / PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Test Results / Values / Doctor Interpretation
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. CD4 Absolute Count: 520 cells/mcL. Normal range. No opportunistic infection."
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex-shrink-0 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-700/25 disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {selectedReportView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[92vh] flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedReportView.testName}</h3>
                <p className="text-xs text-slate-400">{selectedReportView.patient?.name} ({selectedReportView.patient?.uhid})</p>
              </div>
              <button
                onClick={() => setSelectedReportView(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {selectedReportView.reportFileUrl && (
                <div className="max-h-[500px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-4">
                  <img
                    src={selectedReportView.reportFileUrl}
                    alt={selectedReportView.testName}
                    className="max-h-[450px] object-contain rounded-lg"
                  />
                </div>
              )}

              {selectedReportView.notes && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">Interpretation:</span>
                  <p>{selectedReportView.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
