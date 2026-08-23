import React from 'react';
import { Database, RefreshCw, FileCode, Cpu, Activity, LayoutGrid, Target, Sparkles, Server, FileSpreadsheet } from 'lucide-react';

export default function Navbar({ onRefresh, onOpenContract, activeView, setActiveView, isRefreshing, productCount = 4 }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#07090e]/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                SkuVeritas
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Part 1 Complete
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Dataset A & Dataset B Web Discovery Engine</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden lg:flex items-center p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveView('catalog')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeView === 'catalog'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeView === 'matrix'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Matrix</span>
          </button>

          <button
            onClick={() => setActiveView('batch')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeView === 'batch'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Batch Console</span>
          </button>

          <button
            onClick={() => setActiveView('export')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeView === 'export'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Panel</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 hover:border-cyan-500/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Processing...' : 'Re-Ingest'}</span>
          </button>

          <button
            onClick={onOpenContract}
            className="flex items-center space-x-2 text-xs font-semibold bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-2 rounded-xl transition-all duration-200 shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Part 2 Contract</span>
          </button>
        </div>

      </div>
    </header>
  );
}
