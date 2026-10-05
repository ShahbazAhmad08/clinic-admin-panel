'use client';

import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Heart, AlertTriangle, MapPin, ShieldAlert, Check, Printer, Clock } from 'lucide-react';
import PrescriptionSlipModal from './PrescriptionSlipModal';

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

  const [generateToken, setGenerateToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Print Modal State after registration
  const [printPatient, setPrintPatient] = useState(null);
  const [printVisit, setPrintVisit] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!isOpen && !isPrintModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAndPrint = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
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

      const savedPatient = data.patient;

      // If registering new patient and generateToken is enabled, create today's visit
      let createdVisit = null;
      if (!initialData?.id && generateToken) {
        try {
          const docRes = await fetch('/api/doctors');
          const docData = await docRes.json();
          const primaryDoc = docData.doctors?.[0];

          if (primaryDoc) {
            const vRes = await fetch('/api/visits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId: savedPatient.id,
                doctorId: primaryDoc.id,
                visitType: 'NEW_VISIT',
                chiefComplaints: formData.chronicDiseases || 'OPD Consultation',
              }),
            });
            const vData = await vRes.json();
            if (vRes.ok) {
              createdVisit = vData.visit;
            }
          }
        } catch (vErr) {
          console.error('Auto visit generation error:', vErr);
        }
      }

      if (shouldPrint) {
        setPrintPatient(savedPatient);
        setPrintVisit(createdVisit || { tokenNo: 1, visitDate: new Date() });
        setIsPrintModalOpen(true);
      } else {
        if (onSuccess) onSuccess(savedPatient);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {initialData ? 'Edit Patient Record' : 'New Patient Registration (मरीज पंजीकरण)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Skin & HIV Care Clinic • Dr. Amitabh Upadhyay
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
            <form onSubmit={(e) => handleSaveAndPrint(e, true)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Patient Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Anishta"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                      className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    placeholder="e.g. 52"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Male">Male (पुरुष)</option>
                    <option value="Female">Female (महिला)</option>
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
                    className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    placeholder="e.g. Son / Relative: 9811223344"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Address / City</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Civil Lines / Jhunsi, Prayagraj"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Clinical Alerts / Allergies / Chronic Conditions */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-rose-400 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Drug Allergies (दवा एलर्जी)
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    placeholder="e.g. Penicillin, Sulfa drugs (Leave blank if none)"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full bg-rose-950/15 border border-rose-500/30 rounded-xl px-3.5 py-2 text-sm text-rose-200 placeholder-rose-400/40 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Chief Complaint / Skin Problem / Medical History
                  </label>
                  <input
                    type="text"
                    name="chronicDiseases"
                    placeholder="e.g. Skin rashes, Dermatitis, Psoriasis, Eczema, Allergy"
                    value={formData.chronicDiseases}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Auto Token Checkbox for today */}
              {!initialData && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-300">
                    <input
                      type="checkbox"
                      checked={generateToken}
                      onChange={(e) => setGenerateToken(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Auto-generate OPD Token & add to Today's Queue</span>
                  </label>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  {/* Save Only Button */}
                  <button
                    type="button"
                    onClick={(e) => handleSaveAndPrint(e, false)}
                    disabled={loading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all border border-slate-700 disabled:opacity-50"
                  >
                    <span>{initialData ? 'Update Record' : 'Save Only'}</span>
                  </button>

                  {/* Save & 1-Click Print Parcha Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-700/25 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                    <span>{initialData ? 'Update & Print Slip' : 'Register & Print Parcha 🖨️'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Slip Print Modal */}
      {isPrintModalOpen && printPatient && (
        <PrescriptionSlipModal
          isOpen={isPrintModalOpen}
          patientData={printPatient}
          visitData={printVisit}
          onClose={() => {
            setIsPrintModalOpen(false);
            if (onSuccess) onSuccess(printPatient);
            onClose();
          }}
        />
      )}
    </>
  );
}
