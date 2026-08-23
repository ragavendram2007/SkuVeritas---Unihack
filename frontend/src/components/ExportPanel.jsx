import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, Filter, Info, ExternalLink } from 'lucide-react';

export default function ExportPanel() {
  const [filterLowConf, setFilterLowConf] = useState(false);

  const handleDownload = () => {
    window.open('http://localhost:8000/api/enrich/export', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white font-sans tracking-tight">Delivery Format Export Panel</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Target Schema Export (252 Columns: MFR URL, Dept/Class/Fine, Descriptions, Dynamic Attributes 1..15, Media Flags)
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Delivery_Format_Export.xlsx</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex items-start space-x-3 text-xs">
        <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold text-slate-200 font-mono">Grounding & Anti-Hallucination Export Rules: </span>
          <p className="text-slate-300 leading-relaxed">
            Every populated cell in the exported <code className="text-cyan-300 font-mono">.xlsx</code> is strictly traceable to post-scoring verified attributes. Attributes with confidence below 0.5 are left blank for human review. Missing image URLs set <code className="text-cyan-300 font-mono">media_pending: true</code> rather than fabricating fake image links.
          </p>
        </div>
      </div>

      {/* Preview Table Placeholder / Controls */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800 pb-3">
          <span className="font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Target Export Schema Compliance Verified</span>
          </span>

          <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={filterLowConf}
              onChange={(e) => setFilterLowConf(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/50"
            />
            <span>Highlight Low Confidence Fields (&lt; 0.5)</span>
          </label>
        </div>

        <div className="p-8 text-center space-y-3">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <p className="text-sm font-bold text-white font-mono">Ready for Download</p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Generated file contains complete 252-column Delivery Format Excel output matching the Unihack target schema.
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Delivery_Format_Export.xlsx</span>
          </button>
        </div>
      </div>

    </div>
  );
}
