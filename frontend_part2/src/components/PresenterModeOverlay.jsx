import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

const STEPS = [
  {
    title: "1. Catalog Overview",
    desc: "Ingests 4 raw sources per product across Dataset A (Synthetic Control) and Dataset B (Discovered Web Sources).",
    highlight: "Catalog & Trust Score Overview"
  },
  {
    title: "2. Flagged Conflict Dossier (PR-9000)",
    desc: "Exposes value discrepancies side-by-side: 200 PSI on ERP & PDF vs 300 PSI on scraped webpage.",
    highlight: "Side-by-Side Source Discrepancies"
  },
  {
    title: "3. Disagreement Diagnosis Stepper",
    desc: "4-Tier deterministic decision pipeline fires Step 1 (Unit Conversion check: 300 PSI ≈ 20.7 bar unit mislabel).",
    highlight: "Reasoning Trail Stepper"
  },
  {
    title: "4. 3-Tier Routing Engine Decision",
    desc: "Evaluates hard-block threshold: pressure_rating risk 0.145 exceeds 0.10 limit → BLOCKED verdict stamp.",
    highlight: "BLOCKED Verdict Stamp"
  },
  {
    title: "5. Human Review Action",
    desc: "Analyst performs an explicit Override Action with justification reason 'Verified manufacturer spec sheet'.",
    highlight: "Verdict Stamp updates to OVERRIDDEN"
  },
  {
    title: "6. Adaptive Source Trust Ledger",
    desc: "System nudges unreliable source weight down (0.40 → 0.35) and logs event in audit trail.",
    highlight: "Trust Ledger Audit Trail"
  },
  {
    title: "7. Operator Impact Metrics",
    desc: "Live-computed banner reflects 100% verified catalog trust, zero un-reviewed leaks to ERP export.",
    highlight: "Session Impact Metrics"
  }
];

export default function PresenterModeOverlay({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (isInput) return;

      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const step = STEPS[currentStep];

  return (
    <div className="fixed bottom-6 right-6 z-[40] w-full max-w-md font-sans animate-fadeIn">
      <div className="dossier-panel rounded-2xl p-5 border-2 border-indigo-500/50 shadow-2xl bg-slate-950/95 space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between font-mono border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-indigo-300 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Presenter Mode ({currentStep + 1} / {STEPS.length})</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm font-mono">{step.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{step.desc}</p>
          <p className="text-[11px] text-cyan-300 font-mono pt-1">
            🔍 <strong>Focus:</strong> {step.highlight}
          </p>
        </div>

        {/* Controls */}
        <div className="pt-2 flex items-center justify-between font-mono text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-[10px] text-slate-500">Right Arrow / Esc</span>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1 shadow-lg shadow-indigo-500/20"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
