import React, { useState } from 'react';
import { FileSpreadsheet, Download, Lock, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { fetchErpExportSingle, fetchErpExportAll } from '../api';

export default function ErpExportPanel({ products = [] }) {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'PR-9000');
  const [erpPreview, setErpPreview] = useState(null);
  const [error, setError] = useState(null);
  const [bulkExport, setBulkExport] = useState(null);

  const handlePreviewSingle = async (sku) => {
    try {
      setSelectedSku(sku);
      setError(null);
      const data = await fetchErpExportSingle(sku);
      setErpPreview(data);
    } catch (err) {
      setErpPreview(null);
      setError(err.message || `ERP export blocked for ${sku}`);
    }
  };

  const handleBulkExport = async () => {
    try {
      const data = await fetchErpExportAll();
      setBulkExport(data);
      // Trigger JSON download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SkuVeritas_ERP_Export_Bulk.json`;
      a.click();
    } catch (err) {
      console.error('Bulk export error:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="dossier-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Downstream ERP Export Layer</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Simplified Fake-ERP Target Schema (ERP-SKU, Verified Specs, RELEASED_TO_ERP Status)
          </p>
        </div>

        <button
          onClick={handleBulkExport}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Export Bulk Approved ERP Records (.JSON)</span>
        </button>
      </div>

      {/* Selector & Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Product Selector List */}
        <div className="dossier-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="font-mono font-bold text-white text-sm">Select Product Dossier</h3>

          <div className="space-y-2">
            {products.map((p, idx) => {
              const isSelected = selectedSku === p.sku;
              const isBlocked = p.verdict_stamp === "BLOCKED";

              return (
                <div
                  key={idx}
                  onClick={() => handlePreviewSingle(p.sku)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold">{p.sku}</span>
                    {isBlocked ? (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>EXPORT BLOCKED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        READY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{p.product_name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* JSON Preview Panel */}
        <div className="md:col-span-2 dossier-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between font-mono border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>ERP Schema JSON Preview: <span className="text-emerald-300">{selectedSku}</span></span>
            </h3>
          </div>

          {error ? (
            <div className="p-8 text-center space-y-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
              <Lock className="w-12 h-12 text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-rose-300 font-mono">ERP Export Locked & Hard-Blocked</h4>
              <p className="text-xs text-rose-200 max-w-md mx-auto leading-relaxed">{error}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                Operator Action Required: Open Product Truth Report and perform an explicit Approve or Override action.
              </p>
            </div>
          ) : erpPreview ? (
            <div className="space-y-4 font-mono">
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 overflow-x-auto max-h-[380px]">
                {JSON.stringify(erpPreview, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-400">
              Click a product on the left to preview its ERP transformation record.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
