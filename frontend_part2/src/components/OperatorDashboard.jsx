import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, Layers, BarChart2 } from 'lucide-react';
import { fetchDashboardStats } from '../api';
import VerdictStamp from './VerdictStamp';
import AskSkuVeritas from './AskSkuVeritas';
import ImpactMetricsBanner from './ImpactMetricsBanner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function OperatorDashboard({ products = [], onSelectProduct }) {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartData = stats?.trust_score_distribution ? [
    { name: '90-100%', count: stats.trust_score_distribution['90-100'] || 0, fill: '#38d4ff' },
    { name: '80-89%', count: stats.trust_score_distribution['80-89'] || 0, fill: '#0ea5e9' },
    { name: '70-79%', count: stats.trust_score_distribution['70-79'] || 0, fill: '#f59e0b' },
    { name: '< 70%', count: stats.trust_score_distribution['below-70'] || 0, fill: '#f43f5e' }
  ] : [];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Persistent Impact Metrics Banner */}
      <ImpactMetricsBanner products={products} stats={stats} />

      {/* "Ask SkuVeritas" Natural-Language Query Bar */}
      <AskSkuVeritas products={products} />

      {/* Hero Unify Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="fcard tilt flex items-center justify-between">
          <div>
            <span className="eyebrow text-[10px] py-0.5 px-2 mb-2">
              <span className="dot" /> TOTAL DOSSIERS
            </span>
            <h3 className="text-3xl font-extrabold text-white font-mono mt-1 tracking-tight">{products.length}</h3>
            <p className="text-[11px] text-[#98a1b0] font-mono mt-0.5">Scanned Raw Records</p>
          </div>
          <div className="p-3 bg-[#0ea5e9]/10 border border-[#38d4ff]/30 rounded-xl text-[#38d4ff]">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="fcard tilt flex items-center justify-between">
          <div>
            <span className="eyebrow text-[10px] py-0.5 px-2 mb-2 border-emerald-500/30 text-emerald-300">
              <span className="dot bg-emerald-400" /> TIER 1 PUBLISHED
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 tracking-tight">
              {stats?.auto_published_count ?? products.filter(p => p.tier === 'auto-publish').length}
            </h3>
            <p className="text-[11px] text-emerald-400/80 font-mono mt-0.5">100% Consensus</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="fcard tilt flex items-center justify-between">
          <div>
            <span className="eyebrow text-[10px] py-0.5 px-2 mb-2 border-amber-500/30 text-amber-300">
              <span className="dot bg-amber-400" /> TIER 2 FLAGGED
            </span>
            <h3 className="text-3xl font-extrabold text-amber-400 font-mono mt-1 tracking-tight">
              {stats?.flagged_verify_soon_count ?? products.filter(p => p.tier === 'flagged').length}
            </h3>
            <p className="text-[11px] text-amber-400/80 font-mono mt-0.5">Low-Risk Conflict</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="fcard tilt flex items-center justify-between">
          <div>
            <span className="eyebrow text-[10px] py-0.5 px-2 mb-2 border-rose-500/30 text-rose-300">
              <span className="dot bg-rose-400" /> TIER 3 BLOCKED
            </span>
            <h3 className="text-3xl font-extrabold text-rose-400 font-mono mt-1 tracking-tight">
              {stats?.hard_blocked_review_queue_count ?? products.filter(p => p.tier === 'blocked').length}
            </h3>
            <p className="text-[11px] text-rose-400/80 font-mono mt-0.5">Risk ≥ 0.10 Isolated</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Distribution Chart & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trust Score Distribution Chart */}
        <div className="lg:col-span-2 fcard tilt space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center space-x-2">
              <span className="eyebrow text-[10px] py-0.5 px-2">
                <span className="dot" /> DYNAMIC METRICS
              </span>
              <h3 className="font-bold text-white text-sm">Catalog Credibility Distribution</h3>
            </div>
            <span className="text-xs text-[#98a1b0]">Part 1 Engine Input</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#565f6d" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#565f6d" tick={{ fontSize: 11, fontFamily: 'monospace' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1017', borderColor: '#1c222d', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adaptive Trust Leaderboard Preview */}
        <div className="fcard tilt space-y-4">
          <div className="flex items-center justify-between font-mono">
            <span className="eyebrow text-[10px] py-0.5 px-2">
              <span className="dot" /> TRUST LEADERBOARD
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {stats?.trust_leaderboard && stats.trust_leaderboard.length > 0 ? (
              stats.trust_leaderboard.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#0a0d12] rounded-xl border border-[#1c222d] flex items-center justify-between">
                  <span className="font-bold text-[#f3f5f9]">{item.source_id}</span>
                  <span className="font-bold text-emerald-400">w = {item.current_weight.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-[#565f6d] text-xs text-center py-6">No review adjustments recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Review Queue Table */}
      <div className="fcard tilt space-y-4">
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <span className="eyebrow text-[10px] py-0.5 px-2">
              <span className="dot" /> OPERATOR QUEUE
            </span>
            <h3 className="font-bold text-white text-sm">Human Review Worklist</h3>
          </div>
          <span className="text-xs text-[#98a1b0]">{products.length} Items Loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0a0d12] text-[#98a1b0] border-b border-[#1c222d] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">SKU</th>
                <th className="py-3 px-4 font-bold">Product Name</th>
                <th className="py-3 px-4 font-bold">Routing Tier</th>
                <th className="py-3 px-4 font-bold">Verdict Stamp</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151a23] text-[#f3f5f9]">
              {products.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#0a0d12]/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#38d4ff]">{p.sku}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-200">{p.product_name}</td>
                  <td className="py-3.5 px-4 capitalize font-bold text-slate-300">{p.tier}</td>
                  <td className="py-3.5 px-4">
                    <VerdictStamp stamp={p.verdict_stamp} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectProduct(p.sku)}
                      className="btn btn-primary btn-sm font-bold text-xs"
                    >
                      <span>Investigate Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
