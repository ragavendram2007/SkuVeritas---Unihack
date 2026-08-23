import React, { useState, useEffect } from 'react';
import { Play, RotateCw, CheckCircle2, AlertCircle, Cpu, Layers, Sparkles, Server } from 'lucide-react';

export default function BatchConsole({ onBatchEnrich, onRunAll }) {
  const [jobProgress, setJobProgress] = useState({ total: 1000, processed: 30, status: 'idle' });
  const [statusList, setStatusList] = useState([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/enrich/status');
      if (res.ok) {
        const data = await res.json();
        setJobProgress(data.job_progress || { total: 1000, processed: 30, status: 'idle' });
        setStatusList(data.batch_status_list || []);
      }
    } catch (e) {
      console.error('Error fetching batch status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBatchClick = async () => {
    setIsProcessingBatch(true);
    await onBatchEnrich();
    await fetchStatus();
    setIsProcessingBatch(false);
  };

  const progressPercent = Math.round((jobProgress.processed / jobProgress.total) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-sans tracking-tight">Dataset B Batch Enrichment Console</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Unihack 1000-Row Discovery $\rightarrow$ Extraction $\rightarrow$ Scoring $\rightarrow$ Classification $\rightarrow$ Delivery Export
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleBatchClick}
            disabled={isProcessingBatch}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isProcessingBatch ? 'animate-spin' : ''}`} />
            <span>{isProcessingBatch ? 'Enriching Batch...' : 'Enrich Curated Demo Batch'}</span>
          </button>

          <button
            onClick={onRunAll}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Queue Full 1000 Background Job</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-slate-300 font-bold flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Background Job Progress ({jobProgress.processed} / {jobProgress.total} SKUs)</span>
          </span>
          <span className="text-cyan-400 font-bold text-sm">{progressPercent}%</span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Live Status Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="font-bold text-white text-sm font-mono flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Live Enrichment Pipeline Queue</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {statusList.length} Processed Batch Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-bold">Mfg Part Num</th>
                <th className="py-3.5 px-4 font-bold">Manufacturer</th>
                <th className="py-3.5 px-4 font-bold">Category Taxonomy Path</th>
                <th className="py-3.5 px-4 font-bold">Sources</th>
                <th className="py-3.5 px-4 font-bold">Trust Score</th>
                <th className="py-3.5 px-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {statusList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">{item.mfg_part_num}</td>
                  <td className="py-3.5 px-4 text-slate-300">{item.part_manuf}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{item.category_path}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                      {item.sources_found} Discovered
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{item.overall_trust_score.toFixed(1)}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      item.status === 'done'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
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
