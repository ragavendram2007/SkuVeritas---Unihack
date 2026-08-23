import React, { useState, useEffect } from 'react';
import { Layers, FileSpreadsheet, Activity, Wifi, WifiOff, FileText, Play, RotateCcw } from 'lucide-react';

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
    <header className="border-b border-[#151a23] bg-[#040608]/85 backdrop-blur-md sticky top-0 z-[10] shadow-lg font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Unify Brand */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <span className="brand-mark">S</span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono brand">
                SkuVeritas <span className="text-[#38d4ff] font-normal">Part 2</span>
              </span>
              <span className="eyebrow text-[10px] py-0.5 px-2">
                <span className="dot" /> TRUST & DELIVERY
              </span>
            </div>
            <p className="text-[11px] text-[#98a1b0] font-mono mt-0.5 truncate max-w-[280px]">
              Product Dossiers • 3-Tier Routing • Adaptive Trust
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden lg:flex items-center p-1 bg-[#0d1017] border border-[#1c222d] rounded-xl text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-[#38d4ff] to-[#0ea5e9] text-white shadow-lg'
                : 'text-[#98a1b0] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Operator Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('report')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'report'
                ? 'bg-gradient-to-r from-[#38d4ff] to-[#0ea5e9] text-white shadow-lg'
                : 'text-[#98a1b0] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Product Dossiers</span>
          </button>

          <button
            onClick={() => setActiveView('ledger')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'ledger'
                ? 'bg-gradient-to-r from-[#38d4ff] to-[#0ea5e9] text-white shadow-lg'
                : 'text-[#98a1b0] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Trust Ledger</span>
          </button>

          <button
            onClick={() => setActiveView('erp')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'erp'
                ? 'bg-gradient-to-r from-[#38d4ff] to-[#0ea5e9] text-white shadow-lg'
                : 'text-[#98a1b0] hover:text-white'
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
            className="btn btn-primary btn-sm font-bold"
          >
            <Play className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Presenter Tour</span>
          </button>

          <button
            onClick={onDemoReset}
            title="Reset review actions & adaptive trust back to seed state"
            className="btn btn-ghost btn-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Demo Reset</span>
          </button>

          {/* Real-time Connectivity Indicator */}
          {part1Connected ? (
            <span className="eyebrow border-emerald-500/30 text-emerald-300">
              <span className="dot bg-emerald-400" />
              <span className="hidden md:inline">Part 1 Connected</span>
            </span>
          ) : (
            <span className="eyebrow border-amber-500/30 text-amber-300">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">Using Cached Data</span>
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
