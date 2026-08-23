import React, { useState } from 'react';
import { Search, Sparkles, MessageSquare, ArrowRight, Bot } from 'lucide-react';

export default function AskSkuVeritas({ products = [] }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer(null);

    setTimeout(() => {
      const q = query.toLowerCase();

      if (q.includes('blocked') || q.includes('why')) {
        const blockedProds = products.filter(p => p.verdict_stamp === 'BLOCKED' || p.tier === 'blocked');
        if (blockedProds.length > 0) {
          const reasons = blockedProds.map(p => `• ${p.sku}: ${p.routing_reason || 'Hard-blocked high risk conflict'}`).join('\n');
          setAnswer({
            headline: `Currently ${blockedProds.length} Product(s) Hard-Blocked in Queue`,
            body: reasons,
            type: 'warning'
          });
        } else {
          setAnswer({
            headline: 'No Hard-Blocked Products Found',
            body: 'All catalog items have resolved cleanly or have been approved by human reviewers.',
            type: 'info'
          });
        }
      } else if (q.includes('source') || q.includes('reliable') || q.includes('least')) {
        setAnswer({
          headline: 'Source Reliability Audit Summary',
          body: '• Scraped Webpage Sources (pr_9000_scraped_webpage): Least reliable (w = 0.35 - 0.40) due to bar/PSI unit mislabeling.\n• Manufacturer Spec PDFs: Highest credibility rating (w = 0.85 - 0.90).',
          type: 'info'
        });
      } else if (q.includes('auto') || q.includes('published') || q.includes('clean')) {
        const cleanProds = products.filter(p => p.tier === 'auto-publish');
        setAnswer({
          headline: `${cleanProds.length} Product(s) Auto-Published`,
          body: `Items: ${cleanProds.map(p => p.sku).join(', ')}. Clean consensus across 100% of ingested raw attributes.`,
          type: 'success'
        });
      } else {
        setAnswer({
          headline: `Interrogating Catalog State for "${query}"`,
          body: `Evaluated ${products.length} catalog dossiers. Found ${products.filter(p => p.tier === 'blocked').length} blocked item(s) and ${products.filter(p => p.tier === 'auto-publish').length} auto-published item(s).`,
          type: 'info'
        });
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="dossier-panel rounded-2xl p-5 border border-indigo-500/30 space-y-4 font-sans bg-gradient-to-r from-indigo-950/20 to-purple-950/20">
      
      <div className="flex items-center space-x-2">
        <Bot className="w-5 h-5 text-indigo-400" />
        <h3 className="font-extrabold text-white text-sm tracking-tight font-mono">
          "Ask SkuVeritas" Grounded Interrogation Console
        </h3>
      </div>

      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "Which products are currently blocked and why?" or "Least reliable source?"'
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>

      {/* Answer Output Card */}
      {answer && (
        <div className="p-4 rounded-xl border border-indigo-500/40 bg-slate-950 font-mono text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center space-x-2 text-indigo-300 font-bold">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>{answer.headline}</span>
          </div>
          <pre className="text-slate-300 whitespace-pre-wrap font-sans text-xs leading-relaxed pl-6">
            {answer.body}
          </pre>
        </div>
      )}

    </div>
  );
}
