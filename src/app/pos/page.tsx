'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, ShoppingBag, Filter, Sparkles, 
  UtensilsCrossed, Coffee, Zap, Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, Product, Customer } from '../../types';
import { ProductCard } from '../../components/pos/ProductCard';
import { CartDrawer } from '../../components/pos/CartDrawer';

function PosContent() {
  const searchParams = useSearchParams();
  const preCustomerId = searchParams.get('customer');

  const { products, customers, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');

  // Handle URL param customer pre-selection
  useEffect(() => {
    if (preCustomerId) {
      const cust = customers.find(c => c.id === preCustomerId);
      if (cust) {
        setSelectedCustomer(cust);
        setIsWalkIn(false);
      }
    }
  }, [preCustomerId, customers]);

  const categories = ['All', 'Combos', 'Shakes', 'Energy Teas', 'Add-ons', 'Protein Snacks'];

  // Filter products by category and search term
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery && p.active;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Left Menu & Catalog Column */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4 overflow-hidden">
        {/* Top Filter Bar */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100/80 shadow-sm space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
              <input
                type="text"
                placeholder="Search premium shakes, combos, energy teas, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/40 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="text-xs font-bold text-slate-500 hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{filteredProducts.length} items available</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-forest-900 to-brand-800 text-gold-300 shadow-md shadow-brand-950/20 border border-brand-700/50'
                    : 'bg-emerald-50/50 text-slate-700 hover:bg-emerald-100/60 hover:text-brand-900 border border-emerald-100/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-emerald-100">
              <UtensilsCrossed className="w-10 h-10 text-emerald-200 mb-2" />
              <p className="text-xs font-bold text-slate-700">No products found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={(p) => addToCart(p, 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Cart & Checkout Drawer Column */}
      <div className="w-full xl:w-96 shrink-0 h-full">
        <CartDrawer
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          isWalkIn={isWalkIn}
          setIsWalkIn={setIsWalkIn}
          walkInName={walkInName}
          setWalkInName={setWalkInName}
        />
      </div>
    </div>
  );
}

export default function PosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading POS Terminal...</div>}>
      <PosContent />
    </Suspense>
  );
}
