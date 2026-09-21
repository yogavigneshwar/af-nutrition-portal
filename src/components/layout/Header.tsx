'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Tv, UserCheck, ChevronDown, 
  MapPin, Shield, Sparkles, RefreshCw, Crown, LogOut 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SEED_USERS } from '../../lib/seedData';

export const Header: React.FC = () => {
  const router = useRouter();
  const { 
    currentUser, 
    setCurrentUser, 
    selectedBranch, 
    setSelectedBranch, 
    customers, 
    orders, 
    metrics,
    resetToSeedData,
    logout
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const branches = [
    'Ayanavaram Main Branch',
    'Kilpauk Wellness Center',
    'Anna Nagar Prime Hub',
  ];

  // Global search filtering
  const matchingCustomers = searchQuery.trim().length >= 2 
    ? customers.filter(c => 
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone.includes(searchQuery) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchingOrders = searchQuery.trim().length >= 2
    ? orders.filter(o => 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.tokenNumber.toString().includes(searchQuery)
      ).slice(0, 3)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 px-4 lg:px-8 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Global Search */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
            <input
              type="text"
              placeholder="Search member, phone, order token, inviter..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-emerald-50/50 border border-emerald-200/80 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Search dropdown results */}
          {showSearchResults && searchQuery.trim().length >= 2 && (
            <div 
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 overflow-hidden"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              {matchingCustomers.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-500" />
                    <span>Members</span>
                  </p>
                  {matchingCustomers.map(cust => (
                    <div
                      key={cust.id}
                      onClick={() => {
                        router.push(`/customers?search=${cust.id}`);
                        setShowSearchResults(false);
                      }}
                      className="flex items-center justify-between p-2 hover:bg-emerald-50/70 rounded-lg cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{cust.fullName}</p>
                        <p className="text-[10px] text-slate-500">{cust.phone} • {cust.id} • {cust.remainingShakes} shakes left</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-300">
                        {cust.customerType}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {matchingOrders.length > 0 && (
                <div className="px-3 py-1 border-t border-emerald-100 mt-1 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Orders & Tokens</p>
                  {matchingOrders.map(ord => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        router.push(`/orders?search=${ord.id}`);
                        setShowSearchResults(false);
                      }}
                      className="flex items-center justify-between p-2 hover:bg-emerald-50/70 rounded-lg cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">Token #{ord.tokenNumber} ({ord.id})</p>
                        <p className="text-[10px] text-slate-500">{ord.customerName} • Rs. {ord.total}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                        {ord.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {matchingCustomers.length === 0 && matchingOrders.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No records found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: TV Link, Branch, Profile */}
        <div className="flex items-center space-x-3">
          {/* Token TV Monitor Button */}
          <Link
            href="/token-tv"
            target="_blank"
            className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gold-50 hover:bg-gold-100 text-gold-900 font-bold text-xs border border-gold-300/80 shadow-sm transition-all"
          >
            <Tv className="w-3.5 h-3.5 text-gold-600 animate-pulse" />
            <span>Token TV Monitor</span>
            {metrics.kitchenActive > 0 && (
              <span className="w-2 h-2 rounded-full bg-gold-600 ml-1"></span>
            )}
          </Link>

          {/* Branch Switcher */}
          <div className="relative hidden lg:block">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 p-1.5 pl-2 rounded-2xl hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-gold-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-700 capitalize font-semibold">{currentUser.role} • {currentUser.branch.split(' ')[0]}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Role Dropdown */}
            {showUserDropdown && (
              <div 
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 z-50"
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="p-2.5 border-b border-slate-100 mb-1 bg-emerald-50/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-gold-600" />
                    <span>Active Session</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Role: <span className="uppercase font-bold text-brand-700">{currentUser.role}</span></p>
                </div>
                
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Switch Active Role</p>
                {SEED_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentUser.id === u.id ? 'bg-brand-50 text-brand-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p>{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                    </div>
                    {currentUser.id === u.id && <Shield className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                      router.push('/login');
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs text-amber-800 hover:bg-amber-50 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lock / Sign Out Terminal</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset system data back to initial seed state?')) {
                        resetToSeedData();
                        setShowUserDropdown(false);
                      }
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Data to Default</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
