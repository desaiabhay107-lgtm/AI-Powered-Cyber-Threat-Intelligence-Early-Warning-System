"use client";

import React from "react";

interface RiskGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export default function RiskGauge({
  score,
  label = "Perimeter Exposure Index",
  size = 240,
}: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score || 0)));
  // Angle spans -90 to +90 degrees
  const rotationAngle = (clamped / 100) * 180 - 90;

  let scoreColor = "text-[#6B8F5E]";
  let statusText = "SECURE / LOW EXPOSURE";
  let statusBadge = "bg-[#E3ECDD] text-[#6B8F5E] border-[#B5CCA9]";

  if (clamped >= 80) {
    scoreColor = "text-[#A8321C]";
    statusText = "CRITICAL / ACTION REQUIRED";
    statusBadge = "bg-[#F6DDD6] text-[#A8321C] border-[#E2B7AE]";
  } else if (clamped >= 60) {
    scoreColor = "text-[#CC5500]";
    statusText = "ELEVATED VULNERABILITY";
    statusBadge = "bg-[#F8E1CC] text-[#CC5500] border-[#E8C2A8]";
  } else if (clamped >= 40) {
    scoreColor = "text-[#D99A2B]";
    statusText = "MODERATE POSTURE";
    statusBadge = "bg-[#FAEBC8] text-[#D99A2B] border-[#E5CCA0]";
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full select-none">
      <div className="relative flex flex-col items-center justify-center" style={{ width: size }}>
        <svg
          viewBox="0 0 200 120"
          className="w-full overflow-visible"
        >
          <defs>
            <linearGradient id="warmGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6B8F5E" />
              <stop offset="35%" stopColor="#D99A2B" />
              <stop offset="70%" stopColor="#CC5500" />
              <stop offset="100%" stopColor="#A8321C" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke="var(--cream-200)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Value Colored Arc */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke="url(#warmGaugeGrad)"
            strokeWidth="14"
            strokeDasharray="235.6"
            strokeDashoffset={235.6 - (235.6 * clamped) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle */}
          <g
            transform={`rotate(${rotationAngle} 100 105)`}
            className="transition-transform duration-1000 ease-out"
          >
            <line
              x1="100"
              y1="105"
              x2="100"
              y2="38"
              stroke="var(--chocolate-900)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="105" r="7" fill="var(--chocolate-900)" />
            <circle cx="100" cy="105" r="3" fill="#FDFAF4" />
          </g>
        </svg>

        {/* Big Clear Score Below Arc (No overlap!) */}
        <div className="mt-2 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-serif font-bold tracking-tight ${scoreColor}`}>
              {clamped}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)] font-semibold">
              /100
            </span>
          </div>

          <span className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusBadge}`}>
            {statusText}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs font-serif font-semibold text-[var(--text-secondary)] text-center">
        {label}
      </p>
    </div>
  );
}
