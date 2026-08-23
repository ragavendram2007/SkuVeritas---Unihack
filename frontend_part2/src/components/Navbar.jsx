import React, { useState, useEffect } from 'react';
import { ShieldCheck, Layers, FileSpreadsheet, Activity, Wifi, WifiOff, FileText, Play, RotateCcw } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onStartPresenterMode, onDemoReset }) {
  const [part1Connected, setPart1Connected] = useState(true);

  // Real-time connectivity polling to Part 1 Backend (:8000)
  useEffect(() => {
    let isMounted = true;

    const checkPart1Health = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const res = await fetch('http://localhost:8000/', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (isMounted) setPart1Connected(res.ok);
      } catch (err) {
        if (isMounted) setPart1Connected(false);
      }
    };

    checkPart1Health();
    const interval = setInterval(checkPart1Health, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="border-b border-slate-800/90 bg-[#070a10]/95 backdrop-blur-md sticky top-0 z-[10] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                SkuVeritas <span className="text-indigo-400 font-normal">Part 2</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                Trust & Delivery Layer
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[280px]">
              Product Dossiers • 3-Tier Routing • Adaptive Source Trust
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden lg:flex items-center p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Operator Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('report')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'report'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Product Dossiers</span>
          </button>

          <button
            onClick={() => setActiveView('ledger')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'ledger'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Trust Ledger</span>
          </button>

          <button
            onClick={() => setActiveView('erp')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'erp'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>ERP Export</span>
          </button>
        </div>

        {/* Action Controls & Real-Time Resilience Indicator */}
        <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
          <button
            onClick={onStartPresenterMode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold transition-all"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Presenter Tour</span>
          </button>

          <button
            onClick={onDemoReset}
            title="Reset review actions & adaptive trust back to seed state"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Demo Reset</span>
          </button>

          {/* Real-time Connectivity Indicator */}
          {part1Connected ? (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Part 1 API Connected</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Using Cached Contract Data</span>
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
