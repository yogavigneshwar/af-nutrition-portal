'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tv, Clock, CheckCircle, Flame, 
  Volume2, VolumeX, ArrowLeft, Coffee, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TokenTvPage() {
  const { orders, selectedBranch } = useApp();
  const [currentTime, setCurrentTime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const preparingOrders = orders.filter(o => o.orderStatus === 'PREPARING' || o.orderStatus === 'PENDING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');

  return (
    <div className="fixed inset-0 z-50 bg-[#021811] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Top TV Monitor Broadcast Bar */}
      <div className="bg-[#04241b] border-b border-brand-800/40 px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-forest-900/90 hover:bg-forest-800 text-gold-300 hover:text-white border border-brand-700/50 transition-colors"
            title="Exit Fullscreen TV"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-300 flex items-center justify-center font-black text-xl text-forest-950 shadow-lg shadow-gold-500/20 border border-gold-300">
              AF
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                AF NUTRITION CENTER
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-sm shadow-emerald-400"></span>
              </h1>
              <p className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>Live Barista Calling Display</span>
                <span>•</span>
                <span className="text-white">{selectedBranch}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Controls */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-all ${
              soundEnabled
                ? 'bg-emerald-900/60 border-emerald-400/50 text-emerald-300 shadow-sm'
                : 'bg-forest-900 border-brand-700/60 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <div className="bg-forest-900/90 px-5 py-2 rounded-2xl border border-brand-700/60 text-right shadow-inner">
            <p className="text-[10px] uppercase font-bold text-gold-400/80 tracking-wider">Live Time</p>
            <p className="text-xl font-black text-white font-mono">{currentTime}</p>
          </div>
        </div>
      </div>

      {/* Main TV Split View Canvas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 overflow-hidden">
        {/* Left Column: PREPARING NOW */}
        <div className="bg-[#031f17]/90 rounded-3xl border border-gold-500/30 p-6 flex flex-col overflow-hidden relative shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-800/60">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gold-500/20 border border-gold-400/50 flex items-center justify-center text-gold-400 shadow-sm">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gold-300 uppercase tracking-wider">Now Preparing</h2>
                <p className="text-xs text-brand-200/70 font-medium">In the blender / nutrition bar</p>
              </div>
            </div>
            <span className="text-sm font-black px-4 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/40 shadow-inner">
              {preparingOrders.length} In Queue
            </span>
          </div>

          {/* Tokens Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Coffee className="w-16 h-16 stroke-1 mb-3 text-brand-700" />
                <p className="text-base font-bold text-brand-200">No shakes currently in blender</p>
                <p className="text-xs text-brand-400/70">All orders prepared!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-[#04281f] rounded-2xl p-5 border border-gold-500/30 shadow-lg text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200 hover:border-gold-400 transition-all"
                  >
                    <span className="text-3xl sm:text-4xl font-black text-gold-400 tracking-tight font-mono">
                      #{order.tokenNumber}
                    </span>
                    <p className="text-xs font-bold text-white mt-2 truncate w-full">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-brand-200/70 mt-0.5 font-medium">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: READY FOR PICKUP */}
        <div className="bg-[#031f17]/90 rounded-3xl border border-emerald-400/50 p-6 flex flex-col overflow-hidden relative shadow-2xl shadow-emerald-950/40">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-800/60">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-sm">
                <CheckCircle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black text-emerald-300 uppercase tracking-wider">Ready for Pickup</h2>
                <p className="text-xs text-brand-200/70 font-medium">Please collect your shake from counter</p>
              </div>
            </div>
            <span className="text-sm font-black px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-inner">
              {readyOrders.length} Ready
            </span>
          </div>

          {/* Ready Tokens Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Sparkles className="w-16 h-16 stroke-1 mb-3 text-brand-700" />
                <p className="text-base font-bold text-brand-200">Waiting for next shake batch...</p>
                <p className="text-xs text-brand-400/70">Fresh nutrition being served.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {readyOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-gradient-to-b from-brand-900/90 to-[#021c14] rounded-2xl p-5 border-2 border-emerald-400 shadow-xl shadow-emerald-950/50 text-center flex flex-col items-center justify-center animate-pulse"
                  >
                    <span className="text-4xl sm:text-5xl font-black text-emerald-300 tracking-tight font-mono">
                      #{order.tokenNumber}
                    </span>
                    <p className="text-sm font-black text-white mt-2 truncate w-full">
                      {order.customerName}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-forest-950 mt-1.5 shadow-sm">
                      Ready at Counter
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TV Footer Running Ticker */}
      <div className="bg-[#04241b] border-t border-brand-800/50 px-8 py-3.5 flex items-center justify-between text-xs text-brand-200/80">
        <p className="font-semibold text-brand-100 flex items-center gap-2">
          <span>🌱</span>
          <span>Tip of the Day: Consistent daily nutrition and cellular hydration boost your daily energy and wellness!</span>
        </p>
        <p className="text-gold-300 font-black tracking-wide">
          AF Nutrition Center • Healthy Active Lifestyle
        </p>
      </div>
    </div>
  );
}
