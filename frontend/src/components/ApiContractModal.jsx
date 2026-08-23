import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Terminal, ExternalLink } from 'lucide-react';

export default function ApiContractModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const jsonString = JSON.stringify(product, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-cyan-500/30">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm font-mono">Part 2 OpenAPI Contract Output</h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  200 OK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                GET /api/products/<span className="text-cyan-400 font-bold">{product.sku}</span>/resolved
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-5 bg-[#04060a] overflow-y-auto flex-1 font-mono text-xs text-cyan-300/90 leading-relaxed">
          <pre className="selection:bg-cyan-500 selection:text-black">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Interactive Swagger UI auto-docs served at <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center hover:text-cyan-300">http://localhost:8000/docs <ExternalLink className="w-3 h-3 ml-1" /></a></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
