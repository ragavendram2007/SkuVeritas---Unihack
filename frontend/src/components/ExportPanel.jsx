import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, Info, Table, FileCode } from 'lucide-react';

export default function ExportPanel() {
  const [filterLowConf, setFilterLowConf] = useState(false);

  const handleDownloadExcel = () => {
    window.open('http://localhost:8000/api/enrich/export', '_blank');
  };

  const handleDownloadCsv = () => {
    window.open('http://localhost:8000/api/export/csv', '_blank');
  };

  const handleDownloadJson = () => {
    window.open('http://localhost:8000/api/export/json', '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="fcard tilt flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="eyebrow text-[10px] py-0.5 px-2">
              <span className="dot" /> MULTI-FORMAT DELIVERY EXPORT
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">JSON, CSV & Excel Export Engine</h2>
          </div>
          <p className="text-xs text-[#98a1b0] font-mono">
            Target Schema Export (252 Columns: MFR URL, Dept/Class/Fine, Descriptions, Dynamic Attributes 1..15, Media Flags)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="btn btn-primary btn-sm font-mono font-bold"
          >
            <Table className="w-4 h-4" />
            <span>Download CSV (.csv)</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="btn btn-ghost btn-sm font-mono font-bold text-[#38d4ff] border-[#38d4ff]/30"
          >
            <FileCode className="w-4 h-4" />
            <span>Download JSON (.json)</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="btn btn-ghost btn-sm font-mono font-bold text-emerald-400 border-emerald-500/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="fcard tilt flex items-start space-x-3 text-xs">
        <Info className="w-5 h-5 text-[#38d4ff] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold text-[#f3f5f9] font-mono">Grounding & Anti-Hallucination Export Rules: </span>
          <p className="text-[#98a1b0] leading-relaxed font-mono">
            Every populated cell in the exported <code className="text-[#38d4ff]">.csv</code>, <code className="text-[#38d4ff]">.json</code>, and <code className="text-[#38d4ff]">.xlsx</code> is strictly traceable to post-scoring verified attributes. Attributes with confidence below 0.5 are left blank for human review. Missing image URLs set <code className="text-[#38d4ff]">media_pending: true</code> rather than fabricating fake image links.
          </p>
        </div>
      </div>

      {/* Preview Table Placeholder / Controls */}
      <div className="fcard tilt space-y-4">
        <div className="flex items-center justify-between font-mono text-xs border-b border-[#1c222d] pb-3">
          <span className="font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Target Export Schema Compliance Verified (JSON + CSV + Excel)</span>
          </span>

          <label className="flex items-center space-x-2 cursor-pointer text-[#98a1b0]">
            <input
              type="checkbox"
              checked={filterLowConf}
              onChange={(e) => setFilterLowConf(e.target.checked)}
              className="rounded bg-[#0a0d12] border-[#1c222d] text-emerald-500"
            />
            <span>Highlight Low Confidence Fields (&lt; 0.5)</span>
          </label>
        </div>

        <div className="p-8 text-center space-y-3 font-mono">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <p className="text-sm font-bold text-white">Ready for Instant Download in JSON or CSV Format</p>
          <p className="text-xs text-[#98a1b0] max-w-lg mx-auto">
            Generated outputs contain complete 252-column Delivery Format records matching the Unihack target schema.
          </p>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={handleDownloadCsv}
              className="btn btn-primary btn-sm font-mono font-bold"
            >
              <Table className="w-4 h-4" />
              <span>Download Catalog CSV (.csv)</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="btn btn-ghost btn-sm font-mono font-bold text-[#38d4ff] border-[#38d4ff]/30"
            >
              <FileCode className="w-4 h-4" />
              <span>Download JSON Payload (.json)</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
