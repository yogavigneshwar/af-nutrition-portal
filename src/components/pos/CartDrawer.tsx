'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, 
  User, CheckCircle, Sparkles, Tag, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, PaymentMethod, Invoice, CartItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { InvoiceModal } from '../common/InvoiceModal';

interface CartDrawerProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  isWalkIn: boolean;
  setIsWalkIn: (val: boolean) => void;
  walkInName: string;
  setWalkInName: (name: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  selectedCustomer,
  onSelectCustomer,
  isWalkIn,
  setIsWalkIn,
  walkInName,
  setWalkInName,
}) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    createOrder, 
    customers,
    invoices
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const isMember = !isWalkIn && !!selectedCustomer && selectedCustomer.id !== 'WALK-IN';

  // Helper: Get item unit price based on membership plan
  const getItemUnitPrice = (item: CartItem) => {
    // For registered active members, standard Shakes are covered under their membership plan ($0 chargeable at POS)
    if (isMember && item.product.category === 'Shakes') {
      return 0;
    }
    return item.product.price;
  };

  // Financial calculations - for members, only Add-on amounts are charged
  const subtotal = cart.reduce((acc, item) => acc + (getItemUnitPrice(item) * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (!isWalkIn && !selectedCustomer) {
      alert('Please select a registered customer or switch to Walk-in Guest.');
      return;
    }

    const order = createOrder({
      customerId: isWalkIn ? 'WALK-IN' : selectedCustomer!.id,
      customerName: isWalkIn ? (walkInName.trim() || 'Walk-in Guest') : selectedCustomer!.fullName,
      customerPhone: isWalkIn ? undefined : selectedCustomer!.phone,
      isWalkIn: isWalkIn,
      paymentMethod: paymentMethod,
      discount: discount,
      remarks: remarks,
    });

    // Build the exact invoice modal payload
    const invoicePayload: Invoice = {
      id: `INV-${order.id}`,
      invoiceNumber: `INV-${order.tokenNumber}`,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone || 'Walk-in',
      type: 'POS_ORDER',
      items: order.items.map(item => ({
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.subtotal,
      })),
      subtotal: order.subtotal,
      tax: 0,
      discount: order.discount,
      total: order.total,
      amountPaid: order.total,
      balanceDue: 0,
      paymentMethod: order.paymentMethod,
      paymentStatus: 'Paid',
      date: new Date().toISOString().split('T')[0],
      branch: order.branch,
      staffName: order.staffName,
      notes: order.remarks,
    };

    setCreatedInvoice(invoicePayload);
    setShowInvoice(true);
    setRemarks('');
    setDiscount(0);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100/90 shadow-xl flex flex-col h-full overflow-hidden">
      {/* Drawer Header with Green & Gold Gradient */}
      <div className="p-5 border-b border-emerald-900 bg-gradient-to-r from-[#031d15] via-[#042a20] to-[#02130e] text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-gold-400 flex items-center justify-center text-slate-950 shadow-md">
            <ShoppingBag className="w-4 h-4 font-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>POS Order Ticket</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-emerald-300/80">{cart.length} item{cart.length === 1 ? '' : 's'} in order</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-300 hover:text-rose-200 font-semibold p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear ticket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Customer Mode Switcher */}
      <div className="p-4 border-b border-emerald-100 bg-emerald-50/40 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
          <span>Customer Profile</span>
          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-xl border border-emerald-200 shadow-xs">
            <button
              onClick={() => setIsWalkIn(false)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                !isWalkIn ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Member
            </button>
            <button
              onClick={() => setIsWalkIn(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                isWalkIn ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Walk-in
            </button>
          </div>
        </div>

        {!isWalkIn ? (
          <div>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const c = customers.find(item => item.id === e.target.value) || null;
                onSelectCustomer(c);
              }}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Choose Active Member --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone}) - {c.remainingShakes} shakes left
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-2 p-2.5 bg-gradient-to-r from-emerald-50 to-gold-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950">{selectedCustomer.fullName}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">{selectedCustomer.currentProgram}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 block">
                    {selectedCustomer.remainingShakes} Shakes Left
                  </span>
                  <span className="text-[9px] text-gold-800 font-bold mt-0.5 block">Shakes: ₹0 Plan Quota</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Guest Name (Optional)"
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">Walk-in guests pay retail price for all items.</p>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[160px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-emerald-200" />
            <p className="text-xs font-bold text-slate-700">Ticket is empty</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Select menu items to build POS ticket.</p>
          </div>
        ) : (
          cart.map((item) => {
            const isCoveredShake = isMember && item.product.category === 'Shakes';
            const unitPrice = getItemUnitPrice(item);
            const itemTotal = unitPrice * item.quantity;

            return (
              <div
                key={item.product.id}
                className={`p-3 rounded-2xl border text-xs space-y-2 transition-colors ${
                  isCoveredShake 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-slate-50/80 border-emerald-100 hover:border-gold-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.product.name}</span>
                      {isCoveredShake && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Plan Quota
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] mt-0.5">
                      {isCoveredShake ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="line-through text-slate-400 font-normal">₹{item.product.price}</span>
                          <span>₹0 (Covered by Membership)</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">{formatCurrency(item.product.price)} each</span>
                      )}
                    </p>
                  </div>
                  <p className="font-black text-slate-900 text-right">
                    {isCoveredShake ? (
                      <span className="text-emerald-700 font-black">₹0</span>
                    ) : (
                      formatCurrency(itemTotal)
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-emerald-50 rounded-lg text-slate-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-black text-xs text-slate-900 w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-emerald-50 rounded-lg text-slate-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary & Checkout */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-emerald-100 bg-[#fcfdfd] space-y-3">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
              {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(pm => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-1.5 rounded-lg border transition-all ${
                    paymentMethod === pm
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Discount & Remarks input */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Discount (Rs.)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Remarks / Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Extra cold"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="space-y-1 text-xs pt-2 border-t border-emerald-100">
            <div className="flex justify-between text-slate-600">
              <span>Add-Ons Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-700 font-bold">
                <span>Discount:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-1.5">
              <span>Total Payable:</span>
              <span className="text-brand-700 text-base font-black">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            className="w-full py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-gold-300" />
            <span>Complete Order & Print Invoice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invoice Modal after checkout */}
      <InvoiceModal
        isOpen={showInvoice}
        invoice={createdInvoice}
        onClose={() => setShowInvoice(false)}
      />
    </div>
  );
};
