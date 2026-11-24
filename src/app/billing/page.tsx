'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Receipt, Search, Filter, Printer, 
  DollarSign, CheckCircle2, CreditCard, Eye, Sparkles, Tag, ShoppingBag,
  AlertTriangle, ArrowRight, X, Clock, Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { Invoice, PaymentMethod } from '../../types';

function BillingContent() {
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';

  const { invoices, settleInvoicePayment } = useApp();
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Settlement Modal State
  const [settlingInvoice, setSettlingInvoice] = useState<Invoice | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMode, setSettleMode] = useState<PaymentMethod>('UPI');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync search param if URL changes
  useEffect(() => {
    if (searchParamQuery) {
      setSearchQuery(searchParamQuery);
    }
  }, [searchParamQuery]);

  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Calculate financials
  const totalCollectedRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const todayRevenue = invoices
    .filter(inv => inv.date?.startsWith(todayStr))
    .reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  
  // Outstanding uncollected balance across all bills
  const totalBalanceDue = invoices.reduce((acc, inv) => {
    const due = inv.balanceDue > 0 ? inv.balanceDue : (inv.paymentStatus !== 'Paid' ? inv.total : 0);
    return acc + due;
  }, 0);

  const unpaidCount = invoices.filter(inv => inv.paymentStatus !== 'Paid' || inv.balanceDue > 0).length;

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const itemsSummary = inv.items?.map(i => i.description).join(' ').toLowerCase() || '';
    const matchesQuery = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchQuery)) ||
      itemsSummary.includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || inv.type === typeFilter;
    const isUnpaid = inv.paymentStatus !== 'Paid' || inv.balanceDue > 0;
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Unpaid' && isUnpaid) ||
      (statusFilter === 'Paid' && !isUnpaid);

    return matchesQuery && matchesType && matchesStatus;
  });

  // CRITICAL REQUIREMENT (User #9): Sort UNPAID / NEED TO PAY first at the very top!
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const aUnpaid = a.paymentStatus !== 'Paid' || a.balanceDue > 0;
    const bUnpaid = b.paymentStatus !== 'Paid' || b.balanceDue > 0;
    if (aUnpaid && !bUnpaid) return -1;
    if (!aUnpaid && bUnpaid) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleOpenInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  const handleOpenSettle = (inv: Invoice) => {
    setSettlingInvoice(inv);
    const due = inv.balanceDue > 0 ? inv.balanceDue : (inv.total - (inv.amountPaid || 0));
    setSettleAmount(due > 0 ? due : inv.total);
    setSettleMode('UPI');
  };

  const handleConfirmSettlement = () => {
    if (!settlingInvoice) return;
    settleInvoicePayment(settlingInvoice.id, settleAmount);
    setToastMessage(`Payment of ${formatCurrency(settleAmount)} recorded for ${settlingInvoice.customerName}! Marked as Fully Paid.`);
    setTimeout(() => setToastMessage(null), 4000);
    setSettlingInvoice(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button 
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-gold-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Billing, Cashier Invoices & Balance Collections
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage cashier billing receipts, collect pending add-on payments, and settle outstanding membership plan balances.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-gold-50 px-5 py-3 rounded-2xl border border-emerald-200/80 shadow-xs">
          <DollarSign className="w-5 h-5 text-emerald-700" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Total Collected Revenue</p>
            <p className="text-lg font-black text-gold-950">{formatCurrency(totalCollectedRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Unpaid / Need to Pay Priority Alert Banner */}
      {unpaidCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-lg text-white shrink-0">
              <AlertTriangle className="w-5 h-5 text-gold-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-white">
                  {unpaidCount} Pending Bill{unpaidCount > 1 ? 's' : ''} Need Payment
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-amber-950 shadow-2xs">
                  Priority Queue
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Total Uncollected Amount: <strong className="text-white text-sm font-black">{formatCurrency(totalBalanceDue)}</strong> • Unpaid bills appear first below for rapid cashier settlement.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Unpaid' ? 'All' : 'Unpaid')}
            className="px-4 py-2 rounded-xl bg-white text-amber-950 font-black text-xs hover:bg-amber-50 transition-all shrink-0 active:scale-95 shadow-md shadow-amber-950/20"
          >
            {statusFilter === 'Unpaid' ? 'Show All Invoices' : 'Filter Unpaid Only'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices Issued</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{invoices.length} Bills</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">POS orders & registration receipts</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Cashier Intake</p>
          <h3 className="text-2xl font-black text-gold-900 mt-1">{formatCurrency(todayRevenue)}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Collected today at register</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance Due</p>
          <h3 className={`text-2xl font-black mt-1 ${totalBalanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {formatCurrency(totalBalanceDue)}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {unpaidCount > 0 ? `${unpaidCount} bills pending payment` : 'All bills fully settled'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60" />
            <input
              type="text"
              placeholder="Search by invoice #, customer name, phone, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/30 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Invoice Types</option>
              <option value="POS_ORDER">POS Add-On Orders</option>
              <option value="PROGRAM_REGISTRATION">Plan Registrations</option>
              <option value="PROGRAM_RENEWAL">Plan Renewals</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Statuses (Unpaid First)</option>
              <option value="Unpaid">Need to Pay / Pending Only</option>
              <option value="Paid">Fully Paid Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice # & Date</th>
                <th className="py-3.5 px-4">Customer / Guest</th>
                <th className="py-3.5 px-4">Type & Items</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 stroke-1 text-emerald-200" />
                    <p className="font-bold text-slate-700">No invoices found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting search query or filters.</p>
                  </td>
                </tr>
              ) : (
                sortedInvoices.map(inv => {
                  const isUnpaid = inv.paymentStatus !== 'Paid' || inv.balanceDue > 0;
                  const due = inv.balanceDue > 0 ? inv.balanceDue : (isUnpaid ? inv.total : 0);
                  const itemsSummary = inv.items?.map(i => `${i.quantity}x ${i.description}`).join(', ') || 'Items';

                  return (
                    <tr 
                      key={inv.id} 
                      className={`transition-colors ${
                        isUnpaid 
                          ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500' 
                          : 'hover:bg-emerald-50/20'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-black text-brand-950">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{formatDate(inv.date)}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{inv.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{inv.customerPhone || 'Walk-in'}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 inline-block">
                            {inv.type === 'POS_ORDER' ? 'POS Add-On' : inv.type === 'PROGRAM_REGISTRATION' ? 'Registration' : 'Renewal'}
                          </span>
                          <p className="font-medium text-slate-700 truncate" title={itemsSummary}>
                            {itemsSummary}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isUnpaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            Need to Pay
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Fully Paid
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {formatCurrency(inv.amountPaid || 0)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-sm">
                        {due > 0 ? (
                          <span className="text-amber-800 font-black">{formatCurrency(due)}</span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">₹0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Settle Balance Button if unpaid */}
                          {isUnpaid && (
                            <button
                              type="button"
                              onClick={() => handleOpenSettle(inv)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-gold-600 hover:from-amber-500 hover:to-gold-500 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer border border-gold-300/40"
                              title="Collect payment and mark as paid"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>Settle Pay</span>
                            </button>
                          )}

                          {/* Print Receipt Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenInvoice(inv)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1 transition-colors border border-emerald-200/60 cursor-pointer"
                            title="View receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Payment Modal */}
      {settlingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-200/80 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-brand-950 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSettlingInvoice(null)}
                className="absolute right-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-black uppercase tracking-wider border border-gold-400/30 mb-2">
                <Wallet className="w-3 h-3 text-gold-400" />
                <span>Collect Balance Payment</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {settlingInvoice.customerName}
              </h3>
              <p className="text-xs text-brand-100/80 mt-0.5 font-mono">
                {settlingInvoice.invoiceNumber} • {settlingInvoice.customerPhone || 'Walk-in'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Bill</p>
                  <p className="text-sm font-black text-slate-800">{formatCurrency(settlingInvoice.total)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Already Paid</p>
                  <p className="text-sm font-black text-emerald-700">{formatCurrency(settlingInvoice.amountPaid || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Balance Due</p>
                  <p className="text-sm font-black text-amber-800">
                    {formatCurrency(settlingInvoice.balanceDue > 0 ? settlingInvoice.balanceDue : settlingInvoice.total)}
                  </p>
                </div>
              </div>

              {/* Amount to Collect Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Amount to Collect (₹) *
                </label>
                <input
                  type="number"
                  value={settleAmount === 0 ? '' : settleAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettleAmount(val === '' ? 0 : parseInt(val, 10) || 0);
                  }}
                  placeholder="0"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-50/40 border-2 border-emerald-300 text-center text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                  min={1}
                />
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment Mode Received
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                  {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setSettleMode(pm)}
                      className={`py-2 rounded-xl border transition-all cursor-pointer ${
                        settleMode === pm
                          ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-700 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettlingInvoice(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSettlement}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-black shadow-lg shadow-brand-950/20 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Confirm & Mark Fully Paid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        invoice={selectedInvoice}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading Billing Invoices...</div>}>
      <BillingContent />
    </Suspense>
  );
}
