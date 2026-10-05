'use client';

import React, { useRef, useState } from 'react';
import { X, Printer, Download, Check, FileText, Sparkles, AlertCircle } from 'lucide-react';
import ClinicLogo from './ClinicLogo';

export default function PrescriptionSlipModal({
  isOpen,
  onClose,
  patientData,
  visitData = null,
  autoPrint = false,
}) {
  const printRef = useRef(null);
  const [includeDigitalRx, setIncludeDigitalRx] = useState(true);
  const [includeVitals, setIncludeVitals] = useState(true);

  if (!isOpen || !patientData) return null;

  // Format today's date or visit date
  const visitDateObj = visitData?.visitDate ? new Date(visitData.visitDate) : new Date();
  const day = String(visitDateObj.getDate()).padStart(2, '0');
  const month = String(visitDateObj.getMonth() + 1).padStart(2, '0');
  const year = String(visitDateObj.getFullYear());

  const tokenNo = visitData?.tokenNo || 1;

  // Parse digital medicines if available
  let medicines = [];
  if (visitData?.prescriptions?.[0]?.digitalRxJson) {
    try {
      medicines = JSON.parse(visitData.prescriptions[0].digitalRxJson);
    } catch (e) {
      medicines = [];
    }
  }

  const instructions = visitData?.prescriptions?.[0]?.instructions || '';
  const vitals = visitData?.vitals?.[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-4 print:my-0 print:rounded-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Prescription Slip Preview & Print (डॉक्टर पर्चा)
              </h3>
              <p className="text-[11px] text-slate-400">
                Skin & HIV Care Clinic • Dr. Amitabh Upadhyay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDigitalRx}
                  onChange={(e) => setIncludeDigitalRx(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Include Rx Meds</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVitals}
                  onChange={(e) => setIncludeVitals(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Include Vitals</span>
              </label>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-700/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Parcha (1-Click)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Slip Printable Paper Area (A4 Proportioned) */}
        <div
          ref={printRef}
          id="printable-prescription-slip"
          className="prescription-slip-sheet bg-white p-6 sm:p-8 relative min-h-[950px] flex flex-col justify-between font-sans text-slate-900 border border-slate-200 print:border-none print:p-4 print:min-h-[1050px]"
        >
          {/* Top Royal Blue Clinic Header Bar */}
          <div>
            <div className="bg-[#1e40af] text-white py-2.5 px-4 rounded-t-lg text-center shadow-sm">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide font-serif">
                Skin & HIV Care Clinic
              </h1>
            </div>

            {/* Doctor Info & Clinic Addresses Grid */}
            <div className="grid grid-cols-12 gap-2 sm:gap-4 py-3 border-b border-slate-300 items-start">
              {/* Left: Doctor Credentials (English) */}
              <div className="col-span-5 text-left pr-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Dr. Amitabh Upadhyay
                </h2>
                <div className="text-[10px] sm:text-[11px] text-slate-700 leading-tight mt-1 space-y-0.5">
                  <p className="font-semibold text-slate-800">M.B.B.S., FHM (MAMC, Delhi)</p>
                  <p className="font-semibold text-slate-800">MIAS (Geneva, Switzerland)</p>
                  <p>Senior Consultant Dermatology, V.D., Leprosy & AIDS</p>
                  <p>Fellow of HIV Medicine, Maulana Azad Medical College, Delhi</p>
                  <p className="italic text-slate-600">(Specially Trained in AIDS Management, Mumbai)</p>
                  <p>Ex-senior Medical Officer HIV & ART Centre</p>
                  <p>Swaroop Rani Hospital, Medical College, Allahabad</p>
                  <p className="font-bold text-slate-800 mt-1">MCI Registration No. : 03909</p>
                </div>
              </div>

              {/* Center: Clinic Emblem Logo */}
              <div className="col-span-2 flex flex-col items-center justify-center pt-1">
                <ClinicLogo className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-sm" />
              </div>

              {/* Right: Hindi Name & Addresses / Timings */}
              <div className="col-span-5 text-right pl-1 text-[10px] sm:text-[11px] text-slate-700 leading-tight">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                  डा. अमिताभ उपाध्याय
                </h3>

                <div className="mt-1 space-y-1.5">
                  <div>
                    <p className="font-bold text-slate-900 tracking-wider text-[10px] uppercase">CIVIL LINES</p>
                    <p className="text-slate-700">P Square Mall, Shop No. 2, Ground Floor, Behind</p>
                    <p className="text-slate-700">Fashion City, Civil Lines Bus Stand, Prayagraj-211001</p>
                    <p className="font-semibold text-slate-800">Timing: Mon to Fri 3 PM to 6 PM</p>
                  </div>

                  <div className="pt-0.5">
                    <p className="font-bold text-slate-900 tracking-wider text-[10px] uppercase">JHUNSI</p>
                    <p className="text-slate-700">1/101 MIG, P.P. Medical Store, Behind Punjab</p>
                    <p className="text-slate-700">National Bank, Jhunsi, Yojna-3, Prayagraj-211019</p>
                    <p className="font-semibold text-slate-800">Timing: Mon to Sun 9:30 AM to 2 PM</p>
                    <p className="font-bold text-slate-800">RMEC Registration No. : 233872</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pink / Rose Contact Bar */}
            <div className="bg-[#fce7f3] border-y border-[#fbcfe8] py-1 px-3 text-center my-1.5 rounded-sm">
              <p className="text-[10px] sm:text-[11px] font-bold text-[#be123c] tracking-tight">
                FOR APPOINTMENT CALL : +91-9555960720, 9935140534 • E-mail : amitabhsu@rediffmail.com • UPI ID : dramitabhupadhyay@icici
              </p>
            </div>

            {/* Patient Info Row */}
            <div className="py-2 px-1 border-b-2 border-slate-800 flex flex-wrap items-center justify-between text-xs sm:text-sm font-semibold text-slate-900 gap-2">
              {/* Name */}
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                <span className="text-slate-800">Name:</span>
                <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-600 px-2 pb-0.5 text-sm sm:text-base font-serif">
                  {patientData?.name || '______________________'}
                </span>
              </div>

              {/* Sex Checkboxes */}
              <div className="flex items-center gap-2">
                <span className="text-slate-800">Sex:</span>
                <div className="flex items-center gap-1 text-xs">
                  <span className={`px-1.5 py-0.5 border border-slate-700 font-mono font-bold rounded ${patientData?.gender === 'Male' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                    M {patientData?.gender === 'Male' ? '✓' : ''}
                  </span>
                  <span className={`px-1.5 py-0.5 border border-slate-700 font-mono font-bold rounded ${patientData?.gender === 'Female' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                    F {patientData?.gender === 'Female' ? '✓' : ''}
                  </span>
                  <span className={`px-1.5 py-0.5 border border-slate-700 font-mono font-bold rounded ${patientData?.gender === 'Other' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                    O {patientData?.gender === 'Other' ? '✓' : ''}
                  </span>
                </div>
              </div>

              {/* Age */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800">Age:</span>
                <span className="px-2.5 py-0.5 border border-slate-800 font-bold font-mono text-slate-950 rounded">
                  {patientData?.age || '___'}
                </span>
              </div>

              {/* Date with Boxed Grid */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800">Date:</span>
                <div className="flex items-center border border-slate-800 rounded font-mono font-bold text-xs bg-slate-50">
                  <span className="px-1.5 py-0.5 border-r border-slate-400">{day}</span>
                  <span className="px-1.5 py-0.5 border-r border-slate-400">{month}</span>
                  <span className="px-1.5 py-0.5">{year}</span>
                </div>
              </div>

              {/* Token Number Circle */}
              <div className="flex items-center pl-2">
                <span className="w-8 h-8 rounded-full border-2 border-slate-900 font-bold font-mono text-sm flex items-center justify-center bg-white text-slate-950 shadow-sm">
                  {tokenNo}
                </span>
              </div>
            </div>

            {/* Vitals Bar (if included and available) */}
            {includeVitals && vitals && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 my-2 flex flex-wrap items-center justify-between text-xs text-slate-700">
                <span><strong>UHID:</strong> {patientData.uhid}</span>
                {vitals.bpSystolic && <span><strong>BP:</strong> {vitals.bpSystolic}/{vitals.bpDiastolic} mmHg</span>}
                {vitals.pulseRate && <span><strong>Pulse:</strong> {vitals.pulseRate} bpm</span>}
                {vitals.weight && <span><strong>Weight:</strong> {vitals.weight} kg</span>}
                {vitals.temperature && <span><strong>Temp:</strong> {vitals.temperature} °F</span>}
                {vitals.bloodSugar && <span><strong>Sugar:</strong> {vitals.bloodSugar} mg/dL</span>}
              </div>
            )}

            {patientData?.allergies && (
              <div className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 my-1">
                ⚠️ Allergies: {patientData.allergies}
              </div>
            )}
          </div>

          {/* Central Prescription Writing Area with Watermark */}
          <div className="relative flex-1 my-4 min-h-[480px] p-4">
            {/* Watermark in Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <ClinicLogo watermark={true} className="w-80 h-80 sm:w-96 sm:h-96 opacity-90" />
            </div>

            {/* Rx Symbol */}
            <div className="relative z-10">
              <span className="text-3xl sm:text-4xl font-serif font-black italic text-slate-900 block mb-3">
                ℞
              </span>

              {/* Digital Medicines (if enabled & available) */}
              {includeDigitalRx && medicines.length > 0 ? (
                <div className="space-y-4 text-sm">
                  {medicines.map((med, index) => (
                    <div key={index} className="flex items-start justify-between border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm sm:text-base">
                          {index + 1}. {med.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          Dosage: <span className="font-semibold text-slate-800">{med.dosage}</span> ({med.timing})
                          {med.notes && ` • ${med.notes}`}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 bg-slate-100 rounded">
                        {med.duration}
                      </span>
                    </div>
                  ))}

                  {instructions && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Doctor's Advice & Instructions:
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 whitespace-pre-line">
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
          <div className="flex justify-end pt-4 pb-2 pr-6">
            <div className="text-center">
              <div className="h-10 border-b border-slate-400 w-44 mb-1" />
              <p className="text-xs font-bold text-slate-900">Dr. Amitabh Upadhyay</p>
              <p className="text-[10px] text-slate-600">Consultant Dermatologist & HIV Specialist</p>
            </div>
          </div>

          {/* Bottom Royal Blue Footer Banner */}
          <div className="bg-[#1e40af] text-white py-2.5 px-4 rounded-b-lg text-center mt-2 shadow-sm">
            <p className="text-xs sm:text-sm font-bold leading-relaxed font-serif">
              1. पर्चा मात्र सात दिनों के लिए मान्य होगा
            </p>
            <p className="text-xs sm:text-sm font-bold leading-relaxed font-serif">
              2. बिना डॉक्टर के परामर्श के ना दवाओं को रोके ना ही निर्धारित समय से ज्यादा खाये.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
