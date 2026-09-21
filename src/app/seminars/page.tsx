'use client';

import React, { useState } from 'react';
import { 
  CalendarCheck, Plus, Search, Award, 
  BookOpen, Users, CheckCircle, Eye, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';
import { SeminarLoggerModal } from '../../components/seminars/SeminarLoggerModal';
import { CustomerProfileModal } from '../../components/customers/CustomerProfileModal';

export default function SeminarsPage() {
  const { seminars, customers } = useApp();
  const [showLoggerModal, setShowLoggerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  const filteredSeminars = seminars.filter(s =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customerPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-gold-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Wellness Seminar & Workshop Tracker
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Log and monitor member participation in nutrition education, metabolic health workshops, and mindset masterclasses.
          </p>
        </div>

        <button
          onClick={() => setShowLoggerModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white font-black text-xs shadow-md shadow-gold-950/20 flex items-center space-x-1.5 transition-all shrink-0 active:scale-95 border border-gold-300/30"
        >
          <Plus className="w-4 h-4" />
          <span>Record Seminar Attendance</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Seminar Attendances</p>
          <h3 className="text-2xl font-black text-gold-900 mt-1">{seminars.length} Attendances</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Total member entries logged</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Participating Members</p>
          <h3 className="text-2xl font-black text-brand-700 mt-1">
            {new Set(seminars.map(s => s.customerId)).size} Members
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Unique members engaged in education</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workshop Completion Rate</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">98.2%</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">High retention across educational sessions</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-100/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60" />
          <input
            type="text"
            placeholder="Search seminars by member name, phone, or workshop topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/30 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Seminar Table */}
      <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Seminar Date</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Topic / Workshop Subject</th>
                <th className="py-3.5 px-4">Conducting Coach</th>
                <th className="py-3.5 px-4">Participation Remarks</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSeminars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarCheck className="w-10 h-10 mx-auto mb-2 stroke-1 text-emerald-200" />
                    <p className="font-bold text-slate-700">No seminar records found</p>
                  </td>
                </tr>
              ) : (
                filteredSeminars.map(s => (
                  <tr key={s.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {formatDate(s.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedCustomerId(s.customerId)}
                        className="font-bold text-slate-900 hover:text-brand-700 transition-colors text-left"
                      >
                        {s.customerName}
                      </button>
                      <p className="text-[10px] text-slate-400">{s.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gold-950 max-w-[240px]">
                      {s.topic}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {s.staffName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-[200px] truncate">
                      {s.remarks || 'Active engagement during Q&A'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Attended
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(s.customerId)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SeminarLoggerModal
        isOpen={showLoggerModal}
        onClose={() => setShowLoggerModal(false)}
      />

      <CustomerProfileModal
        customer={activeCustomer}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onOpenShakeLogger={() => {}}
        onOpenSeminarLogger={() => {}}
      />
    </div>
  );
}
