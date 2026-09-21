'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, FileText, CheckCircle, AlertTriangle, 
  Sparkles, Download, ArrowRight, Users, Package 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BulkUploadPage() {
  const { bulkImportCustomers, bulkImportProducts } = useApp();
  const [importType, setImportType] = useState<'customers' | 'products'>('customers');
  const [csvText, setCsvText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const customerSample = `FullName,Phone,Email,Gender,Age,CustomerType,ProgramDuration,PricePerDay
Dr. Anbarasu M,9840112233,anbu@med.org,Male,48,Preferred Customer,30 Days,150
Divya Bharathi,9940123456,divya.b@gmail.com,Female,27,New Customer,15 Days,150
Ganesh Moorthy,9790445566,ganesh.m@gmail.com,Male,36,JP Member,21 Days,160`;

  const productSample = `Code,Name,Category,Price,CostPrice,Stock,MinStockAlert,Flavor
SHK-PCH,Peach Sunrise Protein Shake,Shakes,155,65,30,8,Peach
CMB-DET,Metabolic Detox Duo Combo,Combos,240,100,20,5,Lemon & Ginger
TEA-ELC,Electrolyte Green Infusion,Energy Teas,85,25,45,10,Herbal`;

  const handleUseSample = () => {
    if (importType === 'customers') {
      setCsvText(customerSample);
    } else {
      setCsvText(productSample);
    }
  };

  const handleProcessImport = () => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!csvText.trim()) {
      setErrorMessage('Please paste or upload CSV data first.');
      return;
    }

    try {
      const lines = csvText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        setErrorMessage('CSV must contain a header row and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());

      if (importType === 'customers') {
        const parsedList: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h.charAt(0).toLowerCase() + h.slice(1)] = values[idx] || '';
          });
          parsedList.push(obj);
        }

        const count = bulkImportCustomers(parsedList);
        setSuccessMessage(`Successfully imported and enrolled ${count} new member profiles!`);
        setCsvText('');
      } else {
        const parsedList: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h.charAt(0).toLowerCase() + h.slice(1)] = values[idx] || '';
          });
          parsedList.push(obj);
        }

        const count = bulkImportProducts(parsedList);
        setSuccessMessage(`Successfully imported and updated ${count} catalog menu items!`);
        setCsvText('');
      }
    } catch (e: any) {
      setErrorMessage(`Import error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
            <UploadCloud className="w-4 h-4 text-gold-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Bulk CSV Data Import & Migration Tool
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Seamlessly upload existing club rosters, members, or master product catalogs directly into the live operating system.
        </p>
      </div>

      {/* Import Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setImportType('customers');
            setCsvText('');
            setSuccessMessage('');
          }}
          className={`p-6 rounded-3xl border text-left transition-all ${
            importType === 'customers'
              ? 'border-brand-500 bg-emerald-50/50 text-brand-950 shadow-md ring-2 ring-brand-500/20'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              CSV Ingestion
            </span>
          </div>
          <h3 className="font-black text-sm text-slate-900">1. Customer Roster Import</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Import members with plans, phone numbers, and shake balances.</p>
        </button>

        <button
          onClick={() => {
            setImportType('products');
            setCsvText('');
            setSuccessMessage('');
          }}
          className={`p-6 rounded-3xl border text-left transition-all ${
            importType === 'products'
              ? 'border-gold-500 bg-gold-50/50 text-gold-950 shadow-md ring-2 ring-gold-500/20'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-gold-600" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-200">
              CSV Ingestion
            </span>
          </div>
          <h3 className="font-black text-sm text-slate-900">2. Product & Menu Catalog Import</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Import shake flavors, combos, prices, and stock inventory.</p>
        </button>
      </div>

      {/* Editor Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Paste CSV Formatted Text Below:
          </label>
          <button
            onClick={handleUseSample}
            className="text-xs font-black text-gold-700 hover:text-gold-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-50 hover:bg-gold-100 border border-gold-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Load Sample CSV Data</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <textarea
          rows={10}
          placeholder={importType === 'customers' ? customerSample : productSample}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full p-4 rounded-2xl border border-emerald-200/80 text-xs font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none leading-relaxed"
        />

        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            Comma-delimited format with matching headers is required.
          </p>

          <button
            onClick={handleProcessImport}
            className="px-8 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-xl shadow-brand-900/20 flex items-center space-x-2 transition-all active:scale-95 border border-brand-400/30"
          >
            <UploadCloud className="w-4 h-4 text-gold-200" />
            <span>Process & Import Records</span>
          </button>
        </div>
      </div>
    </div>
  );
}
