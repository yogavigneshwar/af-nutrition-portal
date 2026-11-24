'use client';

import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, Sparkles, FileText, Receipt, ArrowLeft, Coffee } from 'lucide-react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'standard' | 'thermal';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  invoice, 
  isOpen, 
  onClose,
  initialMode = 'standard'
}) => {
  const { customers, shakeLogs } = useApp();
  const [viewMode, setViewMode] = useState<'standard' | 'thermal'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.subtotal ?? invoice.items.reduce((acc, i) => acc + i.total, 0);
  const discount = invoice.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  // Look up customer details for shake quota statistics in thermal slip
  const cust = customers.find(c => c.id === invoice.customerId || c.phone === invoice.customerPhone);
  
  // Extract token number from invoiceNumber or orderId (e.g. INV-00005 -> 5)
  const tokenNumMatch = (invoice.invoiceNumber || '').match(/\d+/);
  const tokenNum = tokenNumMatch ? parseInt(tokenNumMatch[0], 10) % 1000 || 5 : 5;

  // Member shake stats
  const isMember = !!cust && cust.id !== 'WALK-IN';
  const memberConsumed = cust ? cust.consumedShakes : 1;
  const memberAllotted = cust ? cust.allottedShakes : 60;
  const memberBalance = cust ? cust.remainingShakes : 0;

  // Today's shake count
  const todayStr = invoice.date || new Date().toISOString().split('T')[0];
  const todayShakesCount = cust ? shakeLogs.filter(s => s.customerId === cust.id && s.date === todayStr).reduce((acc, s) => acc + s.shakeCount, 0) : 0;
  const dailyFreq = cust ? (cust.dailyShakeFrequency || 1) : 1;

  // Total shake count in this bill
  const totalShakesInInvoice = invoice.items.reduce((acc, item) => {
    const isShake = item.description.toLowerCase().includes('shake') || 
                    item.description.toLowerCase().includes('combo') ||
                    item.description.toLowerCase().includes('tea');
    return acc + (isShake ? item.quantity : 0);
  }, 0) || 1;

  // Formatted date & time for thermal print (e.g. "14 Sep 2026, 06:13 PM")
  const invoiceDateObj = invoice.date ? new Date(invoice.date) : new Date();
  const dateFormatted = invoiceDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeFormatted = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Official Billing & Counter Slip" 
      subtitle={`Bill #${invoice.invoiceNumber} • ${invoice.customerName}`} 
      maxWidth="2xl"
    >
      {/* Top Segmented Format Switcher */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-emerald-900/20 print:hidden">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('standard')}
            className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'standard'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Standard A4 Invoice
          </button>
          <button
            type="button"
            onClick={() => setViewMode('thermal')}
            className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'thermal'
                ? 'bg-gold-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" /> Thermal Paper Slip (Token #{tokenNum})
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 rounded-xl shadow-md shadow-gold-500/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 mr-1.5" /> 
          {viewMode === 'thermal' ? 'Print Thermal Slip' : 'Print Standard Invoice'}
        </button>
      </div>

      {/* VIEW MODE 1: STANDARD INVOICE */}
      {viewMode === 'standard' && (
        <div className="p-2 print:p-0 print:border-none" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-900 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-gold-400 flex items-center justify-center text-slate-950 font-black text-sm tracking-wider shadow-md ring-2 ring-gold-400/50">
                  AF
                </div>
                <h2 className="text-xl font-black tracking-tight text-emerald-950">AF NUTRITION CENTER</h2>
              </div>
              <p className="text-xs text-brand-800 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-600" />
                <span>Nutrition Business Operating System (NBOS)</span>
              </p>
              <p className="text-xs text-slate-500">{invoice.branch}</p>
              <p className="text-xs text-slate-500">Phone: +91 98412 34567</p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 mb-2">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-700" /> {invoice.paymentStatus}
              </span>
              <p className="text-sm font-black text-slate-900">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {formatDate(invoice.date)}</p>
              <p className="text-xs text-slate-500">Staff: {invoice.staffName}</p>
            </div>
          </div>

          {/* Customer & Bill-To Info */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 mb-6 border border-emerald-100 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-emerald-800 uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.customerName}</p>
              <p className="text-slate-600">Phone: {invoice.customerPhone}</p>
              <p className="text-slate-500">Customer ID: {invoice.customerId}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-800 uppercase tracking-wider mb-1">Payment Details</p>
              <p className="font-bold text-slate-900">Mode: {invoice.paymentMethod}</p>
              <p className="text-slate-600">Type: {invoice.type.replace('_', ' ')}</p>
              {invoice.orderId && <p className="text-slate-500">Order Ref: #{invoice.orderId}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs mb-6">
            <thead>
              <tr className="border-b border-slate-300 text-emerald-900 font-bold uppercase tracking-wider bg-emerald-50/30">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Description / Item</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Price</th>
                <th className="py-2.5 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => {
                const isQuotaItem = item.unitPrice === 0 || item.total === 0;

                return (
                  <tr key={index} className="text-slate-800">
                    <td className="py-3 px-2 font-medium text-slate-400">{index + 1}</td>
                    <td className="py-3 px-2 font-semibold text-slate-900">
                      <span>{item.description}</span>
                      {item.assignedPersonName && (
                        <span className="text-[10px] text-slate-500 font-medium ml-1.5">
                          (For {item.assignedPersonName})
                        </span>
                      )}
                      {isQuotaItem && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold ml-1.5 border border-emerald-200">
                          Included in Plan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-medium">
                      {isQuotaItem ? (
                        <span className="text-emerald-700 font-bold">₹0</span>
                      ) : (
                        formatCurrency(item.unitPrice)
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">
                      {isQuotaItem ? (
                        <span className="text-emerald-700 font-black">₹0</span>
                      ) : (
                        formatCurrency(item.total)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Totals */}
          <div className="border-t border-slate-200 pt-4 flex justify-end mb-6">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-700 font-bold">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                <span>Grand Total:</span>
                <span className="text-brand-700 text-base font-black">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(invoice.amountPaid !== undefined ? invoice.amountPaid : grandTotal)}</span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(invoice.balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-gradient-to-r from-emerald-50 via-gold-50/40 to-emerald-50 rounded-2xl p-4 text-center text-[11px] text-slate-600 border border-emerald-100 mb-6">
            <p className="font-bold text-emerald-950 mb-0.5">Thank you for committing to your wellness at AF Nutrition Center!</p>
            <p>Fuel your active lifestyle every single day. For personalized meal adjustments, consult your wellness coach.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Standard Invoice
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: THERMAL PAPER TOKEN SLIP */}
      {viewMode === 'thermal' && (
        <div className="py-2 flex flex-col items-center justify-center">
          <div 
            id="printable-thermal-slip"
            className="w-full max-w-[340px] bg-white text-black font-mono border-2 border-slate-300 shadow-xl rounded-2xl p-6 select-none print:shadow-none print:border-none print:p-2"
          >
            {/* Header: SHAKE COUNTER TOKEN */}
            <div className="text-center">
              <h2 className="font-mono font-black text-xl tracking-wider uppercase text-black">
                SHAKE COUNTER TOKEN
              </h2>
              
              {/* Token Number: #5 */}
              <div className="my-2">
                <span className="font-mono font-black text-6xl tracking-tight text-black inline-block">
                  #{tokenNum}
                </span>
              </div>

              {/* Timestamp & Customer */}
              <p className="font-mono text-xs font-bold text-slate-800">
                {dateFormatted}, {timeFormatted}
              </p>
              <p className="font-mono text-sm font-black text-black mt-1 uppercase">
                Customer: {invoice.customerName}
              </p>
            </div>

            {/* Dashed Border Card: SHAKE DETAILS */}
            <div className="border-2 border-dashed border-black rounded-2xl p-3.5 my-4 text-left bg-slate-50/50 print:bg-white">
              <p className="font-mono font-black text-xs uppercase tracking-wider mb-1 text-black">
                SHAKE DETAILS
              </p>
              <p className="font-mono font-black text-sm text-black">
                {totalShakesInInvoice} shake(s) for token #{tokenNum}
              </p>
              <p className="font-mono text-xs mt-1 text-black font-bold">
                {isMember 
                  ? `Taken ${memberConsumed}/${memberAllotted} | Balance ${memberBalance} | Today ${todayShakesCount}/${dailyFreq}`
                  : `Walk-in Guest | Taken 1/1 | Balance 0 | Today 1/1`}
              </p>
            </div>

            {/* Dashed Divider */}
            <div className="border-t-2 border-dashed border-black my-3"></div>

            {/* Line Items */}
            <div className="space-y-2.5 my-3 text-left">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="text-black">
                  <p className="font-mono font-black text-sm leading-snug">
                    {item.quantity}x {item.description}
                  </p>
                  <p className="font-mono text-xs text-slate-800 font-semibold">
                    Type: {item.assignedPersonName ? `For ${item.assignedPersonName}` : 'Shake Counter / Cooling'}
                  </p>
                  {item.total > 0 && (
                    <p className="font-mono text-xs text-right font-bold">
                      {formatCurrency(item.total)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Dashed Divider */}
            <div className="border-t-2 border-dashed border-black my-3"></div>

            {/* Totals on Thermal Slip if chargeable */}
            {invoice.total > 0 && (
              <div className="text-xs font-mono space-y-1 mb-3 pt-1 text-right">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-black">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid ({invoice.paymentMethod}):</span>
                  <span className="font-bold">{formatCurrency(invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.total)}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between font-black text-black">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(invoice.balanceDue)}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-black my-1"></div>
              </div>
            )}

            {/* Footer Token Reference */}
            <div className="text-center pt-1">
              <p className="font-mono font-black text-xs tracking-wider uppercase text-black">
                Token: {invoice.invoiceNumber.replace('INV-', 'BILL-')}
              </p>
            </div>
          </div>

          {/* Action buttons under preview */}
          <div className="flex items-center space-x-3 mt-5 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 rounded-xl shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" /> Print 80mm Thermal Slip
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
