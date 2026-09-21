'use client';

import React, { useState } from 'react';
import { 
  Receipt, Search, Filter, Printer, 
  DollarSign, CheckCircle, CreditCard, Eye, Sparkles, Tag, ShoppingBag 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export default function BillingPage() {
  const { invoices } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Filter for Add-On payments only (POS orders / retail products) - excluding shake plan payments
  const addOnInvoices = invoices.filter(inv => inv.type === 'POS_ORDER');

  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const totalAddOnRevenue = addOnInvoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const todayAddOnRevenue = addOnInvoices
    .filter(inv => inv.date?.startsWith(todayStr))
    .reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const weeklyAddOnRevenue = addOnInvoices
    .filter(inv => new Date(inv.date) >= sevenDaysAgo)
    .reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);

  // Search & Filter
  const filteredInvoices = addOnInvoices.filter(inv => {
    const itemsSummary = inv.items?.map(i => i.description).join(' ').toLowerCase() || '';
    const matchesQuery = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery) ||
      itemsSummary.includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'All' || inv.paymentMethod === paymentFilter;

    return matchesQuery && matchesPayment;
  });

  const handleOpenInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-gold-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Add-On Invoices & Retail Billing
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Official cashier receipts for add-on nutrition orders, protein booster scoops, energy teas, and retail products.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-gold-50 px-5 py-3 rounded-2xl border border-emerald-200/80 shadow-xs">
          <DollarSign className="w-5 h-5 text-emerald-700" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Gross Add-On Collections</p>
            <p className="text-lg font-black text-gold-950">{formatCurrency(totalAddOnRevenue)}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards for Add-On Payments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add-On Invoices Issued</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{addOnInvoices.length} Invoices</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">POS add-on transactions recorded</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Add-On Revenue</p>
          <h3 className="text-2xl font-black text-gold-900 mt-1">{formatCurrency(todayAddOnRevenue)}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Recorded today at register</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Add-On Volume</p>
          <h3 className="text-2xl font-black text-brand-700 mt-1">{formatCurrency(weeklyAddOnRevenue)}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Last 7 calendar days total</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60" />
            <input
              type="text"
              placeholder="Search by invoice #, customer name, phone, or product item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/30 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
            />
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Payment Modes</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
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
                <th className="py-3.5 px-4">Add-On Items Purchased</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Net Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 stroke-1 text-emerald-200" />
                    <p className="font-bold text-slate-700">No add-on invoices found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">POS add-on orders and retail checkout receipts will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const itemsSummary = inv.items?.map(i => `${i.quantity}x ${i.description}`).join(', ') || 'Add-on items';

                  return (
                    <tr key={inv.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-black text-brand-950">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{formatDate(inv.date)}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{inv.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{inv.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <p className="font-medium text-slate-700 truncate" title={itemsSummary}>
                            {itemsSummary}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {inv.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-gold-900 text-sm">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(inv)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-emerald-200/60"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoiceModal}
        invoice={selectedInvoice}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}
