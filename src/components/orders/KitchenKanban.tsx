'use client';

import React, { useState } from 'react';
import { 
  Clock, Flame, CheckCircle, ArrowRight, 
  UtensilsCrossed, Printer, AlertCircle, Sparkles 
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatTime, formatDate } from '../../lib/utils';
import { InvoiceModal } from '../common/InvoiceModal';

export const KitchenKanban: React.FC = () => {
  const { orders, updateOrderStatus, invoices } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');
  const preparingOrders = orders.filter(o => o.orderStatus === 'PREPARING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');
  const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED').slice(0, 10);

  const handlePrintOrderInvoice = (order: Order) => {
    const inv = invoices.find(i => i.orderId === order.id || i.invoiceNumber === order.id);
    if (inv) {
      setSelectedInvoice(inv);
      setShowInvoiceModal(true);
    } else {
      const fallbackInv = {
        id: 'INV-' + order.id,
        invoiceNumber: 'INV-' + order.tokenNumber,
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone || 'Walk-in',
        type: 'POS_ORDER',
        items: order.items.map(i => ({
          description: i.productName,
          quantity: i.quantity,
          unitPrice: i.price,
          total: i.subtotal,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        amountPaid: order.total,
        balanceDue: 0,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        date: order.createdAt.split('T')[0],
        branch: order.branch,
        staffName: order.staffName,
        notes: order.remarks,
      };
      setSelectedInvoice(fallbackInv);
      setShowInvoiceModal(true);
    }
  };

  const renderOrderCard = (order: Order, nextStatus?: OrderStatus, nextLabel?: string, btnColor?: string) => (
    <div
      key={order.id}
      className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm hover:shadow-md hover:border-gold-300 transition-all space-y-3"
    >
      {/* Token Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-forest-900 text-gold-300 font-black text-sm flex items-center justify-center shadow-md ring-1 ring-gold-400/40">
            #{order.tokenNumber}
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900">{order.customerName}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {order.id} • {formatTime(order.createdAt.split('T')[1]?.substring(0, 5) || '')}
            </p>
          </div>
        </div>

        <button
          onClick={() => handlePrintOrderInvoice(order)}
          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Print Kitchen Token / Invoice"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      {/* Item List */}
      <div className="space-y-1.5 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100 text-xs">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between">
            <span className="font-semibold text-slate-800">
              <span className="text-brand-700 font-bold">{item.quantity}x</span> {item.productName}
            </span>
            <span className="text-slate-500 font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {order.remarks && (
        <p className="text-[11px] text-gold-900 bg-gold-50 px-2.5 py-1 rounded-lg border border-gold-200 font-medium">
          Note: {order.remarks}
        </p>
      )}

      {/* Action Transition Button */}
      {nextStatus && nextLabel && (
        <button
          onClick={() => updateOrderStatus(order.id, nextStatus)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center space-x-1.5 transition-all ${btnColor}`}
        >
          <span>{nextLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Column 1: Pending */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100/90 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">1. Pending</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-200">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {pendingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400">
                No orders pending
              </div>
            ) : (
              pendingOrders.map(order => 
                renderOrderCard(order, 'PREPARING', 'Start Blender Station', 'bg-gold-600 hover:bg-gold-700 text-slate-950 font-black')
              )
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100/90 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-spin" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">2. In Preparation</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-200">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {preparingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400">
                No orders in preparation
              </div>
            ) : (
              preparingOrders.map(order => 
                renderOrderCard(order, 'READY', 'Mark Ready for Counter', 'bg-brand-600 hover:bg-brand-700 font-bold')
              )
            )}
          </div>
        </div>

        {/* Column 3: Ready for Counter */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100/90 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">3. Ready for Counter</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400">
                No orders ready
              </div>
            ) : (
              readyOrders.map(order => 
                renderOrderCard(order, 'COMPLETED', 'Hand Over / Complete', 'bg-slate-900 hover:bg-slate-800 font-bold')
              )
            )}
          </div>
        </div>

        {/* Column 4: Completed */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100/90 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">4. Dispatched</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {completedOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {completedOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400">
                No completed orders yet
              </div>
            ) : (
              completedOrders.map(order => renderOrderCard(order))
            )}
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoiceModal}
        invoice={selectedInvoice}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
};
