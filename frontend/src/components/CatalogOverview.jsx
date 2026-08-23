import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, Layers, Search, AlertTriangle, Table, FileText, FileSpreadsheet, Globe } from 'lucide-react';
import TrustGauge from './TrustGauge';

export default function CatalogOverview({ products, onSelectProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === 'conflicts') return matchesSearch && p.conflict_count > 0;
    if (filterMode === 'clean') return matchesSearch && p.conflict_count === 0;
    if (filterMode === 'critical') return matchesSearch && p.critical_conflict_count > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans">
      
      {/* Hero Bento Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Catalog SKUs */}
        <div className="glass-card p-5 border border-slate-800/80 flex items-center justify-between relative overflow-hidden group">
          <div>
            <span className="badge-pill mb-2">◆ CATALOG COVERAGE</span>
            <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{products.length} SKUs</p>
            <p className="text-[11px] text-cyan-400 mt-1 font-mono">4 Raw Sources / SKU</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 shadow-inner shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Clean Records */}
        <div className="glass-card p-5 border border-slate-800/80 flex items-center justify-between relative overflow-hidden group">
          <div>
            <span className="badge-pill mb-2">◆ CLEAN CONSENSUS</span>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {products.filter(p => p.conflict_count === 0).length}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">100% Truth Consensus</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-inner shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Flagged Conflicts */}
        <div className="glass-card p-5 border border-slate-800/80 flex items-center justify-between relative overflow-hidden group">
          <div>
            <span className="badge-pill mb-2">◆ FLAGGED DISCREPANCIES</span>
            <p className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {products.filter(p => p.conflict_count > 0).length}
            </p>
            <p className="text-[11px] text-amber-400/80 mt-1 font-mono">Diagnosed & Isolated</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shadow-inner shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Disagreements */}
        <div className="glass-card p-5 border border-slate-800/80 flex items-center justify-between relative overflow-hidden group">
          <div>
            <span className="badge-pill mb-2">◆ HIGH CRITICALITY</span>
            <p className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {products.reduce((acc, p) => acc + (p.critical_conflict_count || 0), 0)}
            </p>
            <p className="text-[11px] text-rose-400/80 mt-1 font-mono">High-Criticality Attributes</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20 shadow-inner shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU code or product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl border font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400/30 shadow-md'
                : 'text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            All SKUs ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('conflicts')}
            className={`px-3.5 py-1.5 rounded-xl border font-semibold transition-all ${
              filterMode === 'conflicts'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md'
                : 'text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            Has Conflicts ({products.filter(p => p.conflict_count > 0).length})
          </button>
          <button
            onClick={() => setFilterMode('clean')}
            className={`px-3.5 py-1.5 rounded-xl border font-semibold transition-all ${
              filterMode === 'clean'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md'
                : 'text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            Clean Records ({products.filter(p => p.conflict_count === 0).length})
          </button>
        </div>
      </div>

      {/* Bento Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredProducts.map((p) => {
          const hasCritical = p.critical_conflict_count > 0;
          const hasConflict = p.conflict_count > 0;

          // Special diagnosis tag labels based on SKU
          let conflictTag = "Discrepancy Flagged";
          if (p.sku === "PR-9000") conflictTag = "⚡ Unit Conversion Mislabel";
          if (p.sku === "EB-4040") conflictTag = "🔢 Digit Transposition";
          if (p.sku === "SV-5050") conflictTag = "⏰ Stale Revision & Missing Attr";

          return (
            <div
              key={p.sku}
              onClick={() => onSelectProduct(p.sku)}
              className="glass-card rounded-2xl p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1"
            >
              {/* Top status indicator line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                hasCritical ? 'bg-rose-500' : hasConflict ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 inline-block">
                      {p.sku}
                    </span>
                    <h3 className="font-bold text-white text-base mt-2 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {p.product_name}
                    </h3>
                  </div>

                  <div className="radial-glow-cyan shrink-0">
                    <TrustGauge score={p.overall_trust_score} size={72} strokeWidth={6} />
                  </div>
                </div>

                {/* Sources Ingested Pills */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sources:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center space-x-1">
                    <Table className="w-3 h-3 text-cyan-400" /> <span>ERP</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-indigo-400" /> <span>PDF</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center space-x-1">
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" /> <span>Excel</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-amber-400" /> <span>Web</span>
                  </span>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hasCritical ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                      {conflictTag}
                    </span>
                  ) : hasConflict ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      {conflictTag}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      100% Source Consensus
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 group-hover:text-white flex items-center space-x-1 font-mono font-semibold transition-all">
                  <span>Inspect Record</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
