'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, User, Stethoscope, AlertCircle, Check, Search } from 'lucide-react';

export default function QuickQueueModal({ isOpen, onClose, onSuccess, initialPatientId = '' }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [visitType, setVisitType] = useState('NEW_VISIT');
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  const fetchData = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      setPatients(pData.patients || []);
      setDoctors(dData.doctors || []);
      if (dData.doctors?.length > 0) {
        setSelectedDoctorId(dData.doctors[0].id);
      }
      if (!selectedPatientId && pData.patients?.length > 0 && !initialPatientId) {
        setSelectedPatientId(pData.patients[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.uhid.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const docId = selectedDoctorId || doctors[0]?.id;
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorId: docId,
          visitType,
          chiefComplaints,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate token');

      onSuccess(data.visit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header (Pinned Top) */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate OPD Token #</h3>
              <p className="text-[11px] text-slate-400">Add patient to today's consultation queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Registered Patient <span className="text-rose-400">*</span>
            </label>

            {/* Quick Search inside modal */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.gender}, {p.age}y) — 📞 {p.phone} [{p.uhid}]
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Consulting Doctor
            </label>
            <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Dr. Amitabh Upadhyay</p>
                <p className="text-[11px] text-blue-400">Senior Consultant Dermatology, V.D., Leprosy & AIDS</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px] font-mono">
                Main Cabin
              </span>
            </div>
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Visit Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NEW_VISIT', label: 'New OPD Visit' },
                { id: 'FOLLOW_UP', label: 'Follow Up' },
                { id: 'EMERGENCY', label: 'Emergency 🚨' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setVisitType(type.id)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                    visitType === type.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-bold shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chief Complaints / Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chief Symptoms / Reason for Visit
            </label>
            <input
              type="text"
              placeholder="e.g. Skin rashes, itching, routine review"
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer (Pinned Bottom) */}
        <div className="flex-shrink-0 px-5 sm:px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-700/25 disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Issue Token & Add to Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
