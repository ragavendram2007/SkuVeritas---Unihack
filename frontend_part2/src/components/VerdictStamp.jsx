import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Edit3 } from 'lucide-react';

export default function VerdictStamp({ stamp = "AUTO-PUBLISHED", size = "normal" }) {
  const normStamp = (stamp || "AUTO-PUBLISHED").toUpperCase();

  let colorClasses = "bg-purple-500/10 text-purple-200 border-purple-500/40 shadow-lg shadow-purple-500/20";
  let icon = <CheckCircle2 className="w-4 h-4 mr-1.5 inline" />;

  if (normStamp === "APPROVED") {
    colorClasses = "bg-emerald-500/15 text-emerald-200 border-emerald-500/50 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30";
    icon = <ShieldCheck className="w-4 h-4 mr-1.5 inline text-emerald-400" />;
  } else if (normStamp === "OVERRIDDEN") {
    colorClasses = "bg-cyan-500/15 text-cyan-200 border-cyan-500/50 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/30";
    icon = <Edit3 className="w-4 h-4 mr-1.5 inline text-cyan-400" />;
  } else if (normStamp === "BLOCKED") {
    colorClasses = "bg-rose-500/20 text-rose-200 border-rose-500/60 shadow-lg shadow-rose-500/30 ring-1 ring-rose-500/40";
    icon = <ShieldAlert className="w-4 h-4 mr-1.5 inline text-rose-400" />;
  } else if (normStamp === "FLAGGED") {
    colorClasses = "bg-amber-500/15 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/30";
    icon = <AlertTriangle className="w-4 h-4 mr-1.5 inline text-amber-400" />;
  }

  const isLarge = size === "large";

  return (
    <div className="relative inline-block transition-all duration-300">
      <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md font-mono font-extrabold uppercase tracking-widest flex items-center justify-center ${colorClasses} ${
        isLarge ? 'text-sm px-6 py-2 border-2' : 'text-xs'
      }`}>
        {icon}
        <span>{normStamp}</span>
      </div>
    </div>
  );
}
