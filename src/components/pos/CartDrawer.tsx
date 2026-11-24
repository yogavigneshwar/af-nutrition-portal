'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, 
  User, CheckCircle, Sparkles, Tag, ArrowRight, ShieldCheck,
  UserPlus, Users, X, Coffee
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Invoice, CartItem, BillPerson } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { InvoiceModal } from '../common/InvoiceModal';

interface CartDrawerProps {
  billPersons: BillPerson[];
  setBillPersons: React.Dispatch<React.SetStateAction<BillPerson[]>>;
  activePersonId: string;
  setActivePersonId: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  billPersons,
  setBillPersons,
  activePersonId,
  setActivePersonId,
}) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    createOrder, 
    customers 
  } = useApp();

  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Helper: Get item unit price based on whether assigned person is a registered member
  const getItemUnitPrice = (item: CartItem) => {
    // Standard Shakes are covered under membership plan ($0 chargeable at POS)
    if (item.isMember && item.product.category === 'Shakes') {
      return 0;
    }
    return item.product.price;
  };

  // Financial calculations - only Add-ons and Retail items are charged
  const subtotal = cart.reduce((acc, item) => acc + (getItemUnitPrice(item) * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  // Active person reference
  const activePerson = billPersons.find(p => p.id === activePersonId) || billPersons[0];

  // Add another person to this bill
  const handleAddPerson = () => {
    const newId = `p-${Date.now()}`;
    const newNum = billPersons.length + 1;
    setBillPersons(prev => [
      ...prev,
      { id: newId, name: `Member ${newNum}`, isMember: false }
    ]);
    setActivePersonId(newId);
  };

  // Remove a person from bill
  const handleRemovePerson = (personId: string) => {
    if (billPersons.length <= 1) return;
    setBillPersons(prev => prev.filter(p => p.id !== personId));
    if (activePersonId === personId) {
      const remaining = billPersons.filter(p => p.id !== personId);
      setActivePersonId(remaining[0].id);
    }
  };

  // Update a person's configuration (Member vs Walk-in)
  const handleUpdatePerson = (personId: string, updates: Partial<BillPerson>) => {
    setBillPersons(prev => prev.map(p => p.id === personId ? { ...p, ...updates } : p));
  };

  // Checkout Handler: Generates a SINGLE bill for all members
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Combined names for the single bill
    const uniqueNames = Array.from(new Set(billPersons.map(p => p.name.trim()))).filter(Boolean);
    const combinedCustomerName = uniqueNames.join(', ') || 'Group Order';

    // Primary customer ID (first registered member if any, or WALK-IN)
    const primaryMember = billPersons.find(p => p.isMember && p.customerId);
    const primaryCustomerId = primaryMember?.customerId || 'WALK-IN';
    const primaryPhone = primaryMember?.phone || undefined;
    const isAllWalkIn = !billPersons.some(p => p.isMember);

    // If total > 0 (add-ons/retail), status is 'Pending' ("Need to Pay")
    // If total === 0 (all shakes covered by member quotas), status is 'Paid'
    const orderPaymentStatus = total > 0 ? 'Pending' : 'Paid';

    const order = createOrder({
      customerId: primaryCustomerId,
      customerName: combinedCustomerName,
      customerPhone: primaryPhone,
      isWalkIn: isAllWalkIn,
      paymentStatus: orderPaymentStatus,
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
      customerPhone: order.customerPhone || 'Walk-in Group',
      type: 'POS_ORDER',
      items: order.items.map(item => ({
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.subtotal,
        assignedPersonName: item.assignedPersonName,
      })),
      subtotal: order.subtotal,
      tax: 0,
      discount: order.discount,
      total: order.total,
      amountPaid: orderPaymentStatus === 'Paid' ? order.total : 0,
      balanceDue: orderPaymentStatus === 'Paid' ? 0 : order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: orderPaymentStatus,
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
      {/* Drawer Header */}
      <div className="p-4 border-b border-emerald-900 bg-gradient-to-r from-[#031d15] via-[#042a20] to-[#02130e] text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-gold-400 flex items-center justify-center text-slate-950 shadow-md">
            <ShoppingBag className="w-4 h-4 font-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Single Bill POS Ticket</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-emerald-300/80">
              {cart.length} item{cart.length === 1 ? '' : 's'} • {billPersons.length} member{billPersons.length === 1 ? '' : 's'} on bill
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-300 hover:text-rose-200 font-semibold p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Clear ticket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Multi-Member / Person Manager Section */}
      <div className="p-3.5 border-b border-emerald-100 bg-emerald-50/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-brand-700" />
            <span>Members on this Single Bill</span>
          </span>
          <button
            type="button"
            onClick={handleAddPerson}
            className="text-[10px] font-bold text-gold-900 bg-gold-100 hover:bg-gold-200 border border-gold-300/80 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3 text-gold-700" />
            <span>Add Member / Person</span>
          </button>
        </div>

        {/* Member Pills Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {billPersons.map((p, idx) => {
            const isActive = p.id === activePersonId;
            return (
              <div
                key={p.id}
                onClick={() => setActivePersonId(p.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-forest-900 to-brand-800 text-gold-300 border-brand-700 shadow-xs ring-1 ring-gold-400/40'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-gold-400/20 text-gold-300 flex items-center justify-center text-[10px] font-black">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[110px]">{p.name || `Person ${idx + 1}`}</span>
                {billPersons.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePerson(p.id);
                    }}
                    className="text-slate-400 hover:text-rose-500 ml-0.5"
                    title="Remove person from bill"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Person Config Card */}
        <div className="p-2.5 rounded-2xl bg-white border border-emerald-200/80 text-xs space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Person {billPersons.findIndex(p => p.id === activePerson.id) + 1} Profile:
            </span>
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleUpdatePerson(activePerson.id, { isMember: true })}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  activePerson.isMember ? 'bg-brand-600 text-white' : 'text-slate-600'
                }`}
              >
                Member
              </button>
              <button
                type="button"
                onClick={() => handleUpdatePerson(activePerson.id, { isMember: false, customerId: undefined, name: 'Walk-in Guest' })}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  !activePerson.isMember ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Walk-in
              </button>
            </div>
          </div>

          {activePerson.isMember ? (
            <div>
              <select
                value={activePerson.customerId || ''}
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    handleUpdatePerson(activePerson.id, {
                      name: cust.fullName,
                      customerId: cust.id,
                      phone: cust.phone,
                      isMember: true,
                    });
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold text-slate-900 bg-white"
              >
                <option value="">-- Choose Member Profile --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone}) - {c.remainingShakes} shakes left
                  </option>
                ))}
              </select>
              {activePerson.customerId && (
                <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold mt-1 px-1">
                  <span>✓ Standard Shakes: ₹0 (Plan Quota)</span>
                  <span>Add-ons: Charged</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Guest Name (e.g. Rahul, Friend)"
                value={activePerson.name === 'Walk-in Guest' ? '' : activePerson.name}
                onChange={(e) => handleUpdatePerson(activePerson.id, { name: e.target.value || 'Walk-in Guest' })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold text-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1 px-1">Non-member guest drinks billed at retail price.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar min-h-[160px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-emerald-200" />
            <p className="text-xs font-bold text-slate-700">Ticket is empty</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click any drink from catalog to add to bill.</p>
          </div>
        ) : (
          cart.map((item, idx) => {
            const isCoveredShake = item.isMember && item.product.category === 'Shakes';
            const unitPrice = getItemUnitPrice(item);
            const itemTotal = unitPrice * item.quantity;
            const itemId = item.id || `${item.product.id}-${idx}`;

            return (
              <div
                key={itemId}
                className={`p-3 rounded-2xl border text-xs space-y-2 transition-colors ${
                  isCoveredShake 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-slate-50/80 border-emerald-100 hover:border-gold-300'
                }`}
              >
                {/* Item Details and Person Assignment */}
                <div className="flex items-start justify-between">
                  <div className="pr-2 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{item.product.name}</span>
                      {isCoveredShake && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-black border border-emerald-200">
                          Plan Quota
                        </span>
                      )}
                    </p>

                    {/* Assigned Member Tag / Selector */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-bold">For:</span>
                      <select
                        value={item.assignedPersonName || activePerson.name}
                        onChange={(e) => {
                          const selectedP = billPersons.find(p => p.name === e.target.value);
                          if (selectedP) {
                            // Update cart item with new assigned person
                            item.assignedPersonName = selectedP.name;
                            item.isMember = selectedP.isMember;
                            item.memberCustomerId = selectedP.customerId;
                            // Trigger re-render by touching quantity
                            updateCartQuantity(item.id || item.product.id, item.quantity);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg border border-emerald-200 font-bold text-brand-900 bg-white"
                      >
                        {billPersons.map(p => (
                          <option key={p.id} value={p.name}>
                            {p.name} {p.isMember ? '(Member)' : '(Guest)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <p className="text-[10px] mt-0.5">
                      {isCoveredShake ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="line-through text-slate-400 font-normal">₹{item.product.price}</span>
                          <span>₹0 (Covered by Member Plan)</span>
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

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id || item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-emerald-50 rounded-lg text-slate-600 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-black text-xs text-slate-900 w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id || item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-emerald-50 rounded-lg text-slate-600 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id || item.product.id)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary & Checkout (Payment Mode Removed) */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-emerald-100 bg-[#fcfdfd] space-y-3">
          {/* Discount & Remarks */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Discount (Rs.)
              </label>
              <input
                type="number"
                value={discount === 0 ? '' : discount}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscount(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Order Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Less ice"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Bill Financial Summary */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-emerald-100">
            <div className="flex justify-between text-slate-600">
              <span>Add-Ons & Retail Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-700 font-bold">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline text-sm font-black text-slate-900 border-t border-slate-200 pt-1.5">
              <span>Total Payable for Add-ons:</span>
              <span className={`text-base font-black ${total > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                {total > 0 ? formatCurrency(total) : '₹0 (Plan Quota)'}
              </span>
            </div>

            {total > 0 ? (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-900 flex items-center justify-between">
                <span>Payment Status:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black">
                  Need to Pay (Queued for Billing)
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-900 flex items-center justify-between">
                <span>Payment Status:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 font-black">
                  Fully Covered (Plan Quota)
                </span>
              </div>
            )}
          </div>

          {/* Checkout Action Button */}
          <button
            onClick={handleCheckout}
            className="w-full py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer border border-brand-400/40"
          >
            <Sparkles className="w-4 h-4 text-gold-300" />
            <span>Generate Single Bill & Token</span>
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
