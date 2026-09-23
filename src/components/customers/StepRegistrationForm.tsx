'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, Phone, Mail, MapPin, HeartPulse, 
  Calendar, ShieldCheck, CreditCard, CheckCircle2, 
  ArrowRight, ArrowLeft, Award, Sparkles, Calculator, FileText, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerType, ProgramDuration, PaymentMethod } from '../../types';
import { calculateProgramDays, calculateTotalPlanCost, formatCurrency } from '../../lib/utils';
import { InvoiceModal } from '../common/InvoiceModal';

export const StepRegistrationForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get('type');
  const initialType: CustomerType = typeParam === 'Associate' ? 'Associate' : 'New Customer';

  const { addCustomer, currentUser, selectedBranch, invoices } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    phone: '',
    email: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: 28,
    address: '',
    emergencyContact: '',
    branch: selectedBranch,

    // Step 2
    inviterType: 'Walk-in' as 'Friend/Family' | 'Walk-in' | 'Digital/Social Media' | 'Coach' | 'Member',
    inviterName: '',
    inviterContact: '',
    counselingBy: currentUser.name,
    healthGoals: ['Weight Loss', 'Energy Boost'] as string[],
    medicalNotes: '',

    // Step 3
    customerType: initialType,
    currentProgram: initialType === 'Associate' ? 'Associate Partner Transformation Plan' : '30 Days Wellness Transformation',
    programDuration: '30 Days' as ProgramDuration,
    customDays: 30,
    startDate: new Date().toISOString().split('T')[0],
    dailyShakeFrequency: 1,
    planCost: 4500,
    remarks: '',

    // Step 4
    amountPaid: 4500,
    paymentMethod: 'UPI' as PaymentMethod,
    paymentNotes: 'Full payment received at registration',
  });

  const availableGoals = [
    'Weight Loss', 'Fat Loss', 'Muscle Gain', 
    'Energy Boost', 'Daily Wellness', 'Gut Health', 
    'Skin Glow', 'Immunity Boost', 'Endurance'
  ];

  const durationDays = calculateProgramDays(formData.programDuration, formData.customDays);
  const calculatedTotalCost = formData.planCost !== undefined ? Number(formData.planCost) : calculateTotalPlanCost(durationDays, 150);
  const calculatedShakes = durationDays * formData.dailyShakeFrequency;
  const calculatedBalanceDue = Math.max(0, calculatedTotalCost - formData.amountPaid);

  const handleDurationChange = (dur: ProgramDuration) => {
    const days = calculateProgramDays(dur, formData.customDays);
    const cost = calculateTotalPlanCost(days, 150);
    setFormData(prev => ({
      ...prev,
      programDuration: dur,
      planCost: cost,
      amountPaid: cost,
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const exists = prev.healthGoals.includes(goal);
      return {
        ...prev,
        healthGoals: exists ? prev.healthGoals.filter(g => g !== goal) : [...prev.healthGoals, goal],
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        alert('Please enter customer full name.');
        return;
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const dailyRate = durationDays > 0 ? Math.round(Number(formData.planCost) / durationDays) : 150;
      const newCust = addCustomer(
        {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender,
          age: Number(formData.age),
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          branch: formData.branch,
          inviterType: formData.inviterType,
          inviterName: formData.inviterName,
          inviterContact: formData.inviterContact,
          counselingBy: formData.counselingBy,
          healthGoals: formData.healthGoals,
          medicalNotes: formData.medicalNotes,
          customerType: formData.customerType,
          currentProgram: formData.currentProgram,
          programDuration: formData.programDuration,
          durationInDays: durationDays,
          startDate: formData.startDate,
          allottedShakes: calculatedShakes,
          dailyShakeFrequency: formData.dailyShakeFrequency,
          pricePerDay: dailyRate,
          totalPlanCost: Number(formData.planCost),
          remarks: formData.remarks,
        },
        {
          amountPaid: Number(formData.amountPaid),
          paymentMethod: formData.paymentMethod,
          notes: formData.paymentNotes,
        }
      );

      const inv = invoices[0];
      setCompletedInvoice(inv);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setTimeout(() => setIsSubmitting(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-[#021811] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gold-300 bg-gold-500/15 border border-gold-400/40 px-3 py-1 rounded-full shadow-inner">
              Operational Member Onboarding
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
              <span>Customer Registration & Lifecycle Enrollment</span>
            </h2>
            <p className="text-xs text-brand-100/80 mt-1 font-medium">
              Complete the 5-step workflow to enroll a new member, calculate plan cost, and issue shake quota.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-400/50 flex items-center justify-center text-gold-300 font-black text-sm shrink-0 shadow-inner">
            {currentStep}/5
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="relative z-10 grid grid-cols-5 gap-2 sm:gap-3 text-center">
          {[
            { step: 1, label: 'Identity' },
            { step: 2, label: 'Referral & Goals' },
            { step: 3, label: 'Program & Quota' },
            { step: 4, label: 'Billing & Pay' },
            { step: 5, label: 'Review & Activate' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => s.step < currentStep && setCurrentStep(s.step)}
              className={`p-2.5 rounded-2xl transition-all ${
                s.step === currentStep
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-white font-black shadow-lg shadow-gold-950/30 border border-gold-300/40'
                  : s.step < currentStep
                  ? 'bg-forest-950/70 text-emerald-400 font-bold cursor-pointer border border-brand-700/50'
                  : 'bg-forest-950/30 text-brand-300/40 font-medium'
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider hidden sm:block">Step {s.step}</p>
              <p className="text-xs truncate">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Body */}
      <div className="p-6 sm:p-8">
        {/* Step 1: Identity & Contact */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-3">
              <User className="w-4 h-4 text-brand-600" />
              <span>Step 1: Customer Personal Identity & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Krishnan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9841234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh.k@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 text-xs text-slate-900 font-semibold bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age === 0 ? '' : formData.age}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, age: val === '' ? 0 : parseInt(val, 10) || 0 });
                    }}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 text-xs text-slate-900 font-semibold"
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9840099887"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15/2 Medavakkam Tank Road, Kellys, Chennai"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Referral & Counseling */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-3">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>Step 2: Referral Source, Counseling & Wellness Objectives</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Inviter / Referral Source *
                </label>
                <select
                  value={formData.inviterType}
                  onChange={(e) => setFormData({ ...formData, inviterType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="Walk-in">Direct Walk-in</option>
                  <option value="Friend/Family">Friend / Family Member</option>
                  <option value="Digital/Social Media">Digital / Social Media (Instagram / Facebook)</option>
                  <option value="Member">Existing Club Member</option>
                  <option value="Coach">Wellness Coach Outreach</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Counseling Taken By (Coach) *
                </label>
                <input
                  type="text"
                  value={formData.counselingBy}
                  onChange={(e) => setFormData({ ...formData, counselingBy: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-900"
                  required
                />
              </div>

              {formData.inviterType !== 'Walk-in' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Inviter / Referral Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Menon"
                      value={formData.inviterName}
                      onChange={(e) => setFormData({ ...formData, inviterName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Inviter Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9840011223"
                      value={formData.inviterContact}
                      onChange={(e) => setFormData({ ...formData, inviterContact: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Health Goals selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Health & Fitness Goals (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGoals.map(goal => {
                  const isSelected = formData.healthGoals.includes(goal);
                  return (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-1 ring-emerald-300 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50/40'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{goal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Medical Considerations / Dietary Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Lactose intolerant, low sodium requirement, post-pregnancy recovery..."
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900"
              />
            </div>
          </div>
        )}

        {/* Step 3: Program & Shake Quota Calculation */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-3">
              <Calculator className="w-4 h-4 text-gold-600" />
              <span>Step 3: Program Package & Plan Cost Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Profile Classification *
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-bold text-brand-900 bg-emerald-50/40"
                >
                  <option value="New Customer">New Customer (First time onboarding)</option>
                  <option value="Associate">Associate (Wellness Associate / Partner)</option>
                  <option value="Preferred Customer">Preferred Customer (VIP Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Program Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Program Duration Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Program Duration *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {(['3 Day Trial', '15 Days', '21 Days', '30 Days', '60 Days', 'Custom'] as ProgramDuration[]).map(dur => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => handleDurationChange(dur)}
                    className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                      formData.programDuration === dur
                        ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-black shadow-sm ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <p className="text-xs font-bold">{dur}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {calculateProgramDays(dur, formData.customDays)} Days
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {formData.programDuration === 'Custom' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Days Count
                </label>
                <input
                  type="number"
                  value={formData.customDays === 0 ? '' : formData.customDays}
                  onChange={(e) => {
                    const val = e.target.value;
                    const days = val === '' ? 0 : parseInt(val, 10) || 0;
                    const cost = calculateTotalPlanCost(days, 150);
                    setFormData({
                      ...formData,
                      customDays: days,
                      planCost: cost,
                      amountPaid: cost,
                    });
                  }}
                  placeholder="30"
                  className="w-48 px-3.5 py-2 rounded-xl border border-emerald-200/80 text-xs font-bold"
                  min={1}
                  max={365}
                />
              </div>
            )}

            {/* Frequency & Editable Plan Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Shake Frequency
                </label>
                <select
                  value={formData.dailyShakeFrequency}
                  onChange={(e) => setFormData({ ...formData, dailyShakeFrequency: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold bg-white"
                >
                  <option value={1}>1 Shake per day (Standard)</option>
                  <option value={2}>2 Shakes per day (Intensive Double Nutrition)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Plan Cost (₹) *
                  </label>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                    Editable Cost
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={formData.planCost === 0 ? '' : formData.planCost}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cost = val === '' ? 0 : parseInt(val, 10) || 0;
                      setFormData({
                        ...formData,
                        planCost: cost,
                        amountPaid: cost,
                      });
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Remarks / Package Notes Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>Program Remarks & Package Notes</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Special festive discount applied, includes complimentary shaker, referred by Coach Suresh..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Calculated HUD Card */}
            <div className="bg-gradient-to-r from-forest-900 via-brand-800 to-brand-700 rounded-3xl p-5 text-white shadow-xl border border-brand-600/40">
              <p className="text-[10px] uppercase tracking-wider font-black text-gold-300 mb-1">
                Plan Financial & Shake Allocation Overview
              </p>
              <div className="grid grid-cols-3 gap-3 text-center my-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] text-brand-200 font-bold uppercase">Duration</p>
                  <p className="text-lg font-black text-white">{durationDays} Days</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] text-brand-200 font-bold uppercase">Allotted Shakes</p>
                  <p className="text-lg font-black text-gold-300">{calculatedShakes} Shakes</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] text-brand-200 font-bold uppercase">Total Plan Cost</p>
                  <p className="text-lg font-black text-gold-200">{formatCurrency(calculatedTotalCost)}</p>
                </div>
              </div>
              <p className="text-[11px] text-brand-100 text-center font-medium mt-1">
                Plan Investment: {formatCurrency(calculatedTotalCost)} ({durationDays} Days • {calculatedShakes} Total Shakes)
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Billing & Payment */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-3">
              <CreditCard className="w-4 h-4 text-gold-600" />
              <span>Step 4: Payment Receipt & Initial Invoice Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Plan Amount
                </label>
                <div className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-sm border border-emerald-100">
                  {formatCurrency(calculatedTotalCost)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount Paid Now (Rs.) *
                </label>
                <input
                  type="number"
                  value={formData.amountPaid === 0 ? '' : formData.amountPaid}
                  onChange={(e) => {
                    const val = e.target.value;
                    const paid = val === '' ? 0 : parseInt(val, 10) || 0;
                    setFormData({ ...formData, amountPaid: paid });
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-black text-emerald-700 focus:ring-2 focus:ring-brand-500/20"
                  min={0}
                  max={calculatedTotalCost}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Mode *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="UPI">UPI / Google Pay / PhonePe / Paytm</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Direct Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Balance Outstanding
                </label>
                <div className={`p-3 rounded-xl font-black text-sm border ${
                  calculatedBalanceDue > 0 ? 'bg-amber-50 text-amber-800 border-gold-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {calculatedBalanceDue > 0 ? formatCurrency(calculatedBalanceDue) : 'Rs. 0 (Fully Paid)'}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Billing Notes / Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 334981729012 - HDFC Bank"
                  value={formData.paymentNotes}
                  onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Step 5: Review Complete Profile & Issue Shake Allocation</span>
            </h3>

            <div className="bg-emerald-50/40 rounded-3xl p-6 border border-emerald-100/80 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div>
                  <h4 className="text-base font-black text-slate-900">{formData.fullName}</h4>
                  <p className="text-slate-500 font-medium">{formData.phone} • {formData.gender}, {formData.age} yrs • {formData.branch}</p>
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-forest-900 to-brand-800 text-gold-300 shadow-sm border border-brand-700/50">
                  {formData.customerType}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-slate-500 font-medium">Program Package:</p>
                  <p className="font-bold text-slate-900">{formData.programDuration} Plan</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Shake Allocation:</p>
                  <p className="font-black text-emerald-700">{calculatedShakes} Shakes</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Total Plan Cost:</p>
                  <p className="font-black text-gold-900">{formatCurrency(calculatedTotalCost)}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Payment Status:</p>
                  <p className="font-bold text-emerald-700">{formData.paymentMethod} ({formatCurrency(formData.amountPaid)})</p>
                </div>
              </div>

              <div className="border-t border-emerald-100 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-500 font-medium">Counselor:</p>
                  <p className="font-semibold text-slate-800">{formData.counselingBy}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Referral / Inviter:</p>
                  <p className="font-semibold text-slate-800">{formData.inviterType} {formData.inviterName ? `(${formData.inviterName})` : ''}</p>
                </div>
              </div>

              {formData.remarks && (
                <div className="border-t border-emerald-100 pt-3">
                  <p className="text-slate-500 font-medium mb-0.5">Program Remarks / Notes:</p>
                  <p className="font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-200">
                    {formData.remarks}
                  </p>
                </div>
              )}

              <div className="border-t border-emerald-100 pt-3">
                <p className="text-slate-500 font-medium mb-1">Target Goals:</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.healthGoals.map(g => (
                    <span key={g} className="px-2.5 py-0.5 rounded-lg bg-white border border-emerald-200 text-brand-900 font-bold shadow-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-md shadow-brand-900/20 flex items-center gap-1.5 transition-all active:scale-95 border border-brand-400/30 cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 shadow-xl shadow-gold-950/20 flex items-center gap-2 transition-all active:scale-95 border border-gold-300/30 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <span>Registering Member & Creating Invoice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Complete Registration & Issue Invoice</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Invoice Modal on completion */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        invoice={completedInvoice}
        onClose={() => {
          setShowInvoiceModal(false);
          router.push('/customers');
        }}
      />
    </div>
  );
};
