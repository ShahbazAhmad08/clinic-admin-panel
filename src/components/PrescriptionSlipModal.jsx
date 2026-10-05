'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Image as ImageIcon, FileText, Download, Check, Stethoscope } from 'lucide-react';
import ClinicLogo from './ClinicLogo';

// Crisp realistic QR Code SVG for ICICI UPI / Clinic Desk
function ClinicQRCode({ className = 'w-14 h-14' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" fill="white" />
      {/* Top-Left Finder */}
      <rect x="6" y="6" width="26" height="26" fill="#0f172a" rx="2" />
      <rect x="11" y="11" width="16" height="16" fill="white" />
      <rect x="15" y="15" width="8" height="8" fill="#0f172a" />

      {/* Top-Right Finder */}
      <rect x="68" y="6" width="26" height="26" fill="#0f172a" rx="2" />
      <rect x="73" y="11" width="16" height="16" fill="white" />
      <rect x="77" y="15" width="8" height="8" fill="#0f172a" />

      {/* Bottom-Left Finder */}
      <rect x="6" y="68" width="26" height="26" fill="#0f172a" rx="2" />
      <rect x="11" y="73" width="16" height="16" fill="white" />
      <rect x="15" y="77" width="8" height="8" fill="#0f172a" />

      {/* Timing Patterns and Data matrix dots */}
      <rect x="36" y="10" width="4" height="4" fill="#0f172a" />
      <rect x="44" y="10" width="4" height="4" fill="#0f172a" />
      <rect x="52" y="10" width="4" height="4" fill="#0f172a" />
      <rect x="60" y="10" width="4" height="4" fill="#0f172a" />

      <rect x="10" y="36" width="4" height="4" fill="#0f172a" />
      <rect x="10" y="44" width="4" height="4" fill="#0f172a" />
      <rect x="10" y="52" width="4" height="4" fill="#0f172a" />
      <rect x="10" y="60" width="4" height="4" fill="#0f172a" />

      <rect x="36" y="20" width="6" height="4" fill="#0f172a" />
      <rect x="48" y="20" width="6" height="6" fill="#0f172a" />
      <rect x="58" y="24" width="4" height="8" fill="#0f172a" />

      <rect x="36" y="36" width="8" height="8" fill="#0f172a" />
      <rect x="48" y="36" width="6" height="4" fill="#0f172a" />
      <rect x="58" y="36" width="8" height="8" fill="#0f172a" />
      <rect x="70" y="36" width="8" height="4" fill="#0f172a" />
      <rect x="82" y="36" width="8" height="8" fill="#0f172a" />

      <rect x="36" y="48" width="6" height="6" fill="#0f172a" />
      <rect x="46" y="48" width="8" height="4" fill="#0f172a" />
      <rect x="58" y="48" width="6" height="6" fill="#0f172a" />
      <rect x="68" y="48" width="8" height="6" fill="#0f172a" />
      <rect x="80" y="48" width="6" height="6" fill="#0f172a" />

      <rect x="36" y="58" width="8" height="6" fill="#0f172a" />
      <rect x="48" y="58" width="6" height="8" fill="#0f172a" />
      <rect x="60" y="60" width="6" height="4" fill="#0f172a" />
      <rect x="72" y="58" width="6" height="8" fill="#0f172a" />
      <rect x="82" y="60" width="8" height="6" fill="#0f172a" />

      <rect x="36" y="70" width="6" height="8" fill="#0f172a" />
      <rect x="46" y="72" width="8" height="6" fill="#0f172a" />
      <rect x="58" y="70" width="6" height="8" fill="#0f172a" />
      <rect x="68" y="72" width="8" height="6" fill="#0f172a" />
      <rect x="80" y="70" width="8" height="8" fill="#0f172a" />

      <rect x="36" y="82" width="8" height="8" fill="#0f172a" />
      <rect x="48" y="82" width="6" height="6" fill="#0f172a" />
      <rect x="58" y="84" width="8" height="6" fill="#0f172a" />
      <rect x="70" y="82" width="6" height="8" fill="#0f172a" />
      <rect x="80" y="84" width="8" height="6" fill="#0f172a" />
    </svg>
  );
}

// Helpers for extracting data safely from diverse shapes
function extractPhotoUrl(visitData, patientData) {
  return (
    visitData?.photoUrl ||
    visitData?.prescription?.photoUrl ||
    visitData?.prescriptions?.[0]?.photoUrl ||
    patientData?.photoUrl ||
    patientData?.prescriptions?.[0]?.photoUrl ||
    patientData?.visits?.[0]?.prescriptions?.[0]?.photoUrl ||
    patientData?.visits?.[0]?.photoUrl ||
    null
  );
}

