'use client';

import React, { useState } from 'react';
import { Coffee, AlertTriangle, CheckCircle, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface ShakeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCustomerId?: string;
}

export const ShakeLoggerModal: React.FC<ShakeLoggerModalProps> = ({
  isOpen,
  onClose,
  preSelectedCustomerId,
}) => {
  const { customers, logDailyShakeIntake, products } = useApp();
  const [selectedCustId, setSelectedCustId] = useState(preSelectedCustomerId || '');
  const [shakeCount, setShakeCount] = useState(1);
  const [flavorCombo, setFlavorCombo] = useState('Mango Delight Protein Shake');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (preSelectedCustomerId) {
      setSelectedCustId(preSelectedCustomerId);
    }
  }, [preSelectedCustomerId]);

  const activeCustomer = customers.find(c => c.id === selectedCustId);
  const shakeFlavors = products.filter(p => p.category === 'Shakes' || p.category === 'Combos');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedCustId) {
      setErrorMsg('Please select a customer.');
      return;
    }

    if (!activeCustomer) {
      setErrorMsg('Customer record not found.');
      return;
    }

    if (activeCustomer.remainingShakes <= 0) {
      if (!confirm('Customer has 0 remaining shakes in current plan. Do you wish to override and record this intake?')) {
        return;
      }
    }

    const log = logDailyShakeIntake(selectedCustId, shakeCount, flavorCombo, notes);
    if (log) {
      setSuccessMsg(`Successfully logged ${shakeCount} shake(s) for ${activeCustomer.fullName}! Remaining: ${log.newBalance}`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1400);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Daily Shake Intake" subtitle="Record customer club visit and deduct from allocated plan" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Customer Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Customer *
          </label>
          <select
            value={selectedCustId}
            onChange={(e) => setSelectedCustId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            required
          >
            <option value="">-- Select Active Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.phone}) - {c.remainingShakes} shakes left [{c.customerType}]
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Customer Quota HUD */}
        {activeCustomer && (
          <div className="bg-gradient-to-br from-emerald-50/70 to-gold-50/50 rounded-2xl p-4 border border-emerald-200/70 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-slate-900">{activeCustomer.fullName}</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-forest-900 to-brand-800 text-gold-300 border border-brand-700/50">
                {activeCustomer.currentProgram}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="bg-white rounded-xl p-2.5 border border-emerald-100 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Allotted</p>
                <p className="text-base font-black text-slate-800">{activeCustomer.allottedShakes}</p>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-emerald-100 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Consumed</p>
                <p className="text-base font-black text-slate-800">{activeCustomer.consumedShakes}</p>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-emerald-100 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Remaining</p>
                <p className={`text-base font-black ${activeCustomer.remainingShakes > 3 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {activeCustomer.remainingShakes}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-600 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (activeCustomer.consumedShakes / (activeCustomer.allottedShakes || 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Flavor / Recipe Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Shake Flavour / Recipe *
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {['Mango Delight Protein Shake', 'Chocolate Kulfi Shake', 'Vanilla Protein Fusion', 'Royal Rose & Cardamom Shake'].map(f => (
              <button
                type="button"
                key={f}
                onClick={() => setFlavorCombo(f)}
                className={`p-2.5 rounded-xl text-xs text-left font-semibold border transition-all ${
                  flavorCombo === f
                    ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-black shadow-xs ring-1 ring-brand-500/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={flavorCombo}
            onChange={(e) => setFlavorCombo(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="">-- Or choose from full catalog list --</option>
            {shakeFlavors.map(s => (
              <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
            ))}
          </select>
        </div>

        {/* Shake Count & Notes */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantity
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setShakeCount(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    shakeCount === num
                      ? 'bg-forest-900 text-gold-300 border-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num} Shake{num > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Coach Notes / Adherence
            </label>
            <input
              type="text"
              placeholder="e.g. Adhering well, high energy today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200/80 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-md shadow-brand-900/20 flex items-center space-x-1.5 transition-all active:scale-95 border border-brand-400/30"
          >
            <Coffee className="w-4 h-4 text-gold-200" />
            <span>Confirm & Log Shake</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
