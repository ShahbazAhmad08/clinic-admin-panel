'use client';

import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Heart, AlertTriangle, MapPin, ShieldAlert, Check } from 'lucide-react';

export default function PatientModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    age: initialData?.age || '',
    gender: initialData?.gender || 'Male',
    bloodGroup: initialData?.bloodGroup || 'O+',
    address: initialData?.address || '',
    emergencyContact: initialData?.emergencyContact || '',
    allergies: initialData?.allergies || '',
    chronicDiseases: initialData?.chronicDiseases || '',
    medicalHistory: initialData?.medicalHistory || '',
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
      const url = initialData?.id ? `/api/patients/${initialData.id}` : '/api/patients';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save patient details');
      }

      onSuccess(data.patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {initialData ? 'Edit Patient Record' : 'New Patient Registration'}
              </h3>
              <p className="text-xs text-slate-400">
                Front-desk registration & digital health record entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Chandra Verma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Phone / WhatsApp Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Age (in Years) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="age"
                required
                min="0"
                max="125"
                placeholder="e.g. 42"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Emergency Contact (Name & Phone)
              </label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="e.g. Brother: 9811223344"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Address / City</label>
            <input
              type="text"
              name="address"
              placeholder="e.g. 14/B, Civil Lines, Kanpur, UP"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Clinical Alerts / Allergies / Chronic Conditions */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-medium text-rose-400 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Drug Allergies (Important Warning)
              </label>
              <input
                type="text"
                name="allergies"
                placeholder="e.g. Penicillin, Paracetamol, Sulfa drugs (Leave blank if none)"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full bg-rose-950/15 border border-rose-500/30 rounded-xl px-3.5 py-2 text-sm text-rose-200 placeholder-rose-400/40 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Chronic Illnesses / Past Medical Conditions
              </label>
              <input
                type="text"
                name="chronicDiseases"
                placeholder="e.g. Type 2 Diabetes, Hypertension (High BP), Asthma, Thyroid"
                value={formData.chronicDiseases}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{initialData ? 'Update Record' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
