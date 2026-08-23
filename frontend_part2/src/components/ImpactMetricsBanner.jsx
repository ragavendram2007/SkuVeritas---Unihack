import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, TrendingUp } from 'lucide-react';

export default function ImpactMetricsBanner({ products = [], stats = null }) {
  const autoPublishedCount = stats?.auto_published_count ?? products.filter(p => p.tier === 'auto-publish').length;
  const hardBlockedCount = stats?.hard_blocked_review_queue_count ?? products.filter(p => p.tier === 'blocked').length;
  const totalProducts = products.length || 4;

  const autoPublishPct = Math.round((autoPublishedCount / totalProducts) * 100);
  const timeSavedHours = (autoPublishedCount * 0.75).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
      
      {/* 1. Time Saved */}
      <div className="fcard tilt flex items-center justify-between">
        <div>
          <span className="eyebrow text-[10px] py-0.5 px-2 mb-2 border-emerald-500/30 text-emerald-300">
            <span className="dot bg-emerald-400" /> TIME SAVED
          </span>
          <h4 className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">{timeSavedHours} Hours</h4>
          <p className="text-[11px] text-[#98a1b0] font-mono mt-0.5">Automated Review Cycles Saved</p>
        </div>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Auto-Publish Rate */}
      <div className="fcard tilt flex items-center justify-between">
        <div>
          <span className="eyebrow text-[10px] py-0.5 px-2 mb-2">
            <span className="dot" /> AUTO-PUBLISH RATE
          </span>
          <h4 className="text-2xl font-extrabold text-[#38d4ff] font-mono tracking-tight">{autoPublishPct}% Catalog</h4>
          <p className="text-[11px] text-[#98a1b0] font-mono mt-0.5">Zero Manual Touch Required</p>
        </div>
        <div className="p-3 bg-[#0ea5e9]/10 border border-[#38d4ff]/30 rounded-xl text-[#38d4ff]">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      {/* 3. High-Risk Prevention */}
      <div className="fcard tilt flex items-center justify-between">
        <div>
          <span className="eyebrow text-[10px] py-0.5 px-2 mb-2 border-rose-500/30 text-rose-300">
            <span className="dot bg-rose-400" /> HIGH-RISK BLOCKED
          </span>
          <h4 className="text-2xl font-extrabold text-rose-400 font-mono tracking-tight">{hardBlockedCount} SKUs</h4>
          <p className="text-[11px] text-rose-400/80 font-mono mt-0.5">Prevented Bad Ingestion</p>
        </div>
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}
