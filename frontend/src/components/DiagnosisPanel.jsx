import React from 'react';
import { CheckCircle2, XCircle, Cpu, Scale, GitFork, Info } from 'lucide-react';

export default function DiagnosisPanel({ attributeName, attributeData }) {
  const diagnosis = attributeData.diagnosis;
  if (!diagnosis) return null;

  const sources = attributeData.sources || [];
  const reasoningTrail = diagnosis.reasoning_trail || [];

  return (
    <div className="glass-card p-6 mt-4 space-y-6 relative overflow-hidden radial-glow-cyan">
      
      {/* Header Verdict Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-pill">◆ DIAGNOSIS STEPPER</span>
              <h4 className="font-extrabold text-white text-base font-mono tracking-tight">
                Disagreement Diagnosis Pass
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Attribute under audit: <span className="text-cyan-300 font-bold">{attributeName}</span>
            </p>
          </div>
        </div>

        {/* Verdict Metrics */}
        <div className="flex items-center space-x-4 bg-slate-950/80 border border-slate-800/80 px-5 py-2.5 rounded-xl backdrop-blur-md">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block font-mono">Classified Cause</span>
            <span className="text-sm font-extrabold text-cyan-300 font-mono">{diagnosis.cause}</span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block font-mono">AI Confidence Score</span>
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
          <span className="text-[11px] text-slate-400 font-mono">Deterministic Checks First → LLM Fallback</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {reasoningTrail.map((step, idx) => {
            const isFired = step.passed;
            return (
              <div
                key={idx}
                className={`relative p-4 rounded-xl border text-xs transition-all duration-300 ${
                  isFired
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between font-mono mb-2">
                  <span className={`font-bold text-[11px] ${isFired ? 'text-cyan-300' : 'text-slate-400'}`}>
                    Check #{idx + 1}: {step.step}
                  </span>
                  {isFired ? (
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>FIRED</span>
                    </span>
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                  {step.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Source Comparison Strip */}
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
                    ? 'bg-slate-950/80 border-slate-800/80'
                    : 'bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <span className="text-[11px] font-bold text-slate-200 truncate" title={src.source_id}>
                      {src.source_id}
                    </span>
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold shrink-0">
                      w = {src.reliability_weight}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline space-x-1 font-mono">
                    <span className={`text-lg font-extrabold ${isMajority ? 'text-white' : 'text-rose-300'}`}>
                      {src.value}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{src.unit}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className={`font-bold ${isMajority ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isMajority ? 'Majority Consensus' : 'Outlier Discrepancy'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Plain English Explanation Summary */}
      <div className="p-4 bg-slate-950/90 border border-slate-800/80 rounded-xl flex items-start space-x-3 text-xs backdrop-blur-md">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed font-sans">
          <strong className="text-white font-mono">Diagnosis Synthesis Explanation: </strong>
          <span className="text-slate-300">{diagnosis.explanation}</span>
        </div>
      </div>

    </div>
  );
}
