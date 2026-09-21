'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Crown, 
  MapPin, 
  Tv, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Users, 
  Activity,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SEED_USERS } from '../../lib/seedData';

export default function LoginPage() {
  const router = useRouter();
  const { login, selectedBranch, setSelectedBranch } = useApp();

  const [email, setEmail] = useState('ananya@afnutrition.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [branch, setBranch] = useState(selectedBranch || 'Ayanavaram Main Branch');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branches = [
    'Ayanavaram Main Branch',
    'Kilpauk Wellness Center',
    'Anna Nagar Prime Hub',
  ];

  const handleRoleSelect = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('••••••••••••');
    setError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your operator email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        login(email, password, branch);
        setSelectedBranch(branch);
        router.push('/');
      } catch (err) {
        setError('Authentication failed. Please verify credentials.');
        setIsLoading(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#02110c] text-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Left Showcase Hero Panel */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#031d15] via-[#021811] to-[#010b07] border-b lg:border-b-0 lg:border-r border-emerald-900/60">
        {/* Background glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Crest & Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-600 to-emerald-950 p-0.5 shadow-xl shadow-brand-900/40">
              <div className="w-full h-full bg-[#031d15] rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                AF <span className="text-gold-400 font-serif italic font-normal">Nutrition</span>
              </span>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">
                Operating System • NBOS 2.0
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span>Enterprise Wellness & POS Suite</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Master your club <br />
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-100 to-gold-300 bg-clip-text text-transparent">
              with precision & speed.
            </span>
          </h1>

          <p className="text-emerald-200/70 text-sm max-w-lg leading-relaxed mb-8">
            All-in-one terminal for rapid POS checkout, automated shake consumption tracking, 5-tier customer lifecycles, and 4-stage kitchen order fulfillment.
          </p>

          {/* Operational Feature Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Live Barista</p>
                <p className="text-[10px] text-emerald-400/70">1-Click shake logging</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Kanban Orders</p>
                <p className="text-[10px] text-gold-400/70">4-Stage live routing</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Customer 360</p>
                <p className="text-[10px] text-purple-300/70">Full balance tracking</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Auto Pricing</p>
                <p className="text-[10px] text-blue-300/70">15/30/60 day formulas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Public TV Link */}
        <div className="relative z-10 pt-8 mt-8 border-t border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-300/60">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>AF Security Shield • 256-bit Encrypted</span>
          </div>
          <Link
            href="/token-tv"
            className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1.5 transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Launch TV Monitor</span>
          </Link>
        </div>
      </div>

      {/* Right Login Form Portal */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-[#010c08] relative">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-950/60 border border-gold-500/30 text-gold-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Lock className="w-3 h-3" />
              <span>Restricted Terminal Access</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Sign In to Terminal
            </h2>
            <p className="text-xs text-emerald-300/70">
              Select your role profile or enter credentials to open your session.
            </p>
          </div>

          {/* Quick 1-Click Role Presets */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-2.5">
              Quick Role Autofill (Testing & Demo)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEED_USERS.map((user) => {
                const isSelected = email === user.email;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleRoleSelect(user.email)}
                    className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-900/60 border-gold-500/60 text-white shadow-lg shadow-emerald-950'
                        : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold truncate">{user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-gold-400 border border-gold-500/20 w-fit">
                      {user.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <span>{error}</span>
              </div>
            )}

            {/* Branch Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1.5">
                Assigned Center / Branch
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b} value={b} className="bg-[#021811] text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1.5">
                Staff / Operator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@afnutrition.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs font-medium text-white placeholder:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400/90">
                  Password
                </label>
                <span className="text-[10px] text-gold-400/80 hover:underline cursor-pointer">
                  Default: demo pass
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs font-medium text-white placeholder:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-emerald-950 border-emerald-700 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-emerald-300/80">Remember this terminal session</span>
              </label>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 hover:from-brand-500 hover:to-gold-400 text-white font-bold text-sm shadow-lg shadow-brand-950 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Terminal...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-8 pt-6 border-t border-emerald-900/40 text-center">
            <p className="text-[11px] text-emerald-400/60">
              AF Nutrition Center • All Rights Reserved • v2.4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
