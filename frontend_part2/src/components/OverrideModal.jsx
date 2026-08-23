import React, { useState, useEffect, useRef } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';

export default function OverrideModal({ productId, attributeName, currentValue, onClose, onSubmit }) {
  const [overrideValue, setOverrideValue] = useState(currentValue || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const reasonInputRef = useRef(null);

  useEffect(() => {
    // Focus reason input on mount
    if (reasonInputRef.current) {
      reasonInputRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to body/main container on unmount
      if (document.body) document.body.focus();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !reason.trim()) {
      setError('An explicit justification reason is strictly required to perform a human override.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        product_id: productId,
        action: 'override',
        attribute_name: attributeName,
        override_value: overrideValue,
        reason: reason.trim(),
        reviewer: 'Senior Data Analyst (Reviewer #42)'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit override');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[30] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="dossier-panel rounded-2xl w-full max-w-lg border border-cyan-500/40 shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Human Reviewer Override</h3>
              <p className="text-[11px] text-slate-400">Product: <span className="text-cyan-300 font-bold">{productId}</span></p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300">Target Attribute</label>
            <input
              type="text"
              readOnly
              value={attributeName || 'Overall Dossier'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300">New Override Value</label>
            <input
              type="text"
              value={overrideValue}
              onChange={(e) => setOverrideValue(e.target.value)}
              placeholder="e.g. 200 PSI"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>Justification Reason <span className="text-rose-400">* Required</span></span>
            </label>
            <textarea
              ref={reasonInputRef}
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Verified against physical manufacturer datasheet attached. Scraped webpage value 300 PSI was a unit mislabeling."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all font-mono"
            >
              {submitting ? 'Submitting...' : 'Apply Human Override'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
