'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Phone, Mail, MapPin, Calendar, 
  Coffee, UtensilsCrossed, CalendarCheck, 
  CreditCard, ArrowRight, ShieldCheck, HeartPulse, RefreshCw, Sparkles, Award, CheckCircle2
} from 'lucide-react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatTime } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface CustomerProfileModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenShakeLogger: (customerId: string) => void;
  onOpenSeminarLogger: (customerId: string) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  isOpen,
  onClose,
  onOpenShakeLogger,
  onOpenSeminarLogger,
}) => {
  const router = useRouter();
  const { shakeLogs, orders, seminars, invoices, promoteCustomerToAssociate } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'shakes' | 'orders' | 'seminars' | 'billing'>('overview');
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [promoteNotes, setPromoteNotes] = useState('');
  const [isPromoted, setIsPromoted] = useState(false);

  if (!customer) return null;

  const customerShakes = shakeLogs.filter(s => s.customerId === customer.id);
  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerSeminars = seminars.filter(s => s.customerId === customer.id);
  const customerInvoices = invoices.filter(i => i.customerId === customer.id);

  const isAssociate = customer.customerType === 'Associate' || customer.customerType === 'JP Member';

  const getCustomerTypeVariant = (type: string) => {
    switch (type) {
      case 'New Customer': return 'brand';
      case 'Existing Customer': return 'success';
      case 'Associate': return 'gold';
      case 'JP Member': return 'gold';
      case 'Preferred Customer': return 'warning';
      default: return 'neutral';
    }
  };

  const handlePromoteToAssociate = () => {
    promoteCustomerToAssociate(customer.id, promoteNotes);
    setShowPromoteConfirm(false);
    setIsPromoted(true);
    setTimeout(() => setIsPromoted(false), 5000);
  };

  const modalTitle = customer.fullName + ' - 360 Degree Profile';
  const modalSubtitle = 'Member ID: ' + customer.id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} subtitle={modalSubtitle} maxWidth="3xl">
      {/* Top Profile Summary HUD */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-brand-900 rounded-3xl p-5 text-white mb-6 shadow-xl border border-brand-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-300 flex items-center justify-center font-black text-xl text-forest-950 shadow-lg border border-gold-300 shrink-0">
              {customer.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-white">{customer.fullName}</h3>
                <Badge variant={getCustomerTypeVariant(customer.customerType) as any}>
                  {customer.customerType}
                </Badge>
              </div>
              <p className="text-xs text-brand-100/90 flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gold-300" /> {customer.phone}</span>
                <span>•</span>
                <span>{customer.gender}, {customer.age} yrs</span>
                <span>•</span>
                <span className="text-gold-200">{customer.branch}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                onOpenShakeLogger(customer.id);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-brand-400/30"
            >
              <Coffee className="w-3.5 h-3.5 text-gold-200" />
              <span>Log Shake</span>
            </button>
            <button
              onClick={() => {
                onClose();
                router.push(`/pos?customer=${customer.id}`);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-gold-300/30"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>POS Order</span>
            </button>
            <button
              onClick={() => {
                onClose();
                router.push(`/customers/reactivate?id=${customer.id}`);
              }}
              className="px-3.5 py-2 rounded-xl bg-forest-950/80 hover:bg-forest-950 text-gold-300 text-xs font-bold flex items-center gap-1.5 border border-brand-600/50 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Plan</span>
            </button>

            {!isAssociate && (
              <button
                type="button"
                onClick={() => setShowPromoteConfirm(!showPromoteConfirm)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-950/30 border border-gold-300/40 transition-all cursor-pointer active:scale-95"
              >
                <Award className="w-3.5 h-3.5 text-white" />
                <span>Shift to Associate</span>
              </button>
            )}
          </div>
        </div>

        {/* Promotion Confirmation Box */}
        {showPromoteConfirm && (
          <div className="mt-4 p-4 rounded-2xl bg-[#021811] border border-gold-400/50 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                <h4 className="font-black text-xs text-gold-300 uppercase tracking-wider">
                  Confirm Shift to Associate Member
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoteConfirm(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>
            <p className="text-xs text-brand-100/90 leading-relaxed">
              Elevating <strong>{customer.fullName}</strong> ({customer.id}) to <strong>Associate Partner</strong>. All past shake balances ({customer.remainingShakes} shakes remaining), invoices, visits, and order records will seamlessly move into the <strong>Associate Registry</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Optional promotion note (e.g. Partner onboarding batch 1)..."
                value={promoteNotes}
                onChange={(e) => setPromoteNotes(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/50 border border-emerald-700/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400"
              />
              <button
                type="button"
                onClick={handlePromoteToAssociate}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white text-xs font-black shadow-lg shadow-gold-950/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Confirm Shift</span>
              </button>
            </div>
          </div>
        )}

        {/* Promoted Success Toast */}
        {isPromoted && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>Success! {customer.fullName} has been shifted to Associate. Profile is now live in the Associate Registry.</span>
          </div>
        )}

        {/* Shake Balance Meter HUD */}
        <div className="mt-4 pt-4 border-t border-brand-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
            <p className="text-[10px] uppercase font-bold text-gold-400">Current Program</p>
            <p className="text-xs font-bold text-white truncate mt-0.5">{customer.currentProgram}</p>
            <p className="text-[10px] text-brand-200/70 mt-0.5">{formatDate(customer.startDate)} - {formatDate(customer.endDate)}</p>
          </div>

          <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
            <p className="text-[10px] uppercase font-bold text-gold-400">Shakes Balance</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-black text-emerald-400">{customer.remainingShakes}</span>
              <span className="text-xs text-brand-200/80 font-medium">/ {customer.allottedShakes} allotted</span>
            </div>
            <p className="text-[10px] text-brand-300">{customer.consumedShakes} consumed so far</p>
          </div>

          <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
            <p className="text-[10px] uppercase font-bold text-gold-400">Visits & Seminars</p>
            <p className="text-xs font-bold text-white mt-0.5">{customer.clubVisitsCount} Visits • {customer.seminarAttendanceCount} Seminars</p>
            <p className="text-[10px] text-brand-200/70 mt-0.5">Coach: {customer.counselingBy}</p>
          </div>

          <div className="bg-forest-950/60 rounded-2xl p-3 border border-brand-700/40">
            <p className="text-[10px] uppercase font-bold text-gold-400">Lifetime Revenue</p>
            <p className="text-xs font-black text-gold-300 mt-0.5">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Status: {customer.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-emerald-100 mb-5 overflow-x-auto">
        {[
          { id: 'overview', label: 'Program & Goals' },
          { id: 'shakes', label: `Daily Shakes (${customerShakes.length})` },
          { id: 'orders', label: `POS Orders (${customerOrders.length})` },
          { id: 'seminars', label: `Seminars (${customerSeminars.length})` },
          { id: 'billing', label: `Invoices (${customerInvoices.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-800'
                : 'border-transparent text-slate-500 hover:text-brand-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[220px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100/80 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                <span>Health Goals & Counseling</span>
              </h4>
              <div>
                <p className="text-slate-500 font-medium mb-1">Target Health Goals:</p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.healthGoals?.map(g => (
                    <span key={g} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200/80 font-bold text-brand-900 shadow-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Counselor / Coach:</p>
                <p className="font-bold text-slate-900">{customer.counselingBy}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Medical Notes / Preferences:</p>
                <p className="font-medium text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-200/80 mt-1">
                  {customer.medicalNotes || 'No specific medical conditions recorded.'}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100/80 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>Referral & Registration Details</span>
              </h4>
              <div>
                <p className="text-slate-500 font-medium">Inviter Type:</p>
                <p className="font-bold text-slate-900">{customer.inviterType}</p>
              </div>
              {customer.inviterName && (
                <div>
                  <p className="text-slate-500 font-medium">Inviter Name & Contact:</p>
                  <p className="font-semibold text-slate-800">{customer.inviterName} {customer.inviterContact ? `(${customer.inviterContact})` : ''}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 font-medium">Address:</p>
                <p className="text-slate-700">{customer.address || 'Address not recorded.'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Registered On:</p>
                <p className="text-slate-700">{formatDate(customer.createdAt)}</p>
              </div>
              {customer.remarks && (
                <div>
                  <p className="text-slate-500 font-medium">Program Remarks / Notes:</p>
                  <p className="font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-200/80 mt-1">
                    {customer.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shakes' && (
          <div>
            {customerShakes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No daily shake visits recorded yet for this customer.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-100 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Flavor / Combo</th>
                      <th className="py-2.5 px-3 text-center">Count</th>
                      <th className="py-2.5 px-3 text-center">Remaining</th>
                      <th className="py-2.5 px-3">Coach Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerShakes.map(s => (
                      <tr key={s.id} className="hover:bg-emerald-50/20">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{formatDate(s.date)} at {formatTime(s.time)}</td>
                        <td className="py-2.5 px-3 text-brand-900 font-bold">{s.flavorCombo}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gold-700">{s.shakeCount}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{s.newBalance}</td>
                        <td className="py-2.5 px-3 text-slate-500">{s.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {customerOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No POS orders made by this customer yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-100 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerOrders.map(o => (
                      <tr key={o.id} className="hover:bg-emerald-50/20">
                        <td className="py-2.5 px-3 font-bold text-brand-800">Token #{o.tokenNumber} ({o.id})</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(o.createdAt)}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-50 text-gold-800 border border-gold-200">
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-gold-900">{formatCurrency(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'seminars' && (
          <div>
            {customerSeminars.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No seminar workshops attended yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {customerSeminars.map(sem => (
                  <div key={sem.id} className="p-3.5 rounded-2xl bg-gold-50/60 border border-gold-200/80 flex items-start justify-between text-xs">
                    <div>
                      <p className="font-bold text-gold-950">{sem.topic}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Conducted by {sem.staffName} on {formatDate(sem.date)}</p>
                      {sem.remarks && <p className="text-slate-700 mt-1 italic font-medium">Remarks: &quot;{sem.remarks}&quot;</p>}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gold-600 text-white font-bold text-[10px] shadow-xs">Attended</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            {customerInvoices.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No billing receipts found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {customerInvoices.map(inv => (
                  <div key={inv.id} className="p-3.5 rounded-2xl bg-slate-50 border border-emerald-100/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-900">{inv.invoiceNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">{inv.type}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{formatDate(inv.date)} • Mode: {inv.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gold-900 text-sm">{formatCurrency(inv.total)}</p>
                      <span className="text-[10px] font-bold text-emerald-700">Paid ({inv.paymentStatus})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