function extractMedicines(visitData, patientData) {
  // If already array in visitData.medicines
  if (Array.isArray(visitData?.medicines) && visitData.medicines.length > 0) {
    return visitData.medicines;
  }

  const rawList = [
    visitData?.digitalRxJson,
    visitData?.prescription?.digitalRxJson,
    visitData?.prescriptions?.[0]?.digitalRxJson,
    patientData?.prescriptions?.[0]?.digitalRxJson,
    patientData?.visits?.[0]?.prescriptions?.[0]?.digitalRxJson,
    patientData?.visits?.[0]?.digitalRxJson,
  ];

  for (const raw of rawList) {
    if (!raw) continue;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object' && raw !== null) return [raw];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (parsed && typeof parsed === 'object') return [parsed];
      } catch (e) {}
    }
  }

  // Iterate over all prescriptions array if available
  if (Array.isArray(visitData?.prescriptions)) {
    for (const rx of visitData.prescriptions) {
      if (rx?.digitalRxJson) {
        if (Array.isArray(rx.digitalRxJson)) return rx.digitalRxJson;
        try {
          const parsed = JSON.parse(rx.digitalRxJson);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
  }

  return [];
}

function extractInstructions(visitData, patientData) {
  return (
    visitData?.instructions ||
    visitData?.prescription?.instructions ||
    visitData?.prescriptions?.[0]?.instructions ||
    patientData?.prescriptions?.[0]?.instructions ||
    patientData?.visits?.[0]?.prescriptions?.[0]?.instructions ||
    patientData?.visits?.[0]?.instructions ||
    ''
  );
}

function extractDiagnosis(visitData, patientData) {
  return (
    visitData?.diagnosis ||
    visitData?.visit?.diagnosis ||
    patientData?.visits?.[0]?.diagnosis ||
    ''
  );
}

export default function PrescriptionSlipModal({
  isOpen,
  onClose,
  patientData,
  visitData = null,
}) {
  const printRef = useRef(null);

  const photoUrl = extractPhotoUrl(visitData, patientData);
  const medicines = extractMedicines(visitData, patientData);
  const instructions = extractInstructions(visitData, patientData);
  const diagnosis = extractDiagnosis(visitData, patientData);

  const [viewMode, setViewMode] = useState(photoUrl ? 'PHOTO' : 'TEMPLATE');
  const [includeDigitalRx, setIncludeDigitalRx] = useState(true);

  // Sync viewMode whenever photoUrl or modal state updates
  useEffect(() => {
    if (photoUrl) {
      setViewMode('PHOTO');
    } else {
      setViewMode('TEMPLATE');
    }
  }, [photoUrl, isOpen, visitData?.id, patientData?.id]);

  if (!isOpen || !patientData) return null;

  // Format date
  const visitDateObj = visitData?.visitDate
    ? new Date(visitData.visitDate)
    : visitData?.createdAt
    ? new Date(visitData.createdAt)
    : new Date();

  const day = String(visitDateObj.getDate()).padStart(2, '0');
  const month = String(visitDateObj.getMonth() + 1).padStart(2, '0');
  const year = String(visitDateObj.getFullYear());

  const tokenNo = visitData?.tokenNo || 1;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (viewMode === 'PHOTO' && photoUrl) {
      // Download the photo directly
      const a = document.createElement('a');
      a.href = photoUrl;
      const safeName = (patientData?.name || 'Patient').replace(/\s+/g, '_');
      const safeUhid = (patientData?.uhid || 'RX').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Prescription_${safeUhid}_${safeName}_${day}-${month}-${year}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Print as PDF / Image
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 print:my-0 print:rounded-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Prescription Print & Export Desk
              </h3>
              <p className="text-[11px] text-slate-400">
                Skin & HIV Care Clinic • Dr. Amitabh Upadhyay
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Toggle between Uploaded Photo and Clinic Letterhead if Photo exists */}
            {photoUrl && (
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('PHOTO')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    viewMode === 'PHOTO'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Uploaded Rx Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('TEMPLATE')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    viewMode === 'TEMPLATE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Clinic Letterhead (Meds)</span>
                </button>
              </div>
            )}

            {viewMode === 'TEMPLATE' && medicines.length > 0 && (
              <label className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDigitalRx}
                  onChange={(e) => setIncludeDigitalRx(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Include Rx Meds ({medicines.length})</span>
              </label>
            )}

            {/* Direct Download button */}
            {viewMode === 'PHOTO' && photoUrl && (
              <button
                type="button"
                onClick={handleDownloadImage}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                title="Download prescription image directly"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Download Image</span>
              </button>
            )}

            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-700/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Slip Printable Paper Area */}
        <div
          ref={printRef}
          id="printable-prescription-slip"
          className="bg-white text-slate-900"
        >
          {viewMode === 'PHOTO' && photoUrl ? (
            /* Uploaded Prescription Photo Pure Print Area */
            <div className="w-full min-h-[920px] print:min-h-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-white print:p-0">
              <div className="w-full flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Prescription"
                  className="max-h-[85vh] print:max-h-[98vh] w-auto max-w-full object-contain mx-auto shadow-sm rounded-lg print:rounded-none"
                />
              </div>
            </div>
          ) : (
            /* Formal Doctor Letterhead Prescription Slip */
            <div className="prescription-slip-sheet bg-white p-5 sm:p-8 relative min-h-[960px] flex flex-col justify-between font-sans text-slate-900 border border-slate-200 print:border-none print:p-2 print:min-h-[1050px]">
              {/* Header Section */}
              <div>
                {/* Top Royal Blue Clinic Header Banner */}
                <div className="bg-[#1e40af] text-white py-2 px-4 rounded-t-lg text-center shadow-sm">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide font-serif">
                    Skin & HIV Care Clinic
                  </h1>
                </div>

                {/* Doctor Credentials & Clinic Addresses Grid */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 py-3 border-b border-slate-300 items-start">
                  {/* Left: Doctor Credentials */}
                  <div className="col-span-5 text-left pr-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 leading-tight">
                      Dr. Amitabh Upadhyay
                    </h2>
                    <div className="text-[9px] sm:text-[10px] text-slate-800 leading-tight mt-1 space-y-0.5">
                      <p className="font-semibold">M.B.B.S., FHM (MAMC, Delhi)</p>
                      <p className="font-semibold">MIAS (Geneva, Switzerland)</p>
                      <p>Senior Consultant Dermatology, V.D., Leprosy & AIDS</p>
                      <p>Fellow of HIV Medicine, Maulana Azad Medical College, Delhi</p>
                      <p className="italic text-slate-700">(Specially Trained in AIDS Management, Mumbai)</p>
                      <p>Ex-senior Medical Officer HIV & ART Centre</p>
                      <p>Swaroop Rani Hospital, Medical College, Allahabad</p>
                      <p className="font-bold text-slate-900 mt-1">MCI Registration No. : 03909</p>
                    </div>
                  </div>

                  {/* Center: Clinic Emblem Logo */}
                  <div className="col-span-2 flex flex-col items-center justify-center py-0">
                    <ClinicLogo className="w-20 h-20 sm:w-24 sm:h-24" />
                  </div>

                  {/* Right: Clinic Branch Addresses + QR Code */}
                  <div className="col-span-5 flex items-start justify-between gap-1 text-[9px] sm:text-[10px] text-slate-800 leading-tight pl-1">
                    <div className="space-y-1 text-left flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-950 font-serif">
                        Dr. Amitabh Upadhyay
                      </h3>

                      <div>
                        <p className="font-bold text-slate-950 tracking-wider text-[9px] uppercase">CIVIL LINES</p>
                        <p className="text-slate-700">P Square Mall, Shop No. 2, Ground Floor, Behind</p>
                        <p className="text-slate-700">Fashion City, Civil Lines Bus Stand, Prayagraj-211001</p>
                        <p className="font-semibold text-slate-900">Timing: Mon to Fri 3 PM to 6 PM</p>
                      </div>

                      <div className="pt-0.5">
                        <p className="font-bold text-slate-950 tracking-wider text-[9px] uppercase">JHUNSI</p>
                        <p className="text-slate-700">1/101 MIG, P.P. Medical Store, Behind Punjab</p>
                        <p className="text-slate-700">National Bank, Jhunsi, Yojna-3, Prayagraj-211019</p>
                        <p className="font-semibold text-slate-900">Timing: Mon to Sun 9:30 AM to 2 PM</p>
                        <p className="font-bold text-slate-900">RMEC Registration No. : 233872</p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="shrink-0 p-1 border border-slate-300 rounded bg-white">
                      <ClinicQRCode className="w-11 h-11 sm:w-12 sm:h-12" />
                    </div>
                  </div>
                </div>

                {/* Pink / Rose Contact Bar */}
                <div className="bg-[#fce7f3] border-y border-[#fbcfe8] py-1 px-2 text-center my-1.5 rounded-sm">
                  <p className="text-[9px] sm:text-[10.5px] font-bold text-[#be123c] tracking-tight">
                    FOR APPOINTMENT CALL : +91-9555960720, 9935140534 • E-mail : amitabhsu@rediffmail.com • UPI ID : dramitabhupadhyay@icici
                  </p>
                </div>

                {/* Patient Info Row */}
                <div className="py-2 px-1 border-b-2 border-slate-800 flex flex-wrap items-center justify-between text-xs sm:text-sm font-semibold text-slate-900 gap-2">
                  {/* Name */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <span className="text-slate-800 font-bold">Name:</span>
                    <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-600 px-2 pb-0.5 text-sm sm:text-base font-serif">
                      {patientData?.name || '______________________'}
                    </span>
                  </div>

                  {/* Sex Checkboxes */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold">Sex:</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={`px-1.5 py-0.5 border border-slate-800 font-mono font-bold rounded ${patientData?.gender === 'Male' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                        M {patientData?.gender === 'Male' ? '✓' : ''}
                      </span>
                      <span className={`px-1.5 py-0.5 border border-slate-800 font-mono font-bold rounded ${patientData?.gender === 'Female' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                        F {patientData?.gender === 'Female' ? '✓' : ''}
                      </span>
                      <span className={`px-1.5 py-0.5 border border-slate-800 font-mono font-bold rounded ${patientData?.gender === 'Other' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                        O {patientData?.gender === 'Other' ? '✓' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Age */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800 font-bold">Age:</span>
                    <span className="px-2.5 py-0.5 border border-slate-800 font-bold font-mono text-slate-950 rounded">
                      {patientData?.age || '___'}
                    </span>
                  </div>

                  {/* Date with Boxed Grid */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800 font-bold">Date:</span>
                    <div className="flex items-center border border-slate-800 rounded font-mono font-bold text-xs bg-slate-50">
                      <span className="px-1.5 py-0.5 border-r border-slate-400">{day}</span>
                      <span className="px-1.5 py-0.5 border-r border-slate-400">{month}</span>
                      <span className="px-1.5 py-0.5">{year}</span>
                    </div>
                  </div>

                  {/* Token Number Circle */}
                  <div className="flex items-center pl-2">
                    <span className="w-8 h-8 rounded-full border-2 border-slate-900 font-bold font-mono text-sm flex items-center justify-center bg-white text-slate-950 shadow-sm" title="Token Number">
                      {tokenNo}
                    </span>
                  </div>
                </div>

                {/* Optional Diagnosis Header Bar */}
                {diagnosis && (
                  <div className="py-1 px-1.5 border-b border-slate-300 flex items-center gap-2 text-xs bg-slate-50/70">
                    <span className="text-slate-700 font-bold uppercase tracking-wider text-[10px]">Diagnosis:</span>
                    <span className="font-semibold text-slate-950">{diagnosis}</span>
                  </div>
                )}
              </div>

              {/* Central Prescription Writing Area with Watermark */}
              <div className="relative flex-1 my-3 min-h-[480px] p-3">
                {/* Watermark in Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <ClinicLogo watermark={true} className="w-80 h-80 sm:w-96 sm:h-96 opacity-90" />
                </div>

                {/* Rx Symbol & Content */}
                <div className="relative z-10">
                  <span className="text-3xl sm:text-4xl font-serif font-black italic text-slate-900 block mb-3">
                    ℞
                  </span>

                  {/* Digital Medicines (if enabled & available) */}
                  {includeDigitalRx && medicines.length > 0 ? (
                    <div className="space-y-4 text-sm">
                      <div className="space-y-3">
                        {medicines.map((med, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between border-b border-slate-200/90 pb-2.5 pt-1"
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-slate-950 text-sm sm:text-base leading-tight">
                                {index + 1}. {med.name}
                              </p>
                              <div className="text-xs text-slate-700 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                {med.dosage && (
                                  <span>
                                    Dosage: <strong className="font-bold text-slate-900">{med.dosage}</strong>
                                  </span>
                                )}
                                {med.timing && (
                                  <span className="text-slate-600 font-medium">
                                    • {med.timing}
                                  </span>
                                )}
                                {med.notes && (
                                  <span className="italic text-slate-600">
                                    • {med.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                            {med.duration && (
                              <span className="font-mono text-xs font-bold text-slate-800 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded whitespace-nowrap ml-3">
                                {med.duration}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {instructions && (
                        <div className="mt-6 pt-4 border-t-2 border-slate-300 bg-slate-50/50 p-3 rounded-lg">
                          <p className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-1">
                            Doctor's Advice & Instructions:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                            {instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Blank Prescription Lines for handwritten doctor note */
                    <div className="space-y-8 pt-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="border-b border-slate-200/80 h-4" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Signature Area */}
              <div className="flex justify-end pt-3 pb-2 pr-6">
                <div className="text-center">
                  <div className="h-9 border-b border-slate-400 w-44 mb-1" />
                  <p className="text-xs font-bold text-slate-900">Dr. Amitabh Upadhyay</p>
                  <p className="text-[10px] text-slate-600">Consultant Dermatologist & HIV Specialist</p>
                </div>
              </div>

              {/* Bottom Royal Blue Footer Banner */}
              <div className="bg-[#1e40af] text-white py-2 px-4 rounded-b-lg text-center mt-2 shadow-sm">
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  1. Prescription is valid for 7 days from the date of issue.
                </p>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  2. Do not stop or alter dosage of medicines without consulting the doctor.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
