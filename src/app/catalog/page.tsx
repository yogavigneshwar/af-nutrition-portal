'use client';

import React, { useState } from 'react';
import { 
  Package, Plus, Search, AlertCircle, 
  Edit, CheckCircle, RefreshCw, Sparkles, Filter 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export default function CatalogPage() {
  const { products, updateProductStock, addProduct, updateProduct, metrics } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [stockReason, setStockReason] = useState<'Restock' | 'Damage/Waste' | 'Manual Audit'>('Restock');
  const [showStockModal, setShowStockModal] = useState(false);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    code: '',
    name: '',
    category: 'Shakes' as ProductCategory,
    description: '',
    price: 150,
    costPrice: 65,
    stock: 25,
    minStockAlert: 8,
    active: true,
    flavor: '',
  });

  const categories = ['All', 'Shakes', 'Combos', 'Energy Teas', 'Add-ons', 'Protein Snacks'];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleOpenStockModal = (product: Product) => {
    setSelectedProduct(product);
    setNewStockVal(product.stock);
    setShowStockModal(true);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    updateProductStock(selectedProduct.id, Number(newStockVal), stockReason);
    setShowStockModal(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.code) return;
    addProduct({
      code: newProd.code,
      name: newProd.name,
      category: newProd.category,
      description: newProd.description,
      price: Number(newProd.price),
      costPrice: Number(newProd.costPrice),
      stock: Number(newProd.stock),
      minStockAlert: Number(newProd.minStockAlert),
      active: newProd.active,
      flavor: newProd.flavor,
    });
    setShowAddModal(false);
    setNewProd({
      code: '',
      name: '',
      category: 'Shakes',
      description: '',
      price: 150,
      costPrice: 65,
      stock: 25,
      minStockAlert: 8,
      active: true,
      flavor: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Menu Catalog & Inventory Manager
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Configure shake formulas, combo packages, unit selling prices, and stock re-order alerts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black text-xs shadow-md shadow-brand-900/20 flex items-center space-x-1.5 transition-all shrink-0 active:scale-95 border border-brand-400/30"
        >
          <Plus className="w-4 h-4 text-gold-200" />
          <span>Add New Product / Recipe</span>
        </button>
      </div>

      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Catalog Items</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length} Products</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Active recipes and ingredients</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</p>
          <h3 className={`text-2xl font-black mt-1 ${metrics.lowStockProducts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {metrics.lowStockProducts.length} Items Low
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Below minimum threshold trigger</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inventory Value</p>
          <h3 className="text-2xl font-black text-gold-900 mt-1">
            {formatCurrency(products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0))}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Based on estimated cost price</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-100/80 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60" />
          <input
            type="text"
            placeholder="Search products by SKU code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-emerald-50/30 border border-emerald-200/70 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-900 text-gold-300 shadow-sm border border-brand-700/60'
                  : 'bg-emerald-50/50 text-slate-700 hover:bg-emerald-100/60 border border-emerald-100/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/40 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU / Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Cost Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isLow = p.stock <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-semibold">{p.code}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-gold-900">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-black text-sm ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                          {p.stock}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Low Stock (≤{p.minStockAlert})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenStockModal(p)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1 transition-colors border border-emerald-200/60"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Adjust Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Adjust Stock Level - ${selectedProduct?.name}`}
        subtitle={`Current Stock: ${selectedProduct?.stock} units`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Total Stock Units *
            </label>
            <input
              type="number"
              value={newStockVal === 0 ? '' : newStockVal}
              onChange={(e) => {
                const val = e.target.value;
                setNewStockVal(val === '' ? 0 : parseInt(val, 10) || 0);
              }}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Audit Reason *
            </label>
            <select
              value={stockReason}
              onChange={(e) => setStockReason(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 text-xs font-semibold text-slate-900 bg-white"
            >
              <option value="Restock">Fresh Restock / Purchase Inward</option>
              <option value="Damage/Waste">Spoilage / Spillage / Damage</option>
              <option value="Manual Audit">Physical Inventory Recount</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowStockModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black shadow-md shadow-brand-900/20 active:scale-95"
            >
              Save Stock Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Menu Item / Recipe"
        subtitle="Introduce a new shake, combo, or add-on to the POS catalog"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product SKU Code *
              </label>
              <input
                type="text"
                placeholder="e.g. SHK-BERRY"
                value={newProd.code}
                onChange={(e) => setNewProd({ ...newProd, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs font-semibold uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Wild Berry Antioxidant Shake"
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={newProd.category}
                onChange={(e) => setNewProd({ ...newProd, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs font-semibold bg-white"
              >
                <option value="Shakes">Shakes</option>
                <option value="Combos">Combos</option>
                <option value="Energy Teas">Energy Teas</option>
                <option value="Add-ons">Add-ons</option>
                <option value="Protein Snacks">Protein Snacks</option>
                <option value="Supplements">Supplements</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Flavor / Taste
              </label>
              <input
                type="text"
                placeholder="e.g. Mixed Berries"
                value={newProd.flavor}
                onChange={(e) => setNewProd({ ...newProd, flavor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (Rs.) *
              </label>
              <input
                type="number"
                value={newProd.price === 0 ? '' : newProd.price}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewProd({ ...newProd, price: val === '' ? 0 : parseInt(val, 10) || 0 });
                }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs font-bold"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cost Price (Rs.) *
              </label>
              <input
                type="number"
                value={newProd.costPrice === 0 ? '' : newProd.costPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewProd({ ...newProd, costPrice: val === '' ? 0 : parseInt(val, 10) || 0 });
                }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs font-bold"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                value={newProd.stock === 0 ? '' : newProd.stock}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewProd({ ...newProd, stock: val === '' ? 0 : parseInt(val, 10) || 0 });
                }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs"
                min={0}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Stock Alert Level
              </label>
              <input
                type="number"
                value={newProd.minStockAlert === 0 ? '' : newProd.minStockAlert}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewProd({ ...newProd, minStockAlert: val === '' ? 0 : parseInt(val, 10) || 0 });
                }}
                placeholder="5"
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs"
                min={0}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Nutritional Ingredients
              </label>
              <textarea
                rows={2}
                placeholder="e.g. High protein shake with blueberries, blackberries, chia and whey isolate..."
                value={newProd.description}
                onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white font-black shadow-md shadow-gold-950/20 active:scale-95 border border-gold-300/30"
            >
              Add Item to Catalog
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
