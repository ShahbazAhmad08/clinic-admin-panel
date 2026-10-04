'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Check,
  FileText,
  Sparkles,
  AlertCircle,
  Calendar,
} from 'lucide-react';

const COMMON_RX_PRESETS = [
  {
    name: 'Viral Fever / Cold',
    medicines: [
      { name: 'Tab Paracetamol 650mg', dosage: '1-0-1', timing: 'After Food', duration: '5 days' },
      { name: 'Tab Levocetirizine 5mg', dosage: '0-0-1', timing: 'Night after food', duration: '5 days' },
      { name: 'Cap Pantoprazole 40mg', dosage: '1-0-0', timing: 'Empty stomach (Morning)', duration: '5 days' },
    ],
    instructions: 'Drink lukewarm water, steam inhalation twice daily, plenty of rest.',
  },
  {
    name: 'Acidity & Gastritis',
    medicines: [
      { name: 'Cap Rabeprazole 20mg + Domperidone 30mg', dosage: '1-0-0', timing: 'Before breakfast', duration: '10 days' },
      { name: 'Gel Mucaine Syrup (10ml)', dosage: '1-1-1', timing: '15 mins before meals', duration: '7 days' },
    ],
    instructions: 'Avoid spicy, oily and street food. Take small frequent meals.',
  },
  {
    name: 'Body Pain / Joint Pain',
    medicines: [
      { name: 'Tab Aceclofenac 100mg + Paracetamol 325mg', dosage: '1-0-1', timing: 'After meals', duration: '5 days' },
      { name: 'Cap Omeprazole 20mg', dosage: '1-0-0', timing: 'Morning before food', duration: '5 days' },
      { name: 'Volini Gel (Local Application)', dosage: 'Apply 2 times', timing: 'External', duration: '7 days' },
    ],
    instructions: 'Hot water fomentation, avoid heavy weight lifting.',
  },
];

export default function PrescriptionUploadModal({ isOpen, onClose, onSuccess, visitData }) {
  const [tab, setTab] = useState('PHOTO'); // 'PHOTO' | 'DIGITAL' | 'BOTH'
  const [photoBase64, setPhotoBase64] = useState(visitData?.prescriptions?.[0]?.photoUrl || null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [diagnosis, setDiagnosis] = useState(visitData?.diagnosis || '');
  const [doctorNotes, setDoctorNotes] = useState(visitData?.doctorNotes || '');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    visitData?.nextFollowUpDate ? new Date(visitData.nextFollowUpDate).toISOString().split('T')[0] : ''
  );

  const [medicines, setMedicines] = useState(
    visitData?.prescriptions?.[0]?.digitalRxJson
      ? JSON.parse(visitData.prescriptions[0].digitalRxJson)
      : [
          { name: '', dosage: '1-0-1', timing: 'After Food', duration: '5 days', notes: '' },
        ]
  );
  const [instructions, setInstructions] = useState(
    visitData?.prescriptions?.[0]?.instructions || ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle File Upload & Convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large! Please upload an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Web Camera start
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions or upload a file.');
      setIsCameraActive(false);
    }
  };

  // Capture frame from Camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoBase64(dataUrl);

    // Stop streams
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '1-0-1', timing: 'After Food', duration: '5 days', notes: '' },
    ]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const applyPreset = (preset) => {
    setMedicines(preset.medicines);
    setInstructions(preset.instructions);
    if (!diagnosis) setDiagnosis(preset.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 'PHOTO' && !photoBase64) {
      setError('Please take a photo or upload an image of the doctor prescription.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: visitData.id,
          prescriptionType: tab === 'PHOTO' ? 'PHOTO_UPLOAD' : tab === 'DIGITAL' ? 'DIGITAL' : 'HYBRID',
          photoUrl: photoBase64,
          digitalRxJson: JSON.stringify(medicines.filter((m) => m.name.trim() !== '')),
          instructions,
          diagnosis,
          doctorNotes,
          nextFollowUpDate: nextFollowUpDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save prescription');

      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Prescription & Consultation
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Token #{visitData?.tokenNo}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-slate-200 font-semibold">{visitData?.patient?.name}</span> ({visitData?.patient?.uhid}) • 📞 {visitData?.patient?.phone}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/30">
          <button
            type="button"
            onClick={() => setTab('PHOTO')}
            className={`pb-2.5 px-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'PHOTO'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Prescription Photo Upload / Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('DIGITAL')}
            className={`pb-2.5 px-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'DIGITAL'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Digital Prescription (Rx Table)</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Doctor Diagnosis & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clinical Diagnosis
              </label>
              <input
                type="text"
                placeholder="e.g. Acute Upper Respiratory Tract Infection"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* TAB 1: Photo Upload / Live Camera */}
          {tab === 'PHOTO' && (
            <div className="space-y-4">
              {!photoBase64 && !isCameraActive && (
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-8 text-center transition-all bg-slate-950/20">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Upload Handwritten Doctor's Prescription
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                    Take a clear photo using your mobile/webcam or browse and upload a JPG/PNG file of the prescription slip.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      <UploadCloud className="w-4 h-4 text-cyan-400" />
                      <span>Browse Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Use Camera / WebCam</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Live View */}
              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black flex flex-col items-center justify-center p-4">
                  <video ref={videoRef} autoPlay playsInline className="max-h-[380px] rounded-xl w-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Photo Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                    >
                      Cancel Camera
                    </button>
                  </div>
                </div>
              )}

              {/* Uploaded Photo Preview with Zoom & Rotate Tools */}
              {photoBase64 && !isCameraActive && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Prescription Photo Attached
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1"
                        title="Rotate 90deg"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoBase64(null)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-1 border border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[340px] max-h-[460px] p-4">
                    <img
                      src={photoBase64}
                      alt="Prescription"
                      style={{
                        transform: `rotate(${rotation}deg) scale(${zoom})`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-[400px] object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Digital Prescription Rx Table */}
          {tab === 'DIGITAL' && (
            <div className="space-y-4">
              {/* Presets Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Templates:
                </span>
                {COMMON_RX_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-slate-300 border border-slate-700 transition-all flex-shrink-0"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>

              {/* Medicine Table */}
              <div className="space-y-2">
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 items-center"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Tab Azithromycin 500mg)"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="1-0-1">1-0-1 (BD)</option>
                        <option value="1-1-1">1-1-1 (TDS)</option>
                        <option value="1-0-0">1-0-0 (OD Morn)</option>
                        <option value="0-0-1">0-0-1 (OD Night)</option>
                        <option value="SOS">SOS (When needed)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <select
                        value={med.timing}
                        onChange={(e) => updateMedicine(idx, 'timing', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="Empty Stomach">Empty Stomach</option>
                        <option value="With Milk">With Milk</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="5 days"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        disabled={medicines.length === 1}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMedicineRow}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Medicine</span>
              </button>

              {/* Dietary / Lifestyle Advice */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  General Instructions & Dietary Advice
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bed rest for 2 days, avoid sour foods, drink warm water..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {photoBase64 ? '✓ Photo Attached' : 'No photo uploaded'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Save Prescription & Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
