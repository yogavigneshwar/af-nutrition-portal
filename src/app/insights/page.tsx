'use client';

import React from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  Coffee, CalendarCheck, Package, Flame, Award, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';

export default function InsightsPage() {
  const { metrics, customers, orders, products, shakeLogs, seminars, invoices } = useApp();

  // Category sales breakdown
  const categorySales: { [cat: string]: number } = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      categorySales[item.category] = (categorySales[item.category] || 0) + item.subtotal;
    });
  });

  const categoryEntries = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);
  const totalCatRevenue = categoryEntries.reduce((acc, curr) => acc + curr[1], 0) || 1;

  // Customer Type breakdown
  const typeMap: { [t: string]: number } = {};
  customers.forEach(c => {
    typeMap[c.customerType] = (typeMap[c.customerType] || 0) + 1;
  });

  // Health goals breakdown
  const goalsMap: { [g: string]: number } = {};
  customers.forEach(c => {
    c.healthGoals?.forEach(g => {
      goalsMap[g] = (goalsMap[g] || 0) + 1;
    });
  });
  const topGoals = Object.entries(goalsMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gold-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Operational Insights & Growth Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Real-time business performance, customer cohort distribution, menu sales velocities, and nutritional engagement trends.
          </p>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime Collections"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Orders + Registration plans"
          icon={<DollarSign className="w-5 h-5" />}
          color="gold"
        />

        <StatCard
          title="Total Club Visits"
          value={`${shakeLogs.length} Visits`}
          subtitle={`${metrics.todayShakesConsumed} visits today`}
          icon={<Coffee className="w-5 h-5" />}
          color="emerald"
        />

        <StatCard
          title="Total Registered Base"
          value={`${customers.length} Members`}
          subtitle={`${metrics.associatesCount} Associate Partners`}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
        />

        <StatCard
          title="Educational Engagement"
          value={`${seminars.length} Attendances`}
          subtitle="Across all wellness workshops"
          icon={<CalendarCheck className="w-5 h-5" />}
          color="gold"
        />
      </div>

      {/* 2-Column Analytics Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POS Revenue by Category */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>POS Sales Volume by Menu Category</span>
          </h3>

          <div className="space-y-3 pt-2">
            {categoryEntries.map(([cat, amount]) => {
              const pct = Math.round((amount / totalCatRevenue) * 100);
              return (
                <div key={cat} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span className="font-bold text-slate-800">{cat}</span>
                    <span className="font-black text-gold-900">{formatCurrency(amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Classification Cohorts */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-600" />
            <span>Member Classification Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(typeMap).map(([type, count]) => {
              const pct = Math.round((count / (customers.length || 1)) * 100);
              return (
                <div key={type} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span className="font-bold text-slate-800">{type}</span>
                    <span className="font-black text-brand-900">{count} Members ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gold-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Health Objectives */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-gold-600" />
            <span>Top Member Health Goals & Objectives</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {topGoals.map(([goal, count], idx) => (
              <div key={goal} className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-gold-100 text-gold-900 font-black text-xs flex items-center justify-center border border-gold-300">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{goal}</span>
                </div>
                <span className="text-xs font-black text-emerald-700">{count} members</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Leaderboard */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-600" />
            <span>Top 5 Highest Revenue Menu Items</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            {metrics.bestSellers.map((item, idx) => (
              <div key={item.name} className="p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-gold-500 text-forest-950 font-black text-xs flex items-center justify-center shadow-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.count} units ordered</p>
                  </div>
                </div>
                <p className="font-black text-gold-900 text-sm">{formatCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
