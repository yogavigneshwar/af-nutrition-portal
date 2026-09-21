'use client';

import React, { useState } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle, Award, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface SeminarLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCustomerId?: string;
}

export const SeminarLoggerModal: React.FC<SeminarLoggerModalProps> = ({
  isOpen,
  onClose,
  preSelectedCustomerId,
}) => {
  const { customers, logSeminarAttendance } = useApp();
  const [selectedCustId, setSelectedCustId] = useState(preSelectedCustomerId || '');
  const [topic, setTopic] = useState('Metabolism, Fat Loss Blueprint & Daily Hydration');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (preSelectedCustomerId) {
      setSelectedCustId(preSelectedCustomerId);
    }
  }, [preSelectedCustomerId]);

  const seminarTopics = [
    'Metabolism, Fat Loss Blueprint & Daily Hydration',
    'Cellular Nutrition, Gut Health & Micro-nutrients',
    'Healthy Active Lifestyle: Cardio vs Resistance Training',
    'Junior Program (JP) Habit Building & Family Wellness',
    'Mindset, Sleep Quality & Stress Recovery Masterclass',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedCustId) {
      setErrorMsg('Please select a customer.');
      return;
    }

    const res = logSeminarAttendance(selectedCustId, topic, remarks);
    if (res) {
      setSuccessMsg(`Recorded seminar attendance for ${res.customerName}!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1400);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Wellness Seminar Attendance" subtitle="Log customer participation in educational workshops & webinars" maxWidth="md">
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

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Customer *
          </label>
          <select
            value={selectedCustId}
            onChange={(e) => setSelectedCustId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500/20"
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.phone}) - {c.seminarAttendanceCount} seminars attended
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Seminar Workshop Topic *
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs font-semibold text-slate-900 mb-2 bg-white"
          >
            {seminarTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Remarks / Participation Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Asked insightful questions regarding meal timings and hydration goals..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

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
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 shadow-md shadow-gold-950/20 flex items-center space-x-1.5 transition-all active:scale-95 border border-gold-300/30"
          >
            <Award className="w-4 h-4" />
            <span>Record Attendance</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
