'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import BillingModal from '@/components/BillingModal';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesFilter = paymentFilter === 'ALL' ? true : inv.paymentMethod === paymentFilter;
    const matchesSearch =
      inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
      inv.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.patient?.uhid?.toLowerCase().includes(search.toLowerCase()) ||
      inv.patient?.phone?.includes(search);
    return matchesFilter && matchesSearch;
  });

  const totalCollected = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalDue = invoices.reduce((sum, i) => sum + ((i.totalAmount || 0) - (i.paidAmount || 0)), 0);

  const handlePrint = (invoice) => {
    setSelectedInvoiceForPrint(invoice);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Receipt className="w-3.5 h-3.5" />
            Billing & Invoicing Console
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Clinic Invoices & Receipts
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track consultation fees, procedures, payment modes, and print receipts.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Collection</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {formatCurrency(totalCollected)}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Pending Dues</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {formatCurrency(totalDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 no-print">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Payments' },
            { id: 'CASH', label: 'Cash' },
            { id: 'UPI', label: 'UPI / QR' },
            { id: 'CARD', label: 'Card' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPaymentFilter(mode.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                paymentFilter === mode.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, patient, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-5">Patient Details</th>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Fee Breakdown</th>
                <th className="py-3.5 px-5">Net Paid</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-slate-100">{inv.invoiceNo}</span>
                  </td>
                  <td className="py-4 px-5">
                    <Link
                      href={`/patients/${inv.patient?.id}`}
                      className="font-bold text-slate-100 hover:text-cyan-400 transition-colors block"
                    >
                      {inv.patient?.name}
                    </Link>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {inv.patient?.uhid} • 📞 {inv.patient?.phone}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-300">
                    <span className="block font-semibold">{formatDate(inv.createdAt)}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(inv.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-[11px]">
                    <div>Consult: ₹{inv.consultationFee}</div>
                    {inv.procedureFee > 0 && <div>Procedure: ₹{inv.procedureFee}</div>}
                    {inv.medicineFee > 0 && <div>Medicine: ₹{inv.medicineFee}</div>}
                    {inv.discount > 0 && <div className="text-rose-400">Disc: -₹{inv.discount}</div>}
                  </td>
                  <td className="py-4 px-5 font-mono font-extrabold text-emerald-400 text-sm">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handlePrint(inv)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Print Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Layout (Rendered only during print) */}
      {selectedInvoiceForPrint && (
        <div className="hidden print:block p-8 bg-white text-black font-mono text-xs max-w-md mx-auto">
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-base font-bold uppercase">Arogya Clinic & Healthcare</h1>
            <p className="text-[11px]">OPD Consultation & Service Invoice</p>
            <p className="text-[10px] mt-1">Invoice: {selectedInvoiceForPrint.invoiceNo}</p>
          </div>
          <div className="space-y-1 mb-4 border-b border-dashed border-gray-600 pb-3">
            <div className="flex justify-between">
              <span>Patient:</span>
              <span className="font-bold">{selectedInvoiceForPrint.patient?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>UHID:</span>
              <span>{selectedInvoiceForPrint.patient?.uhid}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{selectedInvoiceForPrint.patient?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDateTime(selectedInvoiceForPrint.createdAt)}</span>
            </div>
          </div>
          <div className="space-y-1 mb-4 border-b border-dashed border-gray-600 pb-3">
            <div className="flex justify-between">
              <span>Consultation Fee</span>
              <span>₹{selectedInvoiceForPrint.consultationFee}</span>
            </div>
            {selectedInvoiceForPrint.procedureFee > 0 && (
              <div className="flex justify-between">
                <span>Procedure Fee</span>
                <span>₹{selectedInvoiceForPrint.procedureFee}</span>
              </div>
            )}
            {selectedInvoiceForPrint.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-₹{selectedInvoiceForPrint.discount}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL PAID:</span>
            <span>{formatCurrency(selectedInvoiceForPrint.totalAmount)}</span>
          </div>
          <div className="flex justify-between mt-1 text-[11px]">
            <span>Mode:</span>
            <span className="uppercase">{selectedInvoiceForPrint.paymentMethod}</span>
          </div>
          <div className="text-center text-[10px] mt-6 pt-4 border-t border-black">
            Get well soon! Thank you for choosing Arogya Clinic.
          </div>
        </div>
      )}
    </div>
  );
}
