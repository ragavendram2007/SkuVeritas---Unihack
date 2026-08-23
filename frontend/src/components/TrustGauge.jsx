import React from 'react';

export default function TrustGauge({ score, size = 68, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // Green (> 95%)
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let gradientId = 'gauge-emerald';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (score < 90) {
    strokeColor = '#f43f5e'; // Crimson (< 90%)
    glowColor = 'rgba(244, 63, 94, 0.4)';
    gradientId = 'gauge-rose';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (score < 96) {
    strokeColor = '#f59e0b'; // Amber (90 - 95%)
    glowColor = 'rgba(245, 158, 11, 0.4)';
    gradientId = 'gauge-amber';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 filter drop-shadow-md">
        <defs>
          <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="gauge-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 6px ${glowColor})`
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-extrabold text-sm tracking-tighter text-white font-mono leading-none">
          {score}%
        </span>
        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5 scale-90">
          Trust
        </span>
      </div>
    </div>
  );
}
