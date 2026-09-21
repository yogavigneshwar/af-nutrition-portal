'use client';

import React from 'react';
import { Plus, Coffee, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Shakes': return 'bg-brand-50 text-brand-800 border-brand-200';
      case 'Combos': return 'bg-gold-50 text-gold-900 border-gold-300';
      case 'Energy Teas': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Add-ons': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-emerald-100/90 shadow-sm hover:shadow-md hover:border-gold-300/80 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(product.category)}`}>
            {product.category}
          </span>

          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-gold-600" /> Only {product.stock} left
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700/60 bg-emerald-50/60 px-2 py-0.5 rounded-full border border-emerald-100">
                Stock: {product.stock}
              </span>
            )}
          </div>
        </div>

        {/* Product Title & Code */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
          {product.name}
        </h4>
        <p className="text-[10px] font-bold text-gold-700/80 mb-2">{product.code}</p>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* Nutrition Chips */}
        {product.nutritionInfo && (
          <div className="flex items-center gap-2 text-[10px] text-emerald-900 bg-emerald-50/70 p-2 rounded-xl mb-3 border border-emerald-100 font-semibold">
            <span>🔥 {product.nutritionInfo.calories} kcal</span>
            <span>•</span>
            <span className="text-brand-700 font-black">💪 {product.nutritionInfo.protein}g protein</span>
          </div>
        )}
      </div>

      {/* Bottom Pricing & Add Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-lg font-black text-slate-900">{formatCurrency(product.price)}</p>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30 active:scale-95'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
