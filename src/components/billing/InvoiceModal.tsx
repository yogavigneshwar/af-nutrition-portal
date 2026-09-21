import React from 'react';
import { Printer, CheckCircle, Award, Sparkles } from 'lucide-react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, isOpen, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.subtotal ?? invoice.items.reduce((acc, i) => acc + i.total, 0);
  const discount = invoice.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Receipt & Invoice" subtitle={'Invoice #' + invoice.invoiceNumber} maxWidth="2xl">
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
              <span className="font-bold text-emerald-700">{formatCurrency(grandTotal)}</span>
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
            <Printer className="w-4 h-4 mr-2" /> Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};
