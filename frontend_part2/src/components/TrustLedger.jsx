import React, { useState, useEffect } from 'react';
import { Layers, TrendingUp, TrendingDown, Minus, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { fetchTrustLeaderboard, fetchTrustHistory } from '../api';

export default function TrustLedger() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  const loadTrustData = async () => {
    try {
      const lb = await fetchTrustLeaderboard();
      setLeaderboard(lb);
      if (!selectedSource && lb.length > 0) {
        loadHistory(lb[0].source_id);
      }
    } catch (err) {
      console.error('Error loading trust leaderboard:', err);
    }
  };

  const loadHistory = async (sourceId) => {
    try {
      setSelectedSource(sourceId);
      const logs = await fetchTrustHistory(sourceId);
      setHistoryLogs(logs);
    } catch (err) {
      console.error('Error loading trust history:', err);
    }
  };

  useEffect(() => {
    loadTrustData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="dossier-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Adaptive Source Trust Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Audit Trail Log: Per-Source-Per-Attribute Reliability Weight Adjustments Over Time
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            ● Real-Time Moving-Average Nudges
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Source Reliability Leaderboard */}
        <div className="dossier-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="font-mono font-bold text-white text-sm flex items-center justify-between">
            <span>Adaptive Trust Leaderboard</span>
            <span className="text-xs text-slate-400 font-normal">{leaderboard.length} Sources</span>
          </h3>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {leaderboard.map((item, idx) => {
              const isSelected = selectedSource === item.source_id;
              return (
                <div
                  key={idx}
                  onClick={() => loadHistory(item.source_id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold">{item.source_id}</span>
                    <span className={`flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.trend === 'UP' ? 'bg-emerald-500/20 text-emerald-400' : item.trend === 'DOWN' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.trend === 'UP' ? <TrendingUp className="w-3 h-3" /> : item.trend === 'DOWN' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      <span>w = {item.current_weight.toFixed(2)}</span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{item.adjustments_count} Adjustments</span>
                    <span>{item.last_adjustment ? item.last_adjustment.split(' ')[0] : 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Trail Log Details */}
        <div className="lg:col-span-2 dossier-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between font-mono border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">
              Audit Trail Ledger: <span className="text-indigo-300">{selectedSource || 'All Sources'}</span>
            </h3>
            <span className="text-xs text-slate-400">{historyLogs.length} Timestamped Events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 font-bold">Timestamp</th>
                  <th className="py-3 px-3 font-bold">Product</th>
                  <th className="py-3 px-3 font-bold">Attribute Type</th>
                  <th className="py-3 px-3 font-bold">Weight Adjustment</th>
                  <th className="py-3 px-3 font-bold">Action / Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {historyLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-3 font-bold text-cyan-300">{log.product_id}</td>
                    <td className="py-3 px-3 font-bold text-indigo-300">{log.attribute_type}</td>
                    <td className="py-3 px-3 font-bold">
                      <span className="text-slate-400">{log.old_weight.toFixed(2)}</span>
                      <span className="mx-1 text-slate-500">$\rightarrow$</span>
                      <span className={log.new_weight > log.old_weight ? "text-emerald-400" : "text-rose-400"}>
                        {log.new_weight.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
