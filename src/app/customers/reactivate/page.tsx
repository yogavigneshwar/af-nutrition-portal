'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  RefreshCw, Search, User, CreditCard, 
  Calendar, Coffee, CheckCircle, Sparkles, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProgramDuration, PaymentMethod } from '../../../types';
import { calculateProgramDays, calculateTotalPlanCost, formatCurrency, formatDate } from '../../../lib/utils';
import { InvoiceModal } from '../../../components/common/InvoiceModal';

function ReactivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get('id');

  const { customers, renewCustomer, invoices } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedId || '');
  const [duration, setDuration] = useState<ProgramDuration>('30 Days');
  const [customDays, setCustomDays] = useState(30);
  const [planCost, setPlanCost] = useState(4500);
  const [amountPaid, setAmountPaid] = useState(4500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  useEffect(() => {
    if (preSelectedId) {
      setSelectedCustomerId(preSelectedId);
    }
  }, [preSelectedId]);

  const customer = customers.find(c => c.id === selectedCustomerId) || null;

  const addedDays = calculateProgramDays(duration, customDays);
  const totalCost = planCost;
  const addedShakes = addedDays * (customer?.dailyShakeFrequency || 1);
  const balanceDue = Math.max(0, totalCost - amountPaid);

  const handleDurationChange = (dur: ProgramDuration) => {
    setDuration(dur);
    const days = calculateProgramDays(dur, customDays);
    const cost = calculateTotalPlanCost(days, 150);
    setPlanCost(cost);
    setAmountPaid(cost);
  };

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      alert('Please select an existing customer to renew.');
      return;
    }

    const dailyRate = addedDays > 0 ? Math.round(planCost / addedDays) : 150;
    renewCustomer(customer.id, duration, customDays, dailyRate, amountPaid, paymentMethod);
    const latestInv = invoices[0];
    setGeneratedInvoice(latestInv);
    setShowInvoiceModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <RefreshCw className="w-5 h-5 text-gold-600" />
            <h2 className="text-xl font-black text-slate-900">
              Existing Customer Program Renewal & Reactivation
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Extend membership, top-up shake allocations, and issue renewal receipts without duplicating profiles.
          </p>
        </div>
      </div>

      {/* Main Renewal Form */}
      <form onSubmit={handleRenew} className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-xl space-y-6">
        {/* Customer Search / Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Existing Member *
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              const c = customers.find(item => item.id === e.target.value);
              if (c) {
                const days = calculateProgramDays(duration, customDays);
                const cost = calculateTotalPlanCost(days, 150);
                setPlanCost(cost);
                setAmountPaid(cost);
              }
            }}
            className="w-full px-4 py-3 rounded-2xl border border-emerald-200/80 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-brand-500"
            required
          >
            <option value="">-- Choose Member Profile --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.phone}) • {c.id} • {c.remainingShakes} shakes left [{c.status}]
              </option>
            ))}
          </select>
        </div>

        {/* Existing Member Profile Card */}
        {customer && (
          <div className="bg-gradient-to-br from-forest-900 via-forest-800 to-brand-900 rounded-3xl p-6 text-white space-y-4 border border-brand-700/40 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 w-64 h-64 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between border-b border-brand-700/50 pb-3">
              <div>
                <h3 className="text-base font-black text-white">{customer.fullName}</h3>
                <p className="text-xs text-brand-100/80 font-medium">{customer.phone} • <span className="font-mono text-gold-300">{customer.id}</span> • {customer.branch}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gold-500/20 text-gold-300 border border-gold-400/40 shadow-inner">
                {customer.customerType}
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
                <p className="text-[10px] uppercase text-gold-400 font-bold">Current Program</p>
                <p className="font-bold text-white mt-0.5 truncate">{customer.currentProgram}</p>
              </div>
              <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
                <p className="text-[10px] uppercase text-gold-400 font-bold">Shakes Consumed</p>
                <p className="font-bold text-white mt-0.5">{customer.consumedShakes} / {customer.allottedShakes}</p>
              </div>
              <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
                <p className="text-[10px] uppercase text-gold-400 font-bold">Remaining Shakes</p>
                <p className="font-black text-emerald-400 text-sm mt-0.5">{customer.remainingShakes} Left</p>
              </div>
              <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
                <p className="text-[10px] uppercase text-gold-400 font-bold">Total Club Visits</p>
                <p className="font-bold text-white mt-0.5">{customer.clubVisitsCount} Visits</p>
              </div>
            </div>
          </div>
        )}

        {/* Renewal Package Duration Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Renewal Package Duration *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['15 Days', '21 Days', '30 Days', '60 Days', 'Custom'] as ProgramDuration[]).map(dur => (
              <button
                type="button"
                key={dur}
                onClick={() => handleDurationChange(dur)}
                className={`p-3 rounded-2xl text-center border transition-all ${
                  duration === dur
                    ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-black shadow-md ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <p className="text-xs font-bold">{dur}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  +{calculateProgramDays(dur, customDays)} Days
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/80">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Renewal Plan Cost (₹) *
              </label>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                Editable
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
              <input
                type="number"
                value={planCost}
                onChange={(e) => {
                  const cost = parseInt(e.target.value) || 0;
                  setPlanCost(cost);
                  setAmountPaid(cost);
                }}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-500/20"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount Paid Now (₹) *
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-black text-emerald-700 bg-white"
              max={totalCost}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-900 bg-white"
            >
              <option value="UPI">UPI / Google Pay / PhonePe</option>
              <option value="Cash">Cash at Counter</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Balance Due
            </label>
            <div className={`p-2.5 rounded-xl text-xs font-black border ${
              balanceDue > 0 ? 'bg-amber-50 text-amber-800 border-gold-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {balanceDue > 0 ? formatCurrency(balanceDue) : 'Rs. 0 (Fully Paid)'}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Renewal Remarks & Special Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Loyalty renewal rate, member milestone renewal, special goal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Calculation Banner */}
        <div className="bg-gradient-to-r from-forest-900 via-brand-800 to-brand-700 rounded-3xl p-5 text-white text-xs flex items-center justify-between shadow-xl border border-brand-600/40">
          <div>
            <p className="font-black text-sm text-gold-300">Added Shakes: +{addedShakes} Shakes</p>
            <p className="text-brand-100/90 text-[11px] mt-0.5 font-medium">
              New Remaining Balance will become: <strong className="text-white">{(customer?.remainingShakes || 0) + addedShakes} Shakes</strong>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-brand-200 uppercase font-black">Total Renewal Cost</p>
            <p className="text-xl font-black text-gold-200">{formatCurrency(totalCost)}</p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!customer}
            className={`px-8 py-3 rounded-2xl text-xs font-black text-white shadow-xl flex items-center space-x-2 transition-all border ${
              customer
                ? 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 shadow-gold-950/20 cursor-pointer active:scale-95 border-gold-300/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Confirm Renewal & Issue Receipt</span>
          </button>
        </div>
      </form>

      <InvoiceModal
        isOpen={showInvoiceModal}
        invoice={generatedInvoice}
        onClose={() => {
          setShowInvoiceModal(false);
          router.push('/customers');
        }}
      />
    </div>
  );
}

export default function ReactivateCustomerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading Renewal Hub...</div>}>
      <ReactivateContent />
    </Suspense>
  );
}
