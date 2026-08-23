import React from 'react';
import { Layers, Info, Clock } from 'lucide-react';

export default function EvidenceChainPanel({ attributeEvidence }) {
  if (!attributeEvidence) return null;

  const exhibits = attributeEvidence.exhibits || [];

  const EXHIBIT_COLORS = [
    'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'
  ];

  return (
    <div className="glass-card p-5 border border-slate-800/90 space-y-5 my-3 text-xs font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="badge-pill">◆ EVIDENCE CHAIN</span>
          <h4 className="font-bold text-white text-sm font-mono">
            Breakdown: <span className="text-cyan-300">{attributeEvidence.attribute_name}</span>
          </h4>
        </div>
        <span className="text-slate-400 text-[11px] font-mono">
          Criticality: <span className="text-white font-bold">{attributeEvidence.criticality}</span>
        </span>
      </div>

      {/* Stacked Percentage Contribution Bar */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-300">Exhibit Weight Contribution Breakdown</span>
          <span className="text-cyan-300">{Math.round(attributeEvidence.confidence * 100)}% Confidence</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          {exhibits.map((ex, idx) => (
            <div
              key={idx}
              className={`h-full ${EXHIBIT_COLORS[idx % EXHIBIT_COLORS.length]} transition-all duration-500`}
              style={{ width: `${ex.contribution_percent}%` }}
              title={`${ex.exhibit_label} (${ex.source_id}): ${ex.contribution_percent}% weight contribution`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-400">
          {exhibits.map((ex, idx) => (
            <span key={idx} className="flex items-center space-x-1">
              <span className={`w-2.5 h-2.5 rounded-sm ${EXHIBIT_COLORS[idx % EXHIBIT_COLORS.length]}`} />
              <span>{ex.exhibit_label} ({ex.contribution_percent}%)</span>
            </span>
          ))}
        </div>
      </div>

      {/* Exhibit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {exhibits.map((ex, idx) => (
          <div key={idx} className="glass-card p-3.5 border border-slate-800/80 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="font-extrabold text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {ex.exhibit_label}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  w = {ex.reliability_weight}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate font-mono" title={ex.source_id}>{ex.source_id}</p>

              <div className="mt-2.5 flex items-baseline space-x-1 font-mono">
                <span className="text-base font-bold text-white">{ex.value}</span>
                <span className="text-xs text-slate-400">{ex.unit}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{ex.source_type}</span>
              <span className="flex items-center"><Clock className="w-3 h-3 mr-1 inline" />{ex.last_modified ? ex.last_modified.split('T')[0] : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Applied Formula */}
      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center space-x-2 text-[11px] text-slate-300 font-mono">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span><strong className="text-white">Formula Applied:</strong> {attributeEvidence.formula_applied}</span>
      </div>

    </div>
  );
}
