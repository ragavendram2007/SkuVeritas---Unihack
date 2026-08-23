import React, { useState } from 'react';
import { FileSpreadsheet, Download, Lock, FileCode, Table, CheckCircle2 } from 'lucide-react';
import { fetchErpExportSingle, fetchErpExportAll } from '../api';

export default function ErpExportPanel({ products = [] }) {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'PR-9000');
  const [erpPreview, setErpPreview] = useState(null);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('json'); // 'json' or 'csv'

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

  const convertArrayToCsv = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return '';
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '_' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flattenObject(obj[k], pre + k));
        } else if (Array.isArray(obj[k])) {
          acc[pre + k] = JSON.stringify(obj[k]);
        } else {
          acc[pre + k] = obj[k];
        }
        return acc;
      }, {});
    };

    const flatArray = dataArray.map(item => flattenObject(item));
    const headers = Array.from(new Set(flatArray.flatMap(item => Object.keys(item))));
    const csvRows = [headers.join(',')];

    for (const item of flatArray) {
      const values = headers.map(header => {
        const val = item[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const handleDownloadSingleCsv = () => {
    if (!erpPreview) return;
    const csvContent = convertArrayToCsv([erpPreview.payload || erpPreview]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkuVeritas_${selectedSku}_ERP_Export.csv`;
    a.click();
  };

  const handleDownloadSingleJson = () => {
    if (!erpPreview) return;
    const blob = new Blob([JSON.stringify(erpPreview, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkuVeritas_${selectedSku}_ERP_Export.json`;
    a.click();
  };

  const handleBulkExportCsv = async () => {
    try {
      const data = await fetchErpExportAll();
      const items = data.payloads || data.items || [data];
      const csvContent = convertArrayToCsv(items);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SkuVeritas_ERP_Catalog_Master.csv`;
      a.click();
    } catch (err) {
      console.error('Bulk CSV export error:', err);
    }
  };

  const handleBulkExportJson = async () => {
    try {
      const data = await fetchErpExportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SkuVeritas_ERP_Catalog_Master.json`;
      a.click();
    } catch (err) {
      console.error('Bulk JSON export error:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="fcard tilt flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="eyebrow text-[10px] py-0.5 px-2">
              <span className="dot" /> DOWNSTREAM ERP EXPORT
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">JSON & CSV Output Delivery Layer</h2>
          </div>
          <p className="text-xs text-[#98a1b0] font-mono mt-1">
            Generates release-ready JSON payloads for REST APIs & clean CSV spreadsheets for SAP/Oracle ERP ingestion.
          </p>
        </div>

        {/* Bulk Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleBulkExportCsv}
            className="btn btn-primary btn-sm font-mono font-bold"
          >
            <Table className="w-4 h-4" />
            <span>Export Bulk CSV (.csv)</span>
          </button>

          <button
            onClick={handleBulkExportJson}
            className="btn btn-ghost btn-sm font-mono font-bold text-[#38d4ff] border-[#38d4ff]/30"
          >
            <FileCode className="w-4 h-4" />
            <span>Export Bulk JSON (.json)</span>
          </button>
        </div>
      </div>

      {/* Selector & Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Product Selector List */}
        <div className="fcard tilt space-y-3">
          <h3 className="font-mono font-bold text-white text-sm flex items-center justify-between">
            <span>Select Product Dossier</span>
            <span className="text-xs text-[#98a1b0]">{products.length} Products</span>
          </h3>

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
                      ? 'bg-[#0ea5e9]/15 border-[#38d4ff]/50 text-white shadow-lg'
                      : 'bg-[#0a0d12] border-[#1c222d] text-[#f3f5f9] hover:bg-[#151a23]'
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
                  <p className="text-[11px] text-[#98a1b0] truncate mt-1">{p.product_name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* JSON / CSV Interactive Preview Panel */}
        <div className="md:col-span-2 fcard tilt space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c222d] pb-3 font-mono">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>ERP Target Schema Preview: <span className="text-[#38d4ff]">{selectedSku}</span></span>
            </h3>

            {/* JSON / CSV Format Toggle Switcher */}
            <div className="flex items-center p-1 bg-[#0a0d12] border border-[#1c222d] rounded-lg text-xs font-semibold">
              <button
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1 rounded transition-all ${
                  exportFormat === 'json'
                    ? 'bg-gradient-to-r from-[#38d4ff] to-[#0ea5e9] text-white shadow-sm font-bold'
                    : 'text-[#98a1b0] hover:text-white'
                }`}
              >
                JSON Format
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`px-3 py-1 rounded transition-all ${
                  exportFormat === 'csv'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm font-bold'
                    : 'text-[#98a1b0] hover:text-white'
                }`}
              >
                CSV Format
              </button>
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center space-y-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
              <Lock className="w-12 h-12 text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-rose-300 font-mono">ERP Export Locked & Hard-Blocked</h4>
              <p className="text-xs text-rose-200 max-w-md mx-auto leading-relaxed">{error}</p>
              <p className="text-[11px] text-[#98a1b0] font-mono">
                Operator Action Required: Open Product Truth Report and perform an explicit Approve or Override action.
              </p>
            </div>
          ) : erpPreview ? (
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between text-xs text-[#98a1b0]">
                <span>Status: <strong className="text-emerald-400">RELEASED TO ERP</strong></span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadSingleCsv}
                    className="btn btn-ghost btn-sm text-xs py-1 px-2 text-emerald-400 border-emerald-500/30"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>

                  <button
                    onClick={handleDownloadSingleJson}
                    className="btn btn-ghost btn-sm text-xs py-1 px-2 text-[#38d4ff] border-[#38d4ff]/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {exportFormat === 'json' ? (
                <pre className="p-4 bg-[#0a0d12] border border-[#1c222d] rounded-xl text-xs text-[#38d4ff] overflow-x-auto max-h-[380px] leading-relaxed">
                  {JSON.stringify(erpPreview, null, 2)}
                </pre>
              ) : (
                <pre className="p-4 bg-[#0a0d12] border border-[#1c222d] rounded-xl text-xs text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed">
                  {convertArrayToCsv([erpPreview.payload || erpPreview])}
                </pre>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-[#98a1b0]">
              Click a product on the left to preview its JSON / CSV ERP transformation record.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
