'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, UtensilsCrossed, 
  Users, UserPlus, UserCheck, Award, 
  Coffee, CalendarCheck, Package, Receipt, 
  BarChart3, UploadCloud, Tv, Flame, Sparkles, LogOut, LucideIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
  countColor?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { metrics, currentUser, logout } = useApp();

  const navSections: NavSection[] = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'POS Terminal', href: '/pos', icon: ShoppingBag, badge: 'Fast POS' },
        { 
          name: 'Orders & Kitchen', 
          href: '/orders', 
          icon: UtensilsCrossed, 
          count: metrics.kitchenActive > 0 ? metrics.kitchenActive : undefined,
          countColor: 'bg-gold-500 text-slate-950 font-black'
        },
        { name: 'Token TV Monitor', href: '/token-tv', icon: Tv, highlight: true },
      ]
    },
    {
      title: 'Customer Lifecycle',
      items: [
        { name: 'Customer Registry', href: '/customers', icon: Users, count: metrics.totalCustomers },
        { name: 'Customer Registration', href: '/customers/register', icon: UserPlus, badge: '5-Step' },
        { name: 'Associate Registry', href: '/associates', icon: Award, count: metrics.associatesCount, countColor: 'bg-gold-500 text-slate-950 font-black', badge: 'Partners' },
        { name: 'Existing Renewal', href: '/customers/reactivate', icon: UserCheck },
      ]
    },
    {
      title: 'Daily Tracking & Wellness',
      items: [
        { name: 'Daily Shake Intake', href: '/shakes', icon: Coffee, badge: 'Live Tracker' },
        { name: 'Wellness Seminars', href: '/seminars', icon: CalendarCheck },
      ]
    },
    {
      title: 'Inventory & Revenue',
      items: [
        { 
          name: 'Catalog & Stock', 
          href: '/catalog', 
          icon: Package,
          count: metrics.lowStockProducts.length > 0 ? metrics.lowStockProducts.length : undefined,
          countColor: 'bg-rose-500 text-white font-bold'
        },
        { name: 'Billing & Invoices', href: '/billing', icon: Receipt },
        { name: 'Insights & Analytics', href: '/insights', icon: BarChart3 },
        { name: 'Bulk CSV Import', href: '/bulk-upload', icon: UploadCloud },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-[#031d15] via-[#04241b] to-[#02130e] text-emerald-100 flex flex-col shrink-0 min-h-screen border-r border-emerald-900/60 select-none shadow-2xl">
      {/* Brand Header with Emerald & Gold Crest */}
      <div className="p-5 border-b border-emerald-900/50 flex items-center space-x-3 bg-forest-950/40">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-gold-400 flex items-center justify-center text-slate-950 font-black text-xl tracking-wider shadow-lg shadow-brand-500/20 ring-2 ring-gold-400/40">
          AF
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
            AF NUTRITION
            <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          </h1>
          <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-gold-400" />
            <span>Operating System</span>
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 px-3 mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-900/50 border border-brand-400/40'
                        : item.highlight
                        ? 'text-gold-300 hover:bg-gold-950/40 hover:text-gold-200 border border-gold-500/30'
                        : 'text-emerald-200/70 hover:bg-emerald-900/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-gold-300' : item.highlight ? 'text-gold-400' : 'text-emerald-400 group-hover:text-gold-300'
                      }`} />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-950 text-gold-400 border border-gold-500/20'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.countColor || (isActive ? 'bg-white/20 text-white' : 'bg-emerald-900 text-emerald-200')
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status & User Card */}
      <div className="p-3.5 border-t border-emerald-900/60 bg-[#02110c] text-xs space-y-3">
        <div>
          <div className="flex items-center justify-between text-emerald-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Flame className="w-3.5 h-3.5 text-gold-400" />
              <span>Club Intake Today</span>
            </span>
            <span className="text-[11px] font-bold text-gold-300">{metrics.todayShakesConsumed} shakes</span>
          </div>
          <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden border border-emerald-900/50">
            <div 
              className="bg-gradient-to-r from-brand-500 to-gold-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (metrics.todayShakesConsumed / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Current Operator & Lock Button */}
        <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-400/80 font-medium capitalize truncate">
              {currentUser.role} • {currentUser.branch.split(' ')[0]}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            title="Lock Terminal / Sign Out"
            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-rose-950/80 text-emerald-400 hover:text-rose-300 border border-emerald-800/40 hover:border-rose-700/50 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
