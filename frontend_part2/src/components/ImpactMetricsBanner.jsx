import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function ImpactMetricsBanner({ products = [], stats = null }) {
  const autoPub = products.filter(p => p.tier === 'auto-publish').length;
  const caughtRisk = products.filter(p => p.tier === 'blocked' || p.tier === 'flagged').length;
  const trustAdjCount = stats?.trust_leaderboard ? stats.trust_leaderboard.reduce((acc, s) => acc + (s.adjustments_count || 0), 0) : 1;

  return (
    <div className="dossier-panel rounded-2xl p-4 border border-indigo-500/30 bg-slate-950/90 font-mono text-xs flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center space-x-2 text-indigo-300 font-bold">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Session Impact Metrics:</span>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300"><strong className="text-emerald-400 text-sm">{autoPub}</strong> Products Auto-Published</span>
        </div>

        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span className="text-slate-300"><strong className="text-rose-400 text-sm">{caughtRisk}</strong> Risk Discrepancies Intercepted</span>
        </div>

        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300"><strong className="text-cyan-400 text-sm">{trustAdjCount}</strong> Adaptive Trust Nudges Recorded</span>
        </div>
      </div>
    </div>
  );
}
