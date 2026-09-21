'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, ShoppingBag, UtensilsCrossed, Users, 
  Coffee, CalendarCheck, AlertTriangle, ArrowRight, 
  Sparkles, Flame, Plus, Award, ChevronRight, Activity, Tv,
  CheckCircle2, Clock, ShieldCheck, TrendingUp, HeartHandshake, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatDate, formatTime } from '../lib/utils';
import { ShakeLoggerModal } from '../components/shakes/ShakeLoggerModal';
import { SeminarLoggerModal } from '../components/seminars/SeminarLoggerModal';
import { CustomerProfileModal } from '../components/customers/CustomerProfileModal';
import { InvoiceModal } from '../components/common/InvoiceModal';

export default function DashboardPage() {
  const router = useRouter();
  const { metrics, customers, orders, selectedBranch, currentUser, invoices, seminars } = useApp();

  const [showShakeModal, setShowShakeModal] = useState(false);
  const [showSeminarModal, setShowSeminarModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const expiringCount = customers.filter(c => c.remainingShakes <= 3 && c.remainingShakes > 0).length;
  const expiredCount = customers.filter(c => c.remainingShakes <= 0).length;
  const todaySeminarsCount = seminars.filter(s => s.date === todayStr).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Control Room Hero Header with Emerald Forest & Champagne Gold accents */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-brand-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-brand-950/20 relative overflow-hidden border border-brand-700/30">
        <div className="absolute -right-10 -top-10 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-64 h-64 rounded-full bg-brand-400/15 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gold-500/15 border border-gold-400/40 text-gold-300 text-xs font-black tracking-wide uppercase mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>AF Nutrition Operating System</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Welcome back, <span className="text-gold-300">{currentUser.name}</span>
            </h1>
            <p className="text-xs lg:text-sm text-brand-100/80 mt-1 max-w-xl font-medium">
              Real-time wellness operating command center for <strong className="text-white">{selectedBranch}</strong>. Live shake monitoring, customer plans, and kitchen tokens.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowShakeModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-900/30 flex items-center space-x-2 transition-all active:scale-95 border border-brand-400/30"
            >
              <Coffee className="w-4 h-4 text-gold-200" />
              <span>Log Daily Shake</span>
            </button>

            <Link
              href="/pos"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white font-bold text-xs shadow-lg shadow-gold-950/20 flex items-center space-x-2 transition-all active:scale-95 border border-gold-300/30"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>POS Terminal</span>
            </Link>

            <Link
              href="/customers/register"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-brand-300" />
              <span>Register Member</span>
            </Link>

            <button
              onClick={() => setShowSeminarModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-brand-800/80 hover:bg-brand-700 text-brand-100 font-bold text-xs border border-brand-600/50 flex items-center space-x-2 transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-gold-300" />
              <span>Seminar Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Notification */}
      {metrics.lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-gold-300/60 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gold-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-gold-600/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gold-950">
                Low Inventory Alert ({metrics.lowStockProducts.length} items below minimum threshold)
              </h4>
              <p className="text-[11px] text-gold-800 font-medium">
                {metrics.lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(' • ')}
              </p>
            </div>
          </div>
          <Link
            href="/catalog"
            className="px-3 py-1.5 rounded-xl bg-white border border-gold-300 text-gold-900 font-bold text-xs hover:bg-gold-50 shadow-sm shrink-0 flex items-center space-x-1"
          >
            <span>Restock Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(metrics.todayRevenue)}
          subtitle="Orders & plans settled today"
          icon={<DollarSign className="w-5 h-5" />}
          color="gold"
        />
        <StatCard
          title="Active Members"
          value={activeCount}
          subtitle={`${expiringCount} expiring soon`}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Shakes Served Today"
          value={metrics.todayShakesConsumed}
          subtitle="Real-time Barista log count"
          icon={<Coffee className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Live Kitchen Orders"
          value={metrics.pendingOrders}
          subtitle={`${metrics.readyOrders} ready on TV monitor`}
          icon={<UtensilsCrossed className="w-5 h-5" />}
          color="gold"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/associates" className="bg-white rounded-2xl p-4 border border-emerald-100/70 shadow-sm hover:border-gold-300 transition-all flex items-center space-x-3.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <div className="text-lg font-black text-brand-950">{metrics.associatesCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Associate Partners</div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100/70 shadow-sm hover:border-gold-300 transition-all flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center font-black">
            <CalendarCheck className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{todaySeminarsCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Seminars Attended Today</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100/70 shadow-sm hover:border-amber-300 transition-all flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-700">{expiringCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Expiring Soon (≤3 shakes)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100/70 shadow-sm hover:border-rose-300 transition-all flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-black">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-lg font-black text-rose-700">{expiredCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Expired (Reactivate)</div>
          </div>
        </div>
      </div>

      {/* Main Split Sections: Live Token Board & Expiring Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Orders & Token Monitor preview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Live Kitchen Token Queue</h3>
                <p className="text-[11px] text-slate-400 font-medium">Real-time barista prep status and customer pickup tokens</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/token-tv"
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-800 text-xs font-bold flex items-center space-x-1.5 transition-colors border border-emerald-200"
              >
                <Tv className="w-3.5 h-3.5 text-brand-600" />
                <span>Launch TV Display</span>
              </Link>
              <Link
                href="/orders"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <span>Full Kitchen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Preparing Column */}
            <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-200/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Preparing in Kitchen ({orders.filter(o => o.orderStatus === 'PREPARING' || o.orderStatus === 'PENDING').length})
                </span>
                <Badge variant="warning">In Progress</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {orders.filter(o => o.orderStatus === 'PREPARING' || o.orderStatus === 'PENDING').length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">All prep orders completed!</div>
                ) : (
                  orders.filter(o => o.orderStatus === 'PREPARING' || o.orderStatus === 'PENDING').map(o => (
                    <div key={o.id} className="bg-white rounded-xl p-2.5 border border-amber-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-1 rounded-lg bg-gold-600 text-white font-black text-xs">
                          #{o.tokenNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{o.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{formatTime(o.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ready for Pickup Column */}
            <div className="bg-emerald-50/50 rounded-2xl p-3.5 border border-emerald-200/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ready for Pickup ({orders.filter(o => o.orderStatus === 'READY').length})
                </span>
                <Badge variant="success">Calling Now</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {orders.filter(o => o.orderStatus === 'READY').length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">No tokens awaiting pickup.</div>
                ) : (
                  orders.filter(o => o.orderStatus === 'READY').map(o => (
                    <div key={o.id} className="bg-white rounded-xl p-2.5 border border-emerald-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-sm">
                          #{o.tokenNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{o.customerName}</div>
                          <div className="text-[10px] text-emerald-700 font-bold">Counter Pickup Ready</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{formatTime(o.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Renewal & Member Attention Panel */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-gold-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Renewal Alerts</h3>
              </div>
              <Link href="/customers/reactivate" className="text-xs font-bold text-gold-800 hover:text-gold-900">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {customers.filter(c => c.status === 'Pending Renewal' || c.remainingShakes <= 3).slice(0, 4).map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-gold-300 hover:bg-gold-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-black text-xs text-brand-800 flex items-center justify-center shadow-xs">
                      {c.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-brand-900">{c.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {c.programDuration} • {c.remainingShakes} shakes left
                      </div>
                    </div>
                  </div>
                  <Badge variant={c.remainingShakes <= 0 ? 'danger' : 'warning'}>
                    {c.remainingShakes <= 0 ? '0 Left' : `${c.remainingShakes} Left`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/customers/reactivate"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-gold-900/10 transition-all"
            >
              <span>Instant Member Renewal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Cashier Invoices & Activity Feed */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Recent POS Billing Invoices</h3>
              <p className="text-[11px] text-slate-400 font-medium">Live transaction feed with instant receipt printing</p>
            </div>
          </div>
          <Link
            href="/billing"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
          >
            <span>All Invoices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-brand-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{inv.customerName}</div>
                    <div className="text-[10px] text-slate-400">{inv.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={inv.type.includes('PROGRAM') ? 'gold' : 'brand'}>
                      {inv.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700">{inv.paymentMethod}</span>
                  </td>
                  <td className="py-3 px-3 font-black text-gold-900">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-medium">
                    {formatDate(inv.date)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowInvoiceModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] inline-flex items-center space-x-1 border border-emerald-200/70 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Print Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showShakeModal && (
        <ShakeLoggerModal isOpen={showShakeModal} onClose={() => setShowShakeModal(false)} />
      )}

      {showSeminarModal && (
        <SeminarLoggerModal isOpen={showSeminarModal} onClose={() => setShowSeminarModal(false)} />
      )}

      {activeCustomer && (
        <CustomerProfileModal
          customer={activeCustomer}
          isOpen={!!activeCustomer}
          onClose={() => setSelectedCustomerId(null)}
          onOpenShakeLogger={(id) => {
            setSelectedCustomerId(null);
            setShowShakeModal(true);
          }}
          onOpenSeminarLogger={() => {}}
        />
      )}

      {selectedInvoice && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}
