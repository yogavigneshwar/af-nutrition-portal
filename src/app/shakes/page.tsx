'use client';

import React, { useState } from 'react';
import { 
  Coffee, Search, Plus, Filter, 
  Calendar, Flame, CheckCircle, Clock, Eye, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatTime } from '../../lib/utils';
import { ShakeLoggerModal } from '../../components/shakes/ShakeLoggerModal';
import { CustomerProfileModal } from '../../components/customers/CustomerProfileModal';

export default function ShakesPage() {
  const { shakeLogs, customers, metrics } = useApp();
  const [showLoggerModal, setShowLoggerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  const filteredLogs = shakeLogs.filter(log => 
    log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.flavorCombo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.customerPhone.includes(searchQuery) ||
    log.date.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-gold-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Daily Shake Intake & Barista Visit Tracker
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Log daily shake consumption, track flavors, monitor member balance depletion, and enforce quotas.
          </p>
        </div>

        <button
          onClick={() => setShowLoggerModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black text-xs shadow-md shadow-brand-900/20 flex items-center space-x-1.5 transition-all shrink-0 active:scale-95 border border-brand-400/30"
        >
          <Plus className="w-4 h-4 text-gold-200" />
          <span>Log Daily Shake Visit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Shakes Consumed</p>
          <h3 className="text-2xl font-black text-gold-900 mt-1">{metrics.todayShakesConsumed} Shakes</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Recorded at nutrition counter today</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Club Visits Logged</p>
          <h3 className="text-2xl font-black text-brand-700 mt-1">{shakeLogs.length} Total Visits</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Historical attendance entries</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Daily Volume</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {Math.round(shakeLogs.length / (customers.length || 1))} / member
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Overall club engagement velocity</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-100/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60" />
          <input
            type="text"
            placeholder="Search shake logs by member name, phone, flavor or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/30 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Flavor / Recipe</th>
                <th className="py-3.5 px-4 text-center">Shake Qty</th>
                <th className="py-3.5 px-4 text-center">Balance Change</th>
                <th className="py-3.5 px-4">Staff / Coach</th>
                <th className="py-3.5 px-4">Coach Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Coffee className="w-10 h-10 mx-auto mb-2 stroke-1 text-emerald-200" />
                    <p className="font-bold text-slate-700">No shake intake logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {formatDate(log.date)} at {formatTime(log.time)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedCustomerId(log.customerId)}
                        className="font-bold text-slate-900 hover:text-brand-700 transition-colors text-left"
                      >
                        {log.customerName}
                      </button>
                      <p className="text-[10px] text-slate-400">{log.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-900">
                      {log.flavorCombo}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-gold-900">
                      {log.shakeCount}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-slate-400">{log.previousBalance}</span>
                      <span className="mx-1 text-slate-300">→</span>
                      <span className="font-black text-emerald-700">{log.newBalance} left</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {log.staffName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-[200px] truncate">
                      {log.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(log.customerId)}
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
      <ShakeLoggerModal
        isOpen={showLoggerModal}
        onClose={() => setShowLoggerModal(false)}
      />

      <CustomerProfileModal
        customer={activeCustomer}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onOpenShakeLogger={(id) => {
          setSelectedCustomerId(null);
          setShowLoggerModal(true);
        }}
        onOpenSeminarLogger={() => {}}
      />
    </div>
  );
}
