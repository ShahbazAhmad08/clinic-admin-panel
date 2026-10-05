'use client';

import React, { useState } from 'react';
import {
  X,
  Receipt,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  Check,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BillingModal({ isOpen, onClose, onSuccess, visitData }) {
  const [consultationFee, setConsultationFee] = useState(
    visitData?.doctor?.consultationFee || 500
  );
  const [procedureFee, setProcedureFee] = useState(0);
  const [medicineFee, setMedicineFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH', 'UPI', 'CARD'
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  if (!isOpen) return null;

  const totalAmount = Math.max(
    0,
    Number(consultationFee || 0) +
      Number(procedureFee || 0) +
      Number(medicineFee || 0) -
      Number(discount || 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: visitData.patientId,
          visitId: visitData.id,
          consultationFee: Number(consultationFee),
          procedureFee: Number(procedureFee),
          medicineFee: Number(medicineFee),
          discount: Number(discount),
          totalAmount,
          paidAmount: paymentStatus === 'PAID' ? totalAmount : 0,
          paymentMethod,
          paymentStatus,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice');

      setGeneratedInvoice(data.invoice);
      if (onSuccess) onSuccess(data.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header (Pinned Top) */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">OPD Billing & Receipt</h3>
              <p className="text-[11px] text-slate-400">
                {visitData?.patient?.name} ({visitData?.patient?.uhid}) • Token #{visitData?.tokenNo}
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

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        {!generatedInvoice ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Procedure / Treatment (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={procedureFee}
                  onChange={(e) => setProcedureFee(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Medicines / Tests (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={medicineFee}
                  onChange={(e) => setMedicineFee(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">NET PAYABLE AMOUNT:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD', label: 'Card / POS', icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                        paymentMethod === item.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="PAID">PAID (Full payment received)</option>
                <option value="PENDING">PENDING (Payment due)</option>
                <option value="PARTIAL">PARTIAL</option>
              </select>
            </div>
          </form>
        ) : (
          /* Receipt Screen */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div
              id="printable-receipt"
              className="bg-white text-slate-900 p-6 rounded-2xl shadow-inner font-mono text-xs border border-slate-300"
            >
              <div className="text-center pb-3 mb-3 border-b border-dashed border-slate-400">
                <h2 className="text-sm font-bold tracking-tight">SKIN & HIV CARE CLINIC</h2>
                <p className="text-[11px] text-slate-600">Dr. Amitabh Upadhyay (Senior Consultant)</p>
                <p className="text-[10px] text-slate-500">Prayagraj • 📞 +91-9555960720</p>
                <p className="text-[11px] font-bold mt-1 text-slate-800">OPD INVOICE & RECEIPT</p>
                <p className="text-[10px] text-slate-500">Invoice: {generatedInvoice.invoiceNo}</p>
              </div>

              <div className="space-y-1 mb-3 border-b border-dashed border-slate-300 pb-2 text-[11px]">
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span className="font-bold">{visitData?.patient?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>UHID:</span>
                  <span>{visitData?.patient?.uhid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span>Dr. Amitabh Upadhyay</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 border-b border-dashed border-slate-400 pb-3">
                <div className="flex justify-between">
                  <span>Consultation Fee</span>
                  <span>{formatCurrency(generatedInvoice.consultationFee)}</span>
                </div>
                {generatedInvoice.procedureFee > 0 && (
                  <div className="flex justify-between">
                    <span>Procedure / Nursing</span>
                    <span>{formatCurrency(generatedInvoice.procedureFee)}</span>
                  </div>
                )}
                {generatedInvoice.medicineFee > 0 && (
                  <div className="flex justify-between">
                    <span>Medicines / Tests</span>
                    <span>{formatCurrency(generatedInvoice.medicineFee)}</span>
                  </div>
                )}
                {generatedInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>- {formatCurrency(generatedInvoice.discount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span>NET TOTAL PAID:</span>
                <span className="text-base">{formatCurrency(generatedInvoice.totalAmount)}</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
                <span>Payment Mode:</span>
                <span className="uppercase font-semibold">{generatedInvoice.paymentMethod}</span>
              </div>

              <div className="text-center text-[10px] text-slate-500 mt-6 pt-3 border-t border-dashed border-slate-300">
                Thank you for visiting. Get well soon!
              </div>
            </div>
          </div>
        )}

        {/* Footer (Pinned Bottom) */}
        <div className="flex-shrink-0 px-5 sm:px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/80 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            Close
          </button>

          {!generatedInvoice ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Generate Bill & Collect ₹{totalAmount}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
