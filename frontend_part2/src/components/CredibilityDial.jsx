import React from 'react';

export default function CredibilityDial({ score = 100, size = 90 }) {
  const angle = (score / 100) * 180 - 90; // -90 to +90 deg

  let color = "#10b981"; // Emerald
  let ratingLabel = "HIGH CREDIBILITY";
  if (score < 90) {
    color = "#f43f5e"; // Crimson
    ratingLabel = "HARD BLOCKED";
  } else if (score < 96) {
    color = "#f59e0b"; // Amber
    ratingLabel = "MODERATE RISK";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center font-mono radial-glow-cyan relative z-10">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10} viewBox="0 0 100 60">
          {/* Background Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Color Progress Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset={126 - (score / 100) * 126}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
          {/* Pointer Dial Needle */}
          <g transform={`rotate(${angle} 50 50)`} style={{ transition: 'transform 0.8s ease-out' }}>
            <line x1="50" y1="50" x2="50" y2="18" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="5" fill={color} />
          </g>
        </svg>
      </div>

      <span className="text-base font-extrabold text-white mt-1">{score}%</span>
      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300 mt-0.5">{ratingLabel}</span>
    </div>
  );
}
