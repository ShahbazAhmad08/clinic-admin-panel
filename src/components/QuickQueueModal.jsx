'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, User, Stethoscope, AlertCircle, Check, Search } from 'lucide-react';

export default function QuickQueueModal({ isOpen, onClose, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
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
    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorId: selectedDoctorId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Generate OPD Token</h3>
              <p className="text-xs text-slate-400">Add patient to today's doctor consultation queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Patient <span className="text-rose-400">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter patient by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400"
              />
            </div>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.uhid}) • {p.phone} • {p.gender}, {p.age}y
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Consulting Doctor <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} ({d.cabinNo})
                </option>
              ))}
            </select>
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Visit Type</label>
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
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Chief Symptoms / Reason for Visit
            </label>
            <input
              type="text"
              placeholder="e.g. Fever for 2 days, severe headache, stomach ache"
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Issue Token & Add to Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
