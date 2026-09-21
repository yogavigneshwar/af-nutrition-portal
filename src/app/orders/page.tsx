'use client';

import React from 'react';
import Link from 'next/link';
import { 
  UtensilsCrossed, Tv, Filter, Search, 
  Layers, CheckCircle2, Clock, Flame, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KitchenKanban } from '../../components/orders/KitchenKanban';

export default function OrdersPage() {
  const { metrics, selectedBranch } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Kitchen & Barista Fulfillment Pipeline</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300 font-bold">
                {selectedBranch}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Live order workflow: Pending Queue <span className="text-gold-600 font-bold">→</span> Preparing <span className="text-emerald-600 font-bold">→</span> Ready for Counter Pickup <span className="text-slate-400 font-bold">→</span> Dispatched.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/token-tv"
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-forest-900 to-brand-800 hover:from-forest-800 hover:to-brand-700 text-gold-300 font-bold text-xs shadow-md shadow-brand-950/20 flex items-center space-x-2 border border-brand-700/50 transition-all active:scale-95"
          >
            <Tv className="w-4 h-4 text-gold-400 animate-pulse" />
            <span>Launch TV Token Monitor</span>
          </Link>
        </div>
      </div>

      {/* Kitchen Kanban Board */}
      <KitchenKanban />
    </div>
  );
}
