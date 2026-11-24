'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, CalendarCheck, ChevronLeft, ChevronRight, Search, Filter, 
  Coffee, DollarSign, Users, ShoppingBag, ArrowRight, Printer, Sparkles, 
  CheckCircle2, Clock, Receipt, UserCheck, Flame, PieChart, BarChart2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatTime } from '../../lib/utils';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { CustomerProfileModal } from '../../components/customers/CustomerProfileModal';
import { Invoice, Customer } from '../../types';

export default function DailyKpiPage() {
  const { shakeLogs, invoices, orders, customers } = useApp();

  // Current Local Date as default
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Member' | 'WalkIn'>('All');

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<'standard' | 'thermal'>('standard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Quick Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  // Formatted date string (e.g. "Tuesday, 24 Nov 2026")
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Filter Invoices for Selected Date
  const dateInvoices = useMemo(() => {
    return invoices.filter(inv => inv.date === selectedDate);
  }, [invoices, selectedDate]);

  // Filter Orders for Selected Date
  const dateOrders = useMemo(() => {
    return orders.filter(o => o.createdAt && o.createdAt.startsWith(selectedDate));
  }, [orders, selectedDate]);

  // Filter Shake Logs for Selected Date
  const dateShakeLogs = useMemo(() => {
    return shakeLogs.filter(s => s.date === selectedDate);
  }, [shakeLogs, selectedDate]);

  // 1. COMBINED "WHO DRANK WHAT" ACTIVITY LOG
  // Gathers data from shakeLogs + POS order line items for walk-in drinks
  const whoDrankWhat = useMemo(() => {
    type DrinkEntry = {
      id: string;
      time: string;
      customerName: string;
      customerPhone: string;
      customerId: string;
      isWalkIn: boolean;
      customerType: string;
      drinkName: string;
      quantity: number;
      source: 'Plan Quota (₹0)' | 'POS Counter Paid' | 'Daily Intake Log';
      tokenOrBill: string;
      amount: number;
      staffName?: string;
    };

    const entries: DrinkEntry[] = [];

    // From Shake Logs
    dateShakeLogs.forEach(log => {
      const cust = customers.find(c => c.id === log.customerId);
      const isWalkIn = log.customerId === 'WALK-IN' || log.customerId.startsWith('WALK');
      
      entries.push({
        id: log.id,
        time: log.time || '10:00',
        customerName: log.customerName,
        customerPhone: log.customerPhone || '',
        customerId: log.customerId,
        isWalkIn,
        customerType: cust?.customerType || (isWalkIn ? 'Walk-in' : 'Member'),
        drinkName: log.flavorCombo,
        quantity: log.shakeCount,
        source: 'Plan Quota (₹0)',
        tokenOrBill: log.notes?.includes('#') ? log.notes.split('#')[1].split(' ')[0] : 'Quota Log',
        amount: 0,
        staffName: log.staffName,
      });
    });

    // From POS Orders & Invoices (especially for Walk-in drinks & extra drinks)
    dateInvoices.forEach(inv => {
      const isWalkIn = inv.customerId === 'WALK-IN' || !customers.some(c => c.id === inv.customerId);

      inv.items.forEach((item, idx) => {
        const isDrink = item.description.toLowerCase().includes('shake') ||
                        item.description.toLowerCase().includes('tea') ||
                        item.description.toLowerCase().includes('combo') ||
                        item.description.toLowerCase().includes('shot');

        if (isDrink) {
          // Check if this drink was already recorded via shake log for this token/order
          const isQuota = item.unitPrice === 0 || item.total === 0;
          if (!isQuota || isWalkIn) {
            entries.push({
              id: `${inv.id}-${idx}`,
              time: 'Counter Order',
              customerName: item.assignedPersonName || inv.customerName,
              customerPhone: inv.customerPhone || '',
              customerId: inv.customerId,
              isWalkIn,
              customerType: isWalkIn ? 'Walk-in' : (customers.find(c => c.id === inv.customerId)?.customerType || 'Member'),
              drinkName: item.description,
              quantity: item.quantity,
              source: 'POS Counter Paid',
              tokenOrBill: inv.invoiceNumber,
              amount: item.total,
              staffName: inv.staffName,
            });
          }
        }
      });
    });

    return entries;
  }, [dateShakeLogs, dateInvoices, customers]);

  // 2. DAILY KPI FINANCIAL METRICS
  const totalRevenue = useMemo(() => {
    return dateInvoices.reduce((acc, inv) => acc + (inv.amountPaid !== undefined ? inv.amountPaid : inv.total), 0);
  }, [dateInvoices]);

  const totalBilledValue = useMemo(() => {
    return dateInvoices.reduce((acc, inv) => acc + inv.total, 0);
  }, [dateInvoices]);

  const totalBalanceDueOnDate = useMemo(() => {
    return dateInvoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
  }, [dateInvoices]);

  // Shakes breakdown
  const totalDrinksCount = useMemo(() => {
    return whoDrankWhat.reduce((acc, item) => acc + item.quantity, 0);
  }, [whoDrankWhat]);

  const walkInDrinks = useMemo(() => {
    return whoDrankWhat.filter(w => w.isWalkIn);
  }, [whoDrankWhat]);

  const walkInDrinksCount = useMemo(() => {
    return walkInDrinks.reduce((acc, w) => acc + w.quantity, 0);
  }, [walkInDrinks]);

  const memberDrinksCount = useMemo(() => {
    return totalDrinksCount - walkInDrinksCount;
  }, [totalDrinksCount, walkInDrinksCount]);

  const distinctPeopleCount = useMemo(() => {
    const names = new Set(whoDrankWhat.map(w => w.customerName.toLowerCase().trim()));
    return names.size;
  }, [whoDrankWhat]);

  const distinctWalkInsCount = useMemo(() => {
    const names = new Set(walkInDrinks.map(w => w.customerName.toLowerCase().trim()));
    return names.size;
  }, [walkInDrinks]);

  // Flavor Popularity Counts
  const flavorStats = useMemo(() => {
    const counts: Record<string, number> = {};
    whoDrankWhat.forEach(w => {
      counts[w.drinkName] = (counts[w.drinkName] || 0) + w.quantity;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [whoDrankWhat]);

  // Filtered "Who Drank What" list
  const filteredWhoDrankWhat = useMemo(() => {
    return whoDrankWhat.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        item.customerName.toLowerCase().includes(q) ||
        item.drinkName.toLowerCase().includes(q) ||
        item.customerPhone.includes(q) ||
        item.tokenOrBill.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (typeFilter === 'Member') return !item.isWalkIn;
      if (typeFilter === 'WalkIn') return item.isWalkIn;

      return true;
    });
  }, [whoDrankWhat, searchQuery, typeFilter]);

  // Open invoice in standard or thermal
  const handleOpenInvoice = (inv: Invoice, mode: 'standard' | 'thermal') => {
    setSelectedInvoice(inv);
    setInvoiceMode(mode);
    setShowInvoiceModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Calendar Date Picker Toolbar */}
      <div className="bg-gradient-to-r from-[#031d15] via-[#052b20] to-[#031d15] rounded-3xl p-6 text-white border border-emerald-800/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-400/30 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-gold-400" /> Executive Daily Log
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
                Live Sales & Consumption Analytics
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Daily KPI & Shake Intake Tracker
            </h1>
            <p className="text-xs md:text-sm text-emerald-200/80 mt-1 max-w-2xl font-medium">
              Select any date from the calendar to inspect complete revenue generated, who drank what drinks, and walk-in guest vs plan member breakdowns.
            </p>
          </div>

          {/* Calendar Picker Controls */}
          <div className="flex items-center space-x-2 bg-emerald-950/70 p-2 rounded-2xl border border-emerald-800/60 shadow-inner">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 px-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-black text-white outline-none cursor-pointer border-b border-gold-400/50 pb-0.5 focus:border-gold-300"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-gold-500 hover:bg-gold-400 text-slate-950 transition-all cursor-pointer shadow-sm ml-1"
            >
              Today
            </button>
          </div>
        </div>

        {/* Selected Date Title Banner */}
        <div className="mt-6 pt-4 border-t border-emerald-900/60 flex items-center justify-between">
          <p className="text-sm md:text-base font-black text-gold-400 flex items-center gap-2">
            <span>Showing KPI Report for:</span>
            <span className="text-white underline decoration-gold-400 underline-offset-4">{formattedSelectedDate}</span>
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden md:inline-flex items-center px-3.5 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-xs font-bold text-emerald-200 border border-emerald-700/60 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Daily Closing
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards for Selected Day */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales Collected</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalRevenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Billed: {formatCurrency(totalBilledValue)}</p>
        </div>

        {/* Total Drinks Consumed */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-gold-100 text-amber-900 flex items-center justify-center font-bold mb-2">
            <Coffee className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Drinks Served</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totalDrinksCount} Drinks</h3>
          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{distinctPeopleCount} Unique Patrons</p>
        </div>

        {/* Walk-in Drinks */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Walk-In Drinks</p>
          <h3 className="text-2xl font-black text-purple-950 mt-1">{walkInDrinksCount} Drinks</h3>
          <p className="text-[10px] text-purple-700 font-bold mt-0.5">{distinctWalkInsCount} Walk-in Guests</p>
        </div>

        {/* Member Plan Quota Drinks */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold mb-2">
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Member Quota Drinks</p>
          <h3 className="text-2xl font-black text-blue-950 mt-1">{memberDrinksCount} Shakes</h3>
          <p className="text-[10px] text-blue-700 font-bold mt-0.5">Plan Quota (₹0)</p>
        </div>

        {/* Total Bills / Tokens */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 col-span-2 md:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-2">
            <Receipt className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bills & Tokens</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{dateInvoices.length} Bills</h3>
          <p className="text-[10px] text-rose-600 font-bold mt-0.5">
            {totalBalanceDueOnDate > 0 ? `Bal Due: ${formatCurrency(totalBalanceDueOnDate)}` : 'Zero Due'}
          </p>
        </div>
      </div>

      {/* Flavor Leaderboard & Walk-in Ratio Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Walk-in vs Member Quota Ratio */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-brand-600" /> Walk-In vs Member Ratio
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Registered Members</span>
                <span className="text-brand-700">{memberDrinksCount} drinks ({totalDrinksCount > 0 ? Math.round((memberDrinksCount / totalDrinksCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-brand-600 h-full rounded-full"
                  style={{ width: `${totalDrinksCount > 0 ? (memberDrinksCount / totalDrinksCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Walk-In Guests</span>
                <span className="text-purple-700">{walkInDrinksCount} drinks ({totalDrinksCount > 0 ? Math.round((walkInDrinksCount / totalDrinksCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${totalDrinksCount > 0 ? (walkInDrinksCount / totalDrinksCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Flavors of the Day */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 md:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" /> Most Popular Drinks on {formatDate(selectedDate)}
          </h3>
          {flavorStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No drink sales recorded on this date.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {flavorStats.slice(0, 3).map(([flavor, count], idx) => (
                <div key={flavor} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-black text-gold-600 uppercase">Rank #{idx + 1}</p>
                    <p className="text-xs font-black text-slate-900 truncate">{flavor}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-gold-400 text-slate-950 shrink-0 shadow-xs">
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: WHO DRANK WHAT TABLE (YAR YAR ENNA KUDICHAANGA) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Header & Search Filter */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-brand-600" />
              Who Drank What — Detailed Consumption Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual patrons, drinks ordered, quantities, and quota/billing sources for {formatDate(selectedDate)}.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, drink, phone..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 outline-none w-48"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTypeFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'All' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({whoDrankWhat.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('Member')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'Member' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Members ({whoDrankWhat.length - walkInDrinks.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('WalkIn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'WalkIn' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Walk-ins ({walkInDrinks.length})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Patron Name & Type</th>
                <th className="py-3.5 px-4">Drink / Flavor Consumed</th>
                <th className="py-3.5 px-4 text-center">Quantity</th>
                <th className="py-3.5 px-4">Billing / Quota Source</th>
                <th className="py-3.5 px-4">Time / Ref</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWhoDrankWhat.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Coffee className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="font-bold text-slate-600">No drinks logged for this date</p>
                    <p className="text-xs text-slate-400">Try selecting another date from the calendar toolbar above.</p>
                  </td>
                </tr>
              ) : (
                filteredWhoDrankWhat.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          entry.isWalkIn 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : entry.customerType === 'JP Member'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {entry.isWalkIn ? 'Walk-in' : entry.customerType}
                        </span>
                        <div>
                          <p 
                            className={`font-black text-slate-900 text-sm ${!entry.isWalkIn && entry.customerId ? 'hover:text-brand-700 cursor-pointer' : ''}`}
                            onClick={() => {
                              if (!entry.isWalkIn && entry.customerId) {
                                const c = customers.find(cust => cust.id === entry.customerId);
                                if (c) setSelectedCustomer(c);
                              }
                            }}
                          >
                            {entry.customerName}
                          </p>
                          {entry.customerPhone && (
                            <p className="text-[11px] text-slate-500 font-mono">{entry.customerPhone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Drink / Flavor */}
                    <td className="py-3 px-4">
                      <p className="font-black text-slate-900">{entry.drinkName}</p>
                      <p className="text-[10px] text-slate-500">Fresh Nutritional Blend</p>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                        {entry.quantity} {entry.quantity > 1 ? 'drinks' : 'drink'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        entry.source.includes('₹0') 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-gold-50 text-amber-900 border border-gold-300'
                      }`}>
                        {entry.source}
                      </span>
                    </td>

                    {/* Time / Ref */}
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs text-slate-700 font-bold">{entry.time}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{entry.tokenOrBill}</p>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      {entry.amount > 0 ? (
                        <span className="font-black text-slate-900 text-sm">{formatCurrency(entry.amount)}</span>
                      ) : (
                        <span className="font-black text-emerald-700 text-xs">Plan Quota (₹0)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: DAILY SALES & INVOICES ISSUED */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              All Bills & Invoices Generated on {formatDate(selectedDate)}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transactions, items ordered, payment modes, and balance status.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
            {dateInvoices.length} Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer Name & Phone</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Billed Amount</th>
                <th className="py-3.5 px-4">Paid & Balance</th>
                <th className="py-3.5 px-4 text-right">Print Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="font-bold text-slate-600">No invoices recorded on this date</p>
                  </td>
                </tr>
              ) : (
                dateInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-black text-slate-900">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{inv.customerPhone || 'Walk-in'}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-800 font-medium">
                        {inv.items.map(it => `${it.quantity}x ${it.description}`).join(', ')}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-emerald-700">
                        Paid: {formatCurrency(inv.amountPaid !== undefined ? inv.amountPaid : inv.total)}
                      </p>
                      {inv.balanceDue > 0 ? (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Due: {formatCurrency(inv.balanceDue)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Zero Due</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(inv, 'standard')}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Print Standard A4 Invoice"
                        >
                          Invoice
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(inv, 'thermal')}
                          className="px-2.5 py-1 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-amber-950 font-bold text-[11px] border border-gold-400/40 transition-colors cursor-pointer"
                          title="Print 80mm Thermal Paper Slip"
                        >
                          Thermal Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal for Standard & Thermal Print */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          invoice={selectedInvoice}
          initialMode={invoiceMode}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {/* Customer 360 Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onOpenShakeLogger={() => {}}
        />
      )}
    </div>
  );
}
