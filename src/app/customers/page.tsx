'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, UserPlus, Search, Filter, 
  Coffee, UtensilsCrossed, CalendarCheck, 
  RefreshCw, Eye, Award, ArrowUpRight, Sparkles, CheckCircle2, ShieldCheck, X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerType } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Badge } from '../../components/common/Badge';
import { CustomerProfileModal } from '../../components/customers/CustomerProfileModal';
import { ShakeLoggerModal } from '../../components/shakes/ShakeLoggerModal';
import { SeminarLoggerModal } from '../../components/seminars/SeminarLoggerModal';

function CustomerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';

  const { customers, metrics, promoteCustomerToAssociate } = useApp();
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [shakeModalCustId, setShakeModalCustId] = useState<string | null>(null);
  const [seminarModalCustId, setSeminarModalCustId] = useState<string | null>(null);

  // Shift to Associate Modal State
  const [shiftTargetCustomer, setShiftTargetCustomer] = useState<Customer | null>(null);
  const [shiftNotes, setShiftNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesQuery = 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.associateId && c.associateId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.inviterName && c.inviterName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'All' || c.customerType === typeFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesQuery && matchesType && matchesStatus;
  });

  const getCustomerTypeVariant = (type: CustomerType) => {
    switch (type) {
      case 'New Customer': return 'brand';
      case 'Existing Customer': return 'success';
      case 'Associate': return 'gold';
      case 'JP Member': return 'gold';
      case 'Preferred Customer': return 'warning';
      default: return 'neutral';
    }
  };

  const handleConfirmShiftToAssociate = () => {
    if (!shiftTargetCustomer) return;
    promoteCustomerToAssociate(shiftTargetCustomer.id, shiftNotes);
    const promotedName = shiftTargetCustomer.fullName;
    setShiftTargetCustomer(null);
    setShiftNotes('');
    setToastMessage(`Success! ${promotedName} has been shifted to Associate Partner. All records are now accessible in Associate Registry.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-forest-900 border border-gold-400/50 text-white shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-300 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <p className="font-black text-xs text-gold-200 uppercase tracking-wider">Member Promoted</p>
              <p className="text-xs text-brand-100 font-medium mt-0.5">{toastMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Customer 360 Registry & Records</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {filteredCustomers.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Search customer lifecycle records, view 360 profiles, verify shake balances, and shift members directly to Associate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/customers/register"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-md shadow-brand-900/20 flex items-center space-x-1.5 transition-all active:scale-95 border border-brand-400/30"
          >
            <UserPlus className="w-4 h-4 text-gold-200" />
            <span>New Customer (5-Step)</span>
          </Link>

          <Link
            href="/associates"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-forest-950 to-forest-900 hover:from-forest-900 hover:to-forest-800 text-gold-300 font-bold text-xs shadow-md shadow-forest-950/20 flex items-center space-x-1.5 transition-all active:scale-95 border border-gold-500/30"
          >
            <Award className="w-4 h-4 text-gold-400" />
            <span>Associate Hub ({metrics.associatesCount || 0})</span>
          </Link>

          <Link
            href="/customers/reactivate"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white font-bold text-xs shadow-md shadow-gold-950/20 flex items-center space-x-1.5 transition-all active:scale-95 border border-gold-300/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Renew Existing</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60" />
            <input
              type="text"
              placeholder="Search by name, phone number, customer ID, or inviter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/40 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Customer Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Customer Types</option>
              <option value="New Customer">New Customer</option>
              <option value="Existing Customer">Existing Customer</option>
              <option value="Associate">Associate Member</option>
              <option value="Preferred Customer">Preferred Customer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Quick summary chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500">Fast Filter:</span>
          {['All', 'New Customer', 'Associate', 'Preferred Customer', 'Existing Customer'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                typeFilter === type
                  ? 'bg-forest-900 text-gold-300 shadow-sm border border-brand-700/60'
                  : 'bg-emerald-50/50 text-slate-700 hover:bg-emerald-100/60 border border-emerald-100/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100/80 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4">Shakes Balance</th>
                <th className="py-3.5 px-4 text-center">Visits / Seminars</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4 text-right">Actions & Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 stroke-1 text-emerald-200" />
                    <p className="font-bold text-slate-700">No customer records found</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your search terms or register a new customer.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const balancePct = Math.min(100, (cust.consumedShakes / (cust.allottedShakes || 1)) * 100);
                  const isAssociate = cust.customerType === 'Associate' || cust.customerType === 'JP Member';

                  return (
                    <tr key={cust.id} className="hover:bg-emerald-50/20 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl ${isAssociate ? 'bg-gradient-to-tr from-gold-600 to-amber-400 text-forest-950 font-black' : 'bg-gradient-to-tr from-forest-900 to-brand-700 text-gold-300 font-bold'} text-xs flex items-center justify-center shrink-0 shadow-sm border border-brand-700/50`}>
                            {cust.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCustomerId(cust.id)}
                              className="font-bold text-slate-900 hover:text-brand-700 text-left transition-colors flex items-center gap-1 group"
                            >
                              <span>{cust.fullName}</span>
                              <Eye className="w-3 h-3 text-slate-400 group-hover:text-brand-600 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              {cust.phone} • <span className="font-mono text-brand-800">{cust.id}</span>
                              {cust.associateId && <span className="ml-1 text-gold-700 font-bold">({cust.associateId})</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <Badge variant={getCustomerTypeVariant(cust.customerType) as any}>
                          {cust.customerType}
                        </Badge>
                      </td>

                      {/* Active Plan */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{cust.programDuration}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px] font-medium">{cust.currentProgram}</p>
                      </td>

                      {/* Shakes Balance Meter */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className={cust.remainingShakes > 3 ? 'text-emerald-700' : 'text-rose-700'}>
                              {cust.remainingShakes} Left
                            </span>
                            <span className="text-slate-400">
                              {cust.consumedShakes}/{cust.allottedShakes}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-brand-600 to-emerald-400 h-full rounded-full"
                              style={{ width: `${balancePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Visits & Seminars */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">{cust.clubVisitsCount} visits</span>
                        <p className="text-[10px] text-gold-700 font-bold">{cust.seminarAttendanceCount} seminars</p>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4">
                        <p className="font-black text-gold-900">{formatCurrency(cust.totalSpent)}</p>
                        <span className="text-[10px] text-emerald-700 font-bold">{cust.paymentStatus}</span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Profile Action */}
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-brand-900 border border-emerald-200/80 font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
                            title="View Full 360 Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-600" />
                            <span>View Profile</span>
                          </button>

                          {/* Shift to Associate Action */}
                          {!isAssociate ? (
                            <button
                              type="button"
                              onClick={() => {
                                setShiftTargetCustomer(cust);
                                setShiftNotes('');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-white font-black text-[11px] flex items-center gap-1 shadow-xs transition-all active:scale-95 border border-gold-300/40"
                              title="Shift Customer to Associate Member"
                            >
                              <Award className="w-3.5 h-3.5 text-white" />
                              <span>Shift to Associate</span>
                            </button>
                          ) : (
                            <Link
                              href="/associates"
                              className="px-2 py-1.5 rounded-xl bg-gold-50 text-gold-900 border border-gold-200/80 font-bold text-[10px] flex items-center gap-1 hover:bg-gold-100 transition-colors"
                              title="View in Associate Hub"
                            >
                              <ShieldCheck className="w-3 h-3 text-gold-700" />
                              <span>Associate Partner</span>
                            </Link>
                          )}

                          {/* Log Shake */}
                          <button
                            type="button"
                            onClick={() => setShakeModalCustId(cust.id)}
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200/60"
                            title="Log Daily Shake Intake"
                          >
                            <Coffee className="w-3.5 h-3.5" />
                          </button>

                          {/* POS Order */}
                          <button
                            type="button"
                            onClick={() => router.push(`/pos?customer=${cust.id}`)}
                            className="p-1.5 rounded-xl bg-gold-50 hover:bg-gold-100 text-gold-800 transition-colors border border-gold-200/60"
                            title="New POS Order"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                          </button>

                          {/* Renew Plan */}
                          <button
                            type="button"
                            onClick={() => router.push(`/customers/reactivate?id=${cust.id}`)}
                            className="p-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-brand-900 transition-colors border border-brand-200/60"
                            title="Renew Program Plan"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
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

      {/* Shift to Associate Modal Confirmation Dialog */}
      {shiftTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 text-forest-950 flex items-center justify-center shadow-md font-black">
                  <Award className="w-5 h-5 text-forest-950" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Shift Customer to Associate</h3>
                  <p className="text-xs text-slate-500 font-medium">Elevate member to Associate Partner status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShiftTargetCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Details Summary Box */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{shiftTargetCustomer.fullName}</p>
                  <p className="text-xs text-slate-500 font-semibold">{shiftTargetCustomer.phone} • Member ID: {shiftTargetCustomer.id}</p>
                </div>
                <Badge variant={getCustomerTypeVariant(shiftTargetCustomer.customerType) as any}>
                  {shiftTargetCustomer.customerType}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-100 text-center">
                <div className="bg-white/90 p-2 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Remaining Shakes</p>
                  <p className="text-xs font-black text-brand-700">{shiftTargetCustomer.remainingShakes} shakes</p>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Visits</p>
                  <p className="text-xs font-black text-slate-800">{shiftTargetCustomer.clubVisitsCount} visits</p>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lifetime Spend</p>
                  <p className="text-xs font-black text-gold-900">{formatCurrency(shiftTargetCustomer.totalSpent)}</p>
                </div>
              </div>
            </div>

            {/* Data Retention Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>100% Historical Data Retention Guaranteed</span>
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                All shake intake history, past POS billing receipts, coach counseling notes, and active plan dates will be preserved and automatically linked to the new <strong>Associate ID</strong> in the Associate Registry.
              </p>
            </div>

            {/* Shift Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Promotion Remarks / Reason (Optional):</label>
              <input
                type="text"
                placeholder="e.g. Converted after 3 months nutrition journey; joined associate program"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShiftTargetCustomer(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShiftToAssociate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white text-xs font-black shadow-lg shadow-gold-950/20 flex items-center space-x-1.5 transition-all active:scale-95 border border-gold-300/40 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Confirm Shift to Associate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer 360 Degree Profile Modal */}
      <CustomerProfileModal
        customer={activeCustomer}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onOpenShakeLogger={(id) => {
          setSelectedCustomerId(null);
          setShakeModalCustId(id);
        }}
        onOpenSeminarLogger={(id) => {
          setSelectedCustomerId(null);
          setSeminarModalCustId(id);
        }}
      />

      {/* Global Modals for Quick Action from Table */}
      <ShakeLoggerModal
        isOpen={!!shakeModalCustId}
        preSelectedCustomerId={shakeModalCustId || undefined}
        onClose={() => setShakeModalCustId(null)}
      />

      <SeminarLoggerModal
        isOpen={!!seminarModalCustId}
        preSelectedCustomerId={seminarModalCustId || undefined}
        onClose={() => setSeminarModalCustId(null)}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading Customer Registry...</div>}>
      <CustomerContent />
    </Suspense>
  );
}
