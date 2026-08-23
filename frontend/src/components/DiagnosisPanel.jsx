import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Cpu, Clock, Scale, GitFork, ArrowRight, Info, Sparkles, ShieldCheck } from 'lucide-react';

export default function DiagnosisPanel({ attributeName, attributeData }) {
  const diagnosis = attributeData.diagnosis;
  if (!diagnosis) return null;

  const sources = attributeData.sources || [];
  const reasoningTrail = diagnosis.reasoning_trail || [];

  return (
    <div className="bg-[#080b12] border border-amber-500/40 rounded-2xl p-6 mt-4 space-y-6 shadow-2xl relative overflow-hidden glow-amber">
      
      {/* Ambient glowing backdrop circle */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Verdict Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 rounded-xl text-amber-400 shadow-lg shadow-amber-500/10">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-white text-base font-mono tracking-tight">
                Disagreement Diagnosis Pass
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Automated Root Cause
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Attribute under audit: <span className="text-amber-200 font-bold font-mono">{attributeName}</span>
            </p>
          </div>
        </div>

        {/* Verdict Metrics */}
        <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-xl backdrop-blur-md">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Classified Cause</span>
            <span className="text-sm font-extrabold text-amber-300 font-mono">{diagnosis.cause}</span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">AI Confidence Score</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              {Math.round(diagnosis.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 1. Interactive Reasoning Trail Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 font-mono">
            <GitFork className="w-4 h-4 text-cyan-400" />
            <span>Sequential Decision Structure</span>
          </h5>
          <span className="text-[11px] text-slate-500 font-mono">Deterministic Checks First $\rightarrow$ LLM Fallback</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {reasoningTrail.map((step, idx) => {
            const isFired = step.passed;
            return (
              <div
                key={idx}
                className={`relative p-4 rounded-xl border text-xs transition-all duration-300 ${
                  isFired
                    ? 'bg-gradient-to-br from-amber-500/15 to-orange-600/10 border-amber-500/50 text-amber-200 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between font-mono mb-2">
                  <span className={`font-bold text-[11px] ${isFired ? 'text-amber-300' : 'text-slate-400'}`}>
                    Check #{idx + 1}: {step.step}
                  </span>
                  {isFired ? (
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>FIRED</span>
                    </span>
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed line-clamp-3 font-sans">
                  {step.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Source Comparison & Weight Strip */}
      <div className="space-y-3 pt-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 font-mono">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Source Comparison & Reliability Prior Weight Strip</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sources.map((src, i) => {
            const isMajority = String(src.value).toLowerCase() === String(attributeData.resolved_value).toLowerCase();
            return (
              <div
                key={i}
                className={`p-4 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isMajority
                    ? 'bg-slate-900/80 border-slate-700/80'
                    : 'bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-200">
                      {src.source_id}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                      w = {src.reliability_weight}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline space-x-1 font-mono">
                    <span className={`text-lg font-extrabold ${isMajority ? 'text-white' : 'text-rose-300 font-extrabold'}`}>
                      {src.value}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{src.unit}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className={`font-bold ${isMajority ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isMajority ? 'Majority Consensus' : 'Outlier Discrepancy'}
                  </span>
                  <span className="flex items-center text-slate-500">
                    <Clock className="w-3 h-3 mr-1 inline text-slate-400" />
                    {src.last_modified ? src.last_modified.split('T')[0] : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Plain English Explanation Summary */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs backdrop-blur-md">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-200 font-mono">Diagnosis Synthesis Explanation: </span>
          <span className="text-slate-300">{diagnosis.explanation}</span>
        </div>
      </div>

    </div>
  );
}
