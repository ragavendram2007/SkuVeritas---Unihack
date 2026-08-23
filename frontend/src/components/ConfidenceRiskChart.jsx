import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { Target, ShieldCheck, AlertTriangle, ShieldAlert, Layers } from 'lucide-react';

export default function ConfidenceRiskChart({ products }) {
  // Flatten attributes across all products
  const chartData = [];

  products.forEach((product) => {
    const attrs = product.attributes || {};
    Object.entries(attrs).forEach(([attrName, attrData]) => {
      chartData.push({
        sku: product.sku,
        productName: product.product_name,
        attribute: attrName,
        confidence: attrData.confidence,
        risk: attrData.risk,
        criticality: attrData.criticality,
        conflict: attrData.conflict,
        resolvedValue: `${attrData.resolved_value} ${attrData.unit}`.trim(),
        diagnosis: attrData.diagnosis?.cause || '100% Agreement'
      });
    });
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-4 rounded-xl shadow-2xl text-xs space-y-2 z-50 font-mono border border-cyan-500/30 max-w-xs">
          <div className="flex items-center justify-between space-x-3 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-300 text-sm">{data.sku}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              data.criticality === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {data.criticality}
            </span>
          </div>
          <p className="text-white font-bold text-sm">{data.attribute}</p>
          <p className="text-slate-400">Resolved Value: <span className="text-slate-100 font-bold">{data.resolvedValue}</span></p>
          <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-400">Confidence: {(data.confidence * 100).toFixed(1)}%</span>
            <span className="text-rose-400">Risk: {data.risk.toFixed(3)}</span>
          </div>
          {data.conflict && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <span className="font-bold">Diagnosis: </span>{data.diagnosis}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-sans tracking-tight">Confidence vs. Risk Matrix</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            3-Tier Human-in-the-Loop Routing Quadrants (Part 2 ERP Export Contract Handoff)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tier 1: Auto-Approve</span>
          </div>
          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Tier 2: Standard Review</span>
          </div>
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 rounded-xl text-rose-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Tier 3: Critical Audit</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800/80">
        <div className="h-[440px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              
              <XAxis
                type="number"
                dataKey="confidence"
                name="Confidence"
                domain={[0.7, 1.0]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                label={{ value: 'Confidence Score (Weighted Agreement Ratio)', position: 'insideBottom', offset: -12, fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />

              <YAxis
                type="number"
                dataKey="risk"
                name="Risk"
                domain={[0.0, 0.2]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                label={{ value: 'Risk Score (Criticality Weight x Disagreement)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />

              <ZAxis type="number" range={[120, 320]} />

              <Tooltip content={<CustomTooltip />} />

              {/* Background Quadrant Highlight Areas */}
              <ReferenceArea x1={0.95} x2={1.0} y1={0} y2={0.05} fill="#10b981" fillOpacity={0.08} />
              <ReferenceArea x1={0.85} x2={0.95} y1={0} y2={0.1} fill="#f59e0b" fillOpacity={0.08} />
              <ReferenceArea x1={0.7} x2={0.85} y1={0.1} y2={0.2} fill="#ef4444" fillOpacity={0.10} />

              <Scatter
                name="Attributes"
                data={chartData}
                fill="#06b6d4"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
