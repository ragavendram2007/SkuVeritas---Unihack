import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Cpu, Info, FileCode, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import TrustGauge from './TrustGauge';
import DiagnosisPanel from './DiagnosisPanel';

export default function ProductDetail({ product, onBack, onOpenContract }) {
  const [expandedRows, setExpandedRows] = useState({
    // Expand conflicts by default for rich initial presentation
    pressure_rating: true,
    weight: true,
    voltage: true
  });

  if (!product) return null;

  const toggleRow = (attrName) => {
    setExpandedRows(prev => ({
      ...prev,
      [attrName]: !prev[attrName]
    }));
  };

  const attributes = product.attributes || {};

  return (
    <div className="space-y-6">
      
      {/* Product Hero Header Bar */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
              {product.sku}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">{product.product_name}</h1>
          <p className="text-xs text-slate-400 font-mono flex items-center space-x-2">
            <span>Canonical Schema Normalized</span>
            <span>•</span>
            <span>4 Multi-Source Agreement Audit</span>
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Overall Trust Score</span>
            <span className="text-xs text-slate-400 font-mono">Weighted Prior Consensus</span>
          </div>
          <TrustGauge score={product.overall_trust_score} size={76} strokeWidth={7} />
        </div>
      </div>

      {/* Main Attribute Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <h2 className="font-bold text-white text-base font-mono flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Normalized Attributes Matrix</span>
            </h2>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold">
              {Object.keys(attributes).length} Attributes
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-500/50" /> 100% Consensus</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm shadow-amber-500/50" /> Discrepancy Flagged</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[11px]">
                <th className="py-4 px-5 font-bold">Attribute</th>
                <th className="py-4 px-5 font-bold">Criticality</th>
                <th className="py-4 px-5 font-bold">Side-by-Side Source Values</th>
                <th className="py-4 px-5 font-bold">Resolved Truth</th>
                <th className="py-4 px-5 font-bold min-w-[140px]">Confidence Bar</th>
                <th className="py-4 px-5 font-bold">Risk Index</th>
                <th className="py-4 px-5 font-bold text-right">Reasoning Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {Object.entries(attributes).map(([attrName, attrData]) => {
                const isConflict = attrData.conflict;
                const isMissing = attrData.missing;
                const isExpanded = !!expandedRows[attrName];
                const sources = attrData.sources || [];

                return (
                  <React.Fragment key={attrName}>
                    <tr
                      onClick={() => isConflict && toggleRow(attrName)}
                      className={`transition-all duration-200 ${
                        isConflict
                          ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08] cursor-pointer border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Attribute Name */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-100 text-sm">
                        {attrName}
                        {isMissing && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Missing in {attrData.missing_in?.length} source
                          </span>
                        )}
                      </td>

                      {/* Criticality Tag */}
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold font-mono uppercase tracking-wider ${
                          attrData.criticality === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-sm'
                            : attrData.criticality === 'LOW'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {attrData.criticality}
                        </span>
                      </td>

                      {/* Side-by-Side Source Values */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {sources.map((src, i) => {
                            const isMajority = String(src.value).toLowerCase() === String(attrData.resolved_value).toLowerCase();
                            return (
                              <div
                                key={i}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border flex items-center space-x-1.5 transition-all ${
                                  isMajority
                                    ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-extrabold ring-1 ring-rose-500/20 animate-pulse'
                                }`}
                                title={`${src.source_id} (${src.source_type}): w=${src.reliability_weight}`}
                              >
                                <span className="text-[9px] text-slate-400 uppercase font-bold">{src.source_type.split('_')[0]}:</span>
                                <span>{src.value} {src.unit}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Resolved Truth */}
                      <td className="py-4 px-5 font-mono font-extrabold text-white text-base">
                        {attrData.resolved_value} <span className="text-xs text-slate-400 font-normal">{attrData.unit}</span>
                      </td>

                      {/* Confidence Bar */}
                      <td className="py-4 px-5 font-mono">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-bold">{Math.round(attrData.confidence * 100)}% Agreement</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                attrData.confidence >= 0.95
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : attrData.confidence >= 0.8
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                                  : 'bg-gradient-to-r from-rose-500 to-pink-500'
                              }`}
                              style={{ width: `${attrData.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk Index */}
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold font-mono border ${
                          attrData.risk > 0.1
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose'
                            : attrData.risk > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}>
                          Risk: {attrData.risk.toFixed(3)}
                        </span>
                      </td>

                      {/* Diagnosis Action / Expand Accordion */}
                      <td className="py-4 px-5 text-right">
                        {isConflict ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(attrName);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 transition-all shadow-md"
                          >
                            <Cpu className="w-4 h-4 text-amber-400" />
                            <span>{isExpanded ? 'Hide Reasoner' : 'Inspect Diagnosis'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono inline-flex items-center font-bold">
                            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> Consensus
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Inline Diagnosis Accordion (Screen C) */}
                    {isConflict && isExpanded && (
                      <tr className="bg-slate-950/90">
                        <td colSpan={7} className="p-4 border-l-4 border-l-amber-500">
                          <DiagnosisPanel attributeName={attrName} attributeData={attrData} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
