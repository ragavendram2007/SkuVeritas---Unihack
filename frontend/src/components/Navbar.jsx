import React from 'react';
import { RefreshCw, FileCode, Cpu, LayoutGrid, Target, Server, FileSpreadsheet } from 'lucide-react';

export default function Navbar({ onRefresh, onOpenContract, activeView, setActiveView, isRefreshing, productCount = 4 }) {
  return (
    <header className="border-b border-slate-800/90 bg-[#060b14]/90 backdrop-blur-md sticky top-0 z-[10] shadow-lg font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                SkuVeritas <span className="text-cyan-400 font-normal">Part 1</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Data Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Catalog Truth & Diagnosis Engine</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden lg:flex items-center p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveView('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'catalog'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Catalog</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeView === 'catalog' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {productCount}
            </span>
          </button>

          <button
            onClick={() => setActiveView('matrix')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'matrix'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Matrix</span>
          </button>

          <button
            onClick={() => setActiveView('batch')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'batch'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Batch Console</span>
          </button>

          <button
            onClick={() => setActiveView('export')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'export'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Panel</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3.5 py-1.5 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Processing...' : 'Re-Ingest'}</span>
          </button>

          <button
            onClick={onOpenContract}
            className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Part 2 Contract</span>
          </button>
        </div>

      </div>
    </header>
  );
}
