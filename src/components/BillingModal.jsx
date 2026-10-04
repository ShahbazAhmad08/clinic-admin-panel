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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">OPD Billing & Receipt</h3>
              <p className="text-xs text-slate-400">
                {visitData?.patient?.name} ({visitData?.patient?.uhid}) • Token #{visitData?.tokenNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 no-print">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {!generatedInvoice ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Doctor Consultation Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Procedure / Treatment Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Procedure / Dressing (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={procedureFee}
                  onChange={(e) => setProcedureFee(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Medicines / Consumables Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Medicine / Tests (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={medicineFee}
                  onChange={(e) => setMedicineFee(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Total Calculation Display */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Net Payable Amount:</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === mode.id
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-slate-300">Payment Status:</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="PAID"
                    checked={paymentStatus === 'PAID'}
                    onChange={() => setPaymentStatus('PAID')}
                    className="accent-emerald-500"
                  />
                  <span>Paid in Full</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="PENDING"
                    checked={paymentStatus === 'PENDING'}
                    onChange={() => setPaymentStatus('PENDING')}
                    className="accent-amber-500"
                  />
                  <span>Payment Pending / Due</span>
                </label>
              </div>
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
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Generate Bill & Collect</span>
              </button>
            </div>
          </form>
        ) : (
          /* Receipt Print & Success View */
          <div className="p-6 space-y-6">
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl font-mono text-xs border border-slate-200">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-400 pb-4 mb-4">
                <h2 className="text-base font-bold text-slate-900 uppercase">
                  Arogya Clinic & Healthcare
                </h2>
                <p className="text-[11px] text-slate-600">OPD & Consultation Receipt</p>
                <p className="text-[10px] text-slate-500 mt-1">Invoice: {generatedInvoice.invoiceNo}</p>
              </div>

              {/* Patient Details */}
              <div className="space-y-1 mb-4 border-b border-dashed border-slate-400 pb-3">
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
                  <span>{visitData?.doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Line Items */}
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

              {/* Total & Mode */}
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

            {/* Actions */}
            <div className="flex items-center justify-between no-print">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt Slip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
