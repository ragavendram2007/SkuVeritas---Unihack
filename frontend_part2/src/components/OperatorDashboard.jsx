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
    { name: '90-100%', count: stats.trust_score_distribution['90-100'] || 0, fill: '#10b981' },
    { name: '80-89%', count: stats.trust_score_distribution['80-89'] || 0, fill: '#3b82f6' },
    { name: '70-79%', count: stats.trust_score_distribution['70-79'] || 0, fill: '#f59e0b' },
    { name: '< 70%', count: stats.trust_score_distribution['below-70'] || 0, fill: '#f43f5e' }
  ] : [];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Persistent Impact Metrics Banner */}
      <ImpactMetricsBanner products={products} stats={stats} />

      {/* "Ask SkuVeritas" Natural-Language Query Bar */}
      <AskSkuVeritas products={products} />

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="dossier-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Total Catalog Dossiers</p>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-1">{products.length}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="dossier-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Auto-Published (Tier 1)</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {stats?.auto_published_count ?? products.filter(p => p.tier === 'auto-publish').length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="dossier-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Flagged Verify Soon (Tier 2)</p>
            <h3 className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {stats?.flagged_verify_soon_count ?? products.filter(p => p.tier === 'flagged').length}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="dossier-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Hard-Blocked Queue (Tier 3)</p>
            <h3 className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
              {stats?.hard_blocked_review_queue_count ?? products.filter(p => p.tier === 'blocked').length}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Distribution Chart & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trust Score Distribution Chart */}
        <div className="lg:col-span-2 dossier-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between font-mono">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Catalog Credibility Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Part 1 Scoring Input</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
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
        <div className="dossier-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between font-mono">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Adaptive Trust Top Sources</span>
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {stats?.trust_leaderboard && stats.trust_leaderboard.length > 0 ? (
              stats.trust_leaderboard.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="font-bold text-slate-200">{item.source_id}</span>
                  <span className="font-bold text-emerald-400">w = {item.current_weight.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs text-center py-6">No review adjustments recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Review Queue Table */}
      <div className="dossier-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between font-mono">
          <h3 className="font-bold text-white text-sm">Operator Review Queue</h3>
          <span className="text-xs text-slate-400">{products.length} Products Loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-bold">SKU</th>
                <th className="py-3 px-4 font-bold">Product Name</th>
                <th className="py-3 px-4 font-bold">Routing Tier</th>
                <th className="py-3 px-4 font-bold">Verdict Stamp</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {products.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">{p.sku}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-200">{p.product_name}</td>
                  <td className="py-3.5 px-4 capitalize font-bold text-slate-300">{p.tier}</td>
                  <td className="py-3.5 px-4">
                    <VerdictStamp stamp={p.verdict_stamp} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectProduct(p.sku)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all"
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
