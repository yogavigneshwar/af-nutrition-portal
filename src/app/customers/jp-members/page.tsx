'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, UserPlus, Search, Filter, Sparkles, Coffee, 
  Calendar, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  CreditCard, Eye, ArrowRight, X, ChevronRight, Check, Award
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Customer, PaymentMethod } from '../../../types';
import { CustomerProfileModal } from '../../../components/customers/CustomerProfileModal';

export default function JpMembersPage() {
  const { customers, shakeLogs, addCustomer, logDailyShakeIntake, currentUser, selectedBranch } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired' | 'DrankToday' | 'NotDrankToday' | 'HasBalance'>('All');
  
  // Selected customer for 360 Profile
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState<number | ''>('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regOccupation, setRegOccupation] = useState('');
  const [regStartDate, setRegStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [regPrice, setRegPrice] = useState<number | ''>('');
  const [regAmountPaid, setRegAmountPaid] = useState<number | ''>('');
  const [regPaymentMethod, setRegPaymentMethod] = useState<PaymentMethod>('UPI');
  const [regNotes, setRegNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Serve Shake Modal State
  const [servingMember, setServingMember] = useState<Customer | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState('Chocolate Kulfi Shake');

  // Filter to only JP Members
  const jpMembers = useMemo(() => {
    return customers.filter(c => c.customerType === 'JP Member');
  }, [customers]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Map each JP member with today's shake status and validity
  const memberAnalytics = useMemo(() => {
    return jpMembers.map(member => {
      const todayLogs = shakeLogs.filter(s => s.customerId === member.id && s.date === todayStr);
      const drankToday = todayLogs.length > 0;
      const todayCount = todayLogs.reduce((acc, s) => acc + s.shakeCount, 0);

      const end = new Date(member.endDate);
      const today = new Date(todayStr);
      const diffTime = end.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isExpired = daysRemaining < 0;

      return {
        member,
        drankToday,
        todayCount,
        daysRemaining: Math.max(0, daysRemaining),
        isExpired,
      };
    });
  }, [jpMembers, shakeLogs, todayStr]);

  // Key Statistics
  const totalCount = jpMembers.length;
  const activeCount = memberAnalytics.filter(m => !m.isExpired).length;
  const drankTodayCount = memberAnalytics.filter(m => m.drankToday).length;
  const pendingTodayCount = activeCount - drankTodayCount;
  const totalRevenueCollected = jpMembers.reduce((acc, m) => acc + (m.amountPaid || 0), 0);
  const totalBalanceDue = jpMembers.reduce((acc, m) => acc + (m.balanceDue || 0), 0);

  // Filter members based on user selection
  const filteredMembers = useMemo(() => {
    return memberAnalytics.filter(({ member, drankToday, isExpired }) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        member.fullName.toLowerCase().includes(q) ||
        member.phone.includes(q) ||
        member.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'Active') return !isExpired;
      if (statusFilter === 'Expired') return isExpired;
      if (statusFilter === 'DrankToday') return drankToday;
      if (statusFilter === 'NotDrankToday') return !drankToday && !isExpired;
      if (statusFilter === 'HasBalance') return (member.balanceDue || 0) > 0;

      return true;
    });
  }, [memberAnalytics, searchQuery, statusFilter]);

  // Calculate End Date for Registration Form (strictly 30 days)
  const calculatedEndDate = useMemo(() => {
    if (!regStartDate) return '';
    const d = new Date(regStartDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, [regStartDate]);

  // Handle Registration Submit
  const handleRegisterJpMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regPhone.trim()) {
      alert('Please fill in Member Name and Phone Number.');
      return;
    }

    const priceNum = regPrice === '' ? 3500 : Number(regPrice);
    const paidNum = regAmountPaid === '' ? priceNum : Number(regAmountPaid);
    const balanceNum = Math.max(0, priceNum - paidNum);

    const newCust = addCustomer(
      {
        fullName: regFullName.trim(),
        phone: regPhone.trim(),
        age: regAge === '' ? 28 : Number(regAge),
        gender: regGender,
        occupation: regOccupation.trim() || 'Professional',
        customerType: 'JP Member',
        currentProgram: 'JP Member Plan (Strictly 30 Days - 1 Shake/Day)',
        programDuration: '30 Days',
        durationInDays: 30,
        allottedShakes: 30,
        consumedShakes: 0,
        remainingShakes: 30,
        dailyShakeFrequency: 1,
        startDate: regStartDate,
        endDate: calculatedEndDate,
        pricePerDay: Math.round(priceNum / 30),
        totalPlanCost: priceNum,
        amountPaid: paidNum,
        balanceDue: balanceNum,
        paymentStatus: balanceNum === 0 ? 'Paid' : paidNum > 0 ? 'Partial' : 'Pending',
        paymentMethod: regPaymentMethod,
        counselingBy: currentUser.name,
        branch: selectedBranch,
        status: 'Active',
        medicalNotes: regNotes.trim(),
      },
      {
        amountPaid: paidNum,
        paymentMethod: regPaymentMethod,
        notes: `JP 30-Day Membership Registration • ₹${priceNum} fee`,
      }
    );

    setToastMessage(`JP Member ${newCust.fullName} successfully registered for 30-day strict plan!`);
    setTimeout(() => setToastMessage(null), 4000);

    // Reset Form
    setShowRegisterModal(false);
    setRegFullName('');
    setRegPhone('');
    setRegAge('');
    setRegOccupation('');
    setRegPrice('');
    setRegAmountPaid('');
    setRegNotes('');
  };

  // Serve Today's 1 Shake
  const handleServeShake = () => {
    if (!servingMember) return;

    // Check if already taken today
    const alreadyDrank = shakeLogs.some(s => s.customerId === servingMember.id && s.date === todayStr);
    if (alreadyDrank) {
      alert("JP Member Daily Limit: Strictly 1 shake per day allowed for JP Members! Today's quota has already been taken.");
      setServingMember(null);
      return;
    }

    const log = logDailyShakeIntake(servingMember.id, 1, selectedFlavor, 'JP Member Daily 1-Shake Quota');
    if (log) {
      setToastMessage(`Today's shake logged for ${servingMember.fullName} (${selectedFlavor})! Remaining: ${Math.max(0, servingMember.remainingShakes - 1)} shakes.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
    setServingMember(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 text-gold-400 border border-gold-500/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-gold-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#031d15] via-[#052b20] to-[#031d15] rounded-3xl p-6 text-white border border-emerald-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Special Member Tier
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
                Strict 30-Day Plan • 1 Shake / Day
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              JP Members Club
            </h1>
            <p className="text-xs md:text-sm text-emerald-200/80 mt-1 max-w-2xl font-medium">
              Dedicated management for JP tier members. Enforces strict 30-day duration, 1 daily shake intake policy, custom manual pricing, and real-time attendance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-gold-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span>Register JP Member</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metric HUDs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-900/60">
          <div className="bg-emerald-900/30 rounded-2xl p-3.5 border border-emerald-800/40">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Total JP Members</p>
            <p className="text-2xl font-black text-white mt-1">{totalCount} Members</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">{activeCount} Currently Active</p>
          </div>

          <div className="bg-emerald-900/30 rounded-2xl p-3.5 border border-emerald-800/40">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Today's Shake Taken</p>
            <p className="text-2xl font-black text-gold-400 mt-1">{drankTodayCount} / {activeCount}</p>
            <p className="text-[10px] text-emerald-300/80 mt-0.5">{pendingTodayCount > 0 ? `${pendingTodayCount} yet to take today` : 'All took today!'}</p>
          </div>

          <div className="bg-emerald-900/30 rounded-2xl p-3.5 border border-emerald-800/40">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Total Fees Collected</p>
            <p className="text-2xl font-black text-white mt-1">{formatCurrency(totalRevenueCollected)}</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">30-day manual plans</p>
          </div>

          <div className="bg-emerald-900/30 rounded-2xl p-3.5 border border-emerald-800/40">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Balance Outstanding</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(totalBalanceDue)}</p>
            <p className="text-[10px] text-amber-300/80 mt-0.5">Pending collection</p>
          </div>
        </div>
      </div>

      {/* Strict Rule Highlight Banner */}
      <div className="bg-gradient-to-r from-gold-50 via-amber-50/50 to-gold-50 rounded-2xl p-4 border border-gold-300/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start md:items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gold-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-sm">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h4 className="font-black text-amber-950 uppercase tracking-wide">Strict JP Rules Enforced</h4>
            <p className="text-amber-900/80 mt-0.5 font-medium">
              1. <strong>Strict 30-Day Period:</strong> Membership validity is exactly 30 calendar days from start date.
              <span className="mx-2">•</span>
              2. <strong>1 Shake Per Day Limit:</strong> JP Members are entitled to exactly 1 quota shake per day (30 shakes total).
              <span className="mx-2">•</span>
              3. <strong>Manual Pricing:</strong> Custom fee entered by coach/staff during registration.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search JP Member by name, phone, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { key: 'All', label: 'All' },
              { key: 'Active', label: 'Active' },
              { key: 'DrankToday', label: '✓ Drank Today' },
              { key: 'NotDrankToday', label: '○ Not Yet Taken' },
              { key: 'HasBalance', label: 'Has Balance' },
              { key: 'Expired', label: 'Expired' },
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* JP Member Directory Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4">Member Info</th>
                <th className="py-4 px-4">30-Day Period & Validity</th>
                <th className="py-4 px-4">Shake Quota (Max 1/Day)</th>
                <th className="py-4 px-4">Today's Shake Status</th>
                <th className="py-4 px-4">Plan Fee & Balance</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No JP Members Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? 'Try matching another name or phone' : 'Click "Register JP Member" above to register your first 30-day JP member.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map(({ member, drankToday, todayCount, daysRemaining, isExpired }) => {
                  const quotaPercent = Math.min(100, Math.round((member.consumedShakes / 30) * 100));

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-gold-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                            JP
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm hover:text-brand-700 cursor-pointer" onClick={() => setSelectedCustomer(member)}>
                              {member.fullName}
                            </p>
                            <p className="text-slate-500 font-mono text-[11px]">
                              {member.phone} • {member.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 30-Day Period */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">
                            {formatDate(member.startDate)} → {formatDate(member.endDate)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {isExpired ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {daysRemaining} days left
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">Strict 30d</span>
                          </div>
                        </div>
                      </td>

                      {/* Quota Consumed */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between font-bold text-[11px]">
                            <span className="text-slate-700">{member.consumedShakes} / 30 Shakes</span>
                            <span className="text-emerald-700 font-black">{member.remainingShakes} left</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className="bg-gradient-to-r from-brand-600 to-gold-500 h-full rounded-full transition-all"
                              style={{ width: `${quotaPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Today's Shake Status */}
                      <td className="py-3.5 px-4">
                        {drankToday ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Drank Today (1/1)
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80">
                              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              Pending (0/1)
                            </span>
                            {!isExpired && (
                              <button
                                type="button"
                                onClick={() => setServingMember(member)}
                                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-700 hover:from-brand-500 hover:to-emerald-600 text-white font-black text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                                title="Serve today's quota shake"
                              >
                                <Coffee className="w-3 h-3" />
                                <span>Serve</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Plan Fee & Balance */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{formatCurrency(member.totalPlanCost)}</p>
                        <p className="text-[11px] text-slate-500">Paid: {formatCurrency(member.amountPaid || 0)}</p>
                        {member.balanceDue > 0 ? (
                          <Link
                            href={`/billing?search=${encodeURIComponent(member.fullName)}`}
                            className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200 transition-colors"
                          >
                            Bal: ₹{member.balanceDue} (Settle)
                          </Link>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700">Fully Paid</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(member)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="View 360 Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

      {/* REGISTRATION MODAL: Strictly 30 Days & Manual Price */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#031d15] to-[#063326] p-5 text-white flex items-center justify-between border-b border-emerald-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gold-500/20 text-gold-400 border border-gold-400/40">
                  Strict 30-Day Plan • 1 Shake/Day
                </span>
                <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold-400" />
                  Register New JP Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterJpMember} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Member full name"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Age, Gender & Occupation */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Age (e.g. 28)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={regOccupation}
                    onChange={(e) => setRegOccupation(e.target.value)}
                    placeholder="e.g. Software, Business"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Strict Membership Parameters Box */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Membership Duration & Limits
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    LOCKED STRICT POLICY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Duration</p>
                    <p className="font-black text-slate-900 mt-0.5">Strictly 30 Days (1 Month)</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Daily Shake Allocation</p>
                    <p className="font-black text-emerald-700 mt-0.5">Strictly 1 Shake / Day (30 Total)</p>
                  </div>
                </div>

                {/* Start Date & Auto End Date */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={regStartDate}
                      onChange={(e) => setRegStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 focus:border-brand-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Auto End Date (30 Days)</label>
                    <input
                      type="date"
                      disabled
                      value={calculatedEndDate}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-100 border border-slate-200 font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Manual Pricing & Payment */}
              <div className="bg-amber-50/60 rounded-2xl p-4 border border-gold-300/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    Manual Fee & Payment Details
                  </span>
                  <span className="text-[10px] font-bold text-amber-800">
                    Staff Enters Custom Price
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Membership Fee (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={regPrice}
                      onChange={(e) => setRegPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter custom price (e.g. 3500)"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-slate-300 font-black text-slate-900 focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Amount Paid Now (₹)</label>
                      {regPrice !== '' && (
                        <button
                          type="button"
                          onClick={() => setRegAmountPaid(Number(regPrice))}
                          className="text-[10px] text-brand-700 hover:underline font-bold"
                        >
                          Pay Full
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={regAmountPaid}
                      onChange={(e) => setRegAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Amount collected now"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-slate-300 font-bold text-emerald-800 focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                {/* Balance Display */}
                {regPrice !== '' && (
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-xs">
                    <span className="text-slate-600 font-medium">Balance Due:</span>
                    <span className={`font-black ${Number(regPrice) - (regAmountPaid === '' ? Number(regPrice) : Number(regAmountPaid)) > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatCurrency(Math.max(0, Number(regPrice) - (regAmountPaid === '' ? Number(regPrice) : Number(regAmountPaid))))}
                    </span>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setRegPaymentMethod(mode)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          regPaymentMethod === mode
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Counselor / Health Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder="Goals, preferences, or referral notes..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 outline-none resize-none"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 shadow-md shadow-gold-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Confirm & Register JP Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVE TODAY'S SHAKE MODAL */}
      {servingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-900 to-forest-950 p-5 text-white flex items-center justify-between border-b border-emerald-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gold-400 text-slate-950">
                  Daily 1-Shake Quota (₹0)
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  Serve Shake for {servingMember.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setServingMember(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Current Consumed:</span>
                  <span>{servingMember.consumedShakes} / 30 Shakes</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 mt-1">
                  <span>After Serving Today:</span>
                  <span>{servingMember.consumedShakes + 1} / 30 Shakes</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Shake Flavor</label>
                <select
                  value={selectedFlavor}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 font-bold text-slate-800 outline-none"
                >
                  <option value="Chocolate Kulfi Shake">Chocolate Kulfi Shake</option>
                  <option value="Mango Delight Protein Shake">Mango Delight Protein Shake</option>
                  <option value="Vanilla Protein Fusion">Vanilla Protein Fusion</option>
                  <option value="Strawberry Blast Shake">Strawberry Blast Shake</option>
                  <option value="Royal Rose & Cardamom Shake">Royal Rose & Cardamom Shake</option>
                  <option value="Cookies & Cream Ultra Shake">Cookies & Cream Ultra Shake</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setServingMember(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleServeShake}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-emerald-700 hover:from-brand-500 hover:to-emerald-600 shadow-md shadow-brand-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Confirm 1 Shake (Quota ₹0)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer 360 Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onOpenShakeLogger={(id) => {
            const m = jpMembers.find(c => c.id === id);
            if (m) setServingMember(m);
          }}
        />
      )}
    </div>
  );
}
