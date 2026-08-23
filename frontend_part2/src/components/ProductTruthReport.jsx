import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Edit3, ChevronDown, ChevronUp, Layers, ArrowLeft, Info, Printer, Command } from 'lucide-react';
import VerdictStamp from './VerdictStamp';
import CredibilityDial from './CredibilityDial';
import EvidenceChainPanel from './EvidenceChainPanel';
import OverrideModal from './OverrideModal';
import { fetchRoutingDecision, fetchAttributeEvidence, submitHumanReview } from '../api';

export default function ProductTruthReport({ product, onBack, onRefreshData }) {
  const [routing, setRouting] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [attributeEvidence, setAttributeEvidence] = useState(null);
  const [overrideModalAttr, setOverrideModalAttr] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadRouting = async () => {
    if (!product) return;
    try {
      const r = await fetchRoutingDecision(product.sku);
      setRouting(r);
    } catch (err) {
      console.error('Error loading routing decision:', err);
    }
  };

  const loadEvidence = async (attrName) => {
    if (selectedAttribute === attrName) {
      setSelectedAttribute(null);
      setAttributeEvidence(null);
      return;
    }
    try {
      setSelectedAttribute(attrName);
      const ev = await fetchAttributeEvidence(product.sku, attrName);
      setAttributeEvidence(ev);
    } catch (err) {
      console.error('Error loading attribute evidence:', err);
    }
  };

  const handleApproveVerdict = async () => {
    try {
      setSubmittingAction(true);
      await submitHumanReview(product.sku, {
        product_id: product.sku,
        action: 'approve',
        reason: 'Approved by Senior Data Analyst (Reviewer #42)',
        reviewer: 'Senior Data Analyst (Reviewer #42)'
      });
      await loadRouting();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(err.message || 'Approve action failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAcceptDiagnosis = async () => {
    try {
      setSubmittingAction(true);
      await submitHumanReview(product.sku, {
        product_id: product.sku,
        action: 'accept_diagnosis',
        reason: 'Accepted AI Disagreement Diagnosis Explanation',
        reviewer: 'Senior Data Analyst (Reviewer #42)'
      });
      await loadRouting();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(err.message || 'Accept diagnosis failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOverrideSubmit = async (overrideData) => {
    await submitHumanReview(product.sku, overrideData);
    await loadRouting();
    if (onRefreshData) onRefreshData();
  };

  const handlePrintAuditReport = () => {
    window.print();
  };

  // Keyboard Shortcuts (A = approve, O = override, E = view evidence)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'a' || e.key === 'A') {
        handleApproveVerdict();
      } else if (e.key === 'o' || e.key === 'O') {
        setOverrideModalAttr({ name: Object.keys(product?.attributes || {})[0] || 'pressure_rating', value: '' });
      } else if (e.key === 'e' || e.key === 'E') {
        const firstAttr = Object.keys(product?.attributes || {})[0];
        if (firstAttr) loadEvidence(firstAttr);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  useEffect(() => {
    loadRouting();
  }, [product]);

  if (!product) return null;

  const attributes = product.attributes || {};

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Navigation & Keyboard Shortcuts Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog Queue</span>
        </button>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <button
            onClick={handlePrintAuditReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Audit Report (PDF)</span>
          </button>
          
          <span className="hidden sm:flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px]">
            <Command className="w-3 h-3 text-indigo-400" />
            <span>Shortcuts: [A] Approve | [O] Override | [E] Evidence</span>
          </span>
        </div>
      </div>

      {/* Flagship Case File Header */}
      <div className="dossier-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-bold">
              {product.sku}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {product.category_path || "Dept > Class > Fine"}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
            {product.product_name}
          </h1>
        </div>

        {/* Dial & Verdict Stamp Container */}
        <div className="flex items-center space-x-8 shrink-0">
          <CredibilityDial score={Math.round(product.overall_trust_score || 100)} size={110} />
          
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Routing Verdict Stamp</span>
            <VerdictStamp stamp={routing?.verdict_stamp || "AUTO-PUBLISHED"} size="large" />
          </div>
        </div>

      </div>

      {/* 3-Tier Routing Decision Banner */}
      {routing && (
        <div className={`p-5 rounded-2xl border flex items-start space-x-3 text-xs font-mono shadow-xl ${
          routing.tier === 'blocked'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : routing.tier === 'flagged'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
        }`}>
          <Info className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase text-sm tracking-wider">
              3-Tier Routing Decision: {routing.tier}
            </span>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {routing.reason}
            </p>
          </div>
        </div>
      )}

      {/* Attribute Evidence Table */}
      <div className="dossier-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between font-mono">
          <h3 className="font-bold text-white text-sm">Product Attribute Evidence Table</h3>
          <span className="text-xs text-slate-400">{Object.keys(attributes).length} Attributes Normalized</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {Object.entries(attributes).map(([attrName, attr], idx) => {
            const isExpanded = selectedAttribute === attrName;
            const sources = attr.sources || [];
            const totalW = sources.reduce((acc, s) => acc + (s.reliability_weight || 0), 0);

            return (
              <div key={idx} className="transition-colors">
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30">
                  
                  <div className="space-y-1 md:w-1/3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-cyan-300">{attrName}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        attr.criticality === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {attr.criticality}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-1.5 font-mono">
                      <span className="text-base font-bold text-white">{attr.resolved_value}</span>
                      <span className="text-xs text-slate-400">{attr.unit}</span>
                    </div>
                  </div>

                  {/* Stacked Percentage Breakdown */}
                  <div className="md:w-1/3 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Evidence Breakdown</span>
                      <span className="text-emerald-400 font-bold">{Math.round(attr.confidence * 100)}% Confidence</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      {sources.map((s, sIdx) => {
                        const pct = totalW > 0 ? (s.reliability_weight / totalW) * 100 : 0;
                        const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500'];
                        return (
                          <div
                            key={sIdx}
                            className={`h-full ${colors[sIdx % colors.length]}`}
                            style={{ width: `${pct}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
                    <button
                      onClick={() => loadEvidence(attrName)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Evidence' : 'View Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setOverrideModalAttr({ name: attrName, value: attr.resolved_value })}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Override</span>
                    </button>
                  </div>

                </div>

                {/* Inline Evidence Accordion Panel */}
                {isExpanded && attributeEvidence && (
                  <div className="px-4 pb-4 bg-slate-950/60">
                    <EvidenceChainPanel attributeEvidence={attributeEvidence} />
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Human Review Action Toolbar */}
      <div className="dossier-panel rounded-2xl p-6 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 font-mono">
        <div>
          <h4 className="font-bold text-white text-sm">Human Reviewer Operator Actions</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Take explicit action to update verdict stamp and trigger real-time Adaptive Source Trust adjustments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleApproveVerdict}
            disabled={submittingAction}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>[A] Approve Verdict</span>
          </button>

          <button
            onClick={handleAcceptDiagnosis}
            disabled={submittingAction}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept AI Diagnosis</span>
          </button>

          <button
            onClick={() => setOverrideModalAttr({ name: 'pressure_rating', value: '' })}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>[O] Override Value</span>
          </button>
        </div>
      </div>

      {/* Override Modal */}
      {overrideModalAttr && (
        <OverrideModal
          productId={product.sku}
          attributeName={overrideModalAttr.name}
          currentValue={overrideModalAttr.value}
          onClose={() => setOverrideModalAttr(null)}
          onSubmit={handleOverrideSubmit}
        />
      )}

    </div>
  );
}
