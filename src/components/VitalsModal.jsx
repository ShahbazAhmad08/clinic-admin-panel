'use client';

import React, { useState } from 'react';
import { X, Activity, Heart, Thermometer, Scale, Droplet, Check, AlertCircle } from 'lucide-react';

export default function VitalsModal({ isOpen, onClose, onSuccess, visitData }) {
  const [formData, setFormData] = useState({
    bpSystolic: visitData?.vitals?.[0]?.bpSystolic || 120,
    bpDiastolic: visitData?.vitals?.[0]?.bpDiastolic || 80,
    pulseRate: visitData?.vitals?.[0]?.pulseRate || 74,
    weight: visitData?.vitals?.[0]?.weight || '',
    temperature: visitData?.vitals?.[0]?.temperature || 98.6,
    spo2: visitData?.vitals?.[0]?.spo2 || 99,
    bloodSugar: visitData?.vitals?.[0]?.bloodSugar || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: visitData.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save vitals');

      onSuccess(data.vital);
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
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Patient Vitals</h3>
              <p className="text-[11px] text-slate-400">
                {visitData?.patient?.name} • Token #{visitData?.tokenNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Blood Pressure Systolic / Diastolic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> BP Systolic (mmHg)
              </label>
              <input
                type="number"
                name="bpSystolic"
                placeholder="120"
                value={formData.bpSystolic}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> BP Diastolic (mmHg)
              </label>
              <input
                type="number"
                name="bpDiastolic"
                placeholder="80"
                value={formData.bpDiastolic}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Pulse Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Pulse Rate (bpm)
              </label>
              <input
                type="number"
                name="pulseRate"
                placeholder="74"
                value={formData.pulseRate}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temp (°F)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                placeholder="98.6"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* SPO2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-emerald-400" /> SpO2 (%)
              </label>
              <input
                type="number"
                name="spo2"
                placeholder="99"
                value={formData.spo2}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-indigo-400" /> Body Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                placeholder="68.5"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Blood Sugar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-rose-400" /> Blood Sugar (Random / Fasting mg/dL)
            </label>
            <input
              type="number"
              step="0.1"
              name="bloodSugar"
              placeholder="e.g. 110"
              value={formData.bloodSugar}
              onChange={handleChange}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>
        </form>

        {/* Footer (Pinned Bottom) */}
        <div className="flex-shrink-0 px-5 sm:px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Save Vitals</span>
          </button>
        </div>
      </div>
    </div>
  );
}
