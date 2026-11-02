"use client";

import React, { useEffect, useRef, useState } from "react";

interface EmberEyeProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export default function EmberEyeArtwork({
  size = 520,
  className = "",
  interactive = true,
}: EmberEyeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize -1 to +1
      const x = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const y = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  // Compute pupil parallax offset (max 18px)
  const pupilOffsetX = mousePos.x * 16;
  const pupilOffsetY = mousePos.y * 12;

  // Generate halftone concentric rings
  const rings = [
    { r: 210, dots: 54, size: 2.2, color: "#D9C3A5", opacity: 0.35 },
    { r: 185, dots: 48, size: 2.5, color: "#D9C3A5", opacity: 0.45 },
    { r: 160, dots: 42, size: 2.8, color: "#F6EEDF", opacity: 0.6 },
    { r: 135, dots: 36, size: 3.2, color: "#F6EEDF", opacity: 0.75 },
    { r: 110, dots: 30, size: 3.8, color: "#CC5500", opacity: 0.85 },
    { r: 85, dots: 24, size: 4.2, color: "#CC5500", opacity: 0.95 },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Radial ambient glow */}
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC5500" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#A8321C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2A1810" stopOpacity="0" />
          </radialGradient>

          {/* Iris flame gradient */}
          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#A8321C" />
            <stop offset="50%" stopColor="#CC5500" />
            <stop offset="100%" stopColor="#F8E1CC" />
          </linearGradient>

          {/* Radar sweep gradient */}
          <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CC5500" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#CC5500" stopOpacity="0" />
          </linearGradient>

          <filter id="flameBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx="250" cy="250" r="230" fill="url(#eyeGlow)" />

        {/* Outer Engraved / Halftone Rings */}
        {rings.map((ring, ringIdx) => (
          <g key={ringIdx}>
            {Array.from({ length: ring.dots }).map((_, i) => {
              const angle = (i / ring.dots) * 2 * Math.PI;
              const cx = 250 + ring.r * Math.cos(angle);
              const cy = 250 + ring.r * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={ring.size}
                  fill={ring.color}
                  opacity={ring.opacity}
                  className="transition-opacity duration-700"
                />
              );
            })}
          </g>
        ))}

        {/* Radar Sweep Arc (Slow animated sweep) */}
        <g className="animate-[spin_12s_linear_infinite] origin-center">
          <line
            x1="250"
            y1="250"
            x2="450"
            y2="250"
            stroke="url(#radarSweep)"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </g>

        {/* Engraved Eye Contour Outlines */}
        {/* Upper eyelid contour */}
        <path
          d="M 60 250 C 130 140, 370 140, 440 250"
          fill="none"
          stroke="#F6EEDF"
          strokeWidth="2.5"
          strokeDasharray="3 3"
          opacity="0.75"
        />
        {/* Lower eyelid contour */}
        <path
          d="M 60 250 C 130 360, 370 360, 440 250"
          fill="none"
          stroke="#F6EEDF"
          strokeWidth="2.5"
          strokeDasharray="3 3"
          opacity="0.75"
        />

        {/* Halftone Lashes (Radiating engraved dash ticks) */}
        {Array.from({ length: 32 }).map((_, idx) => {
          const t = idx / 31;
          const x = 70 + t * 360;
          // Curve for upper lid: y = 250 - 110 * sin(t * PI)
          const y = 250 - 100 * Math.sin(t * Math.PI);
          const dy = -18 * Math.sin(t * Math.PI);
          return (
            <line
              key={idx}
              x1={x}
              y1={y}
              x2={x}
              y2={y + dy}
              stroke="#D9C3A5"
              strokeWidth="1.5"
              opacity="0.6"
            />
          );
        })}

        {/* Moving Sclera / Iris Group (tracks cursor parallax) */}
        <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`} className="transition-transform duration-200 ease-out">
          {/* Eyeball / Outer Iris Ring */}
          <circle
            cx="250"
            cy="250"
            r="65"
            fill="#2A1810"
            stroke="#CC5500"
            strokeWidth="3"
            className="shadow-xl"
          />

          {/* Iris Radiating Sunburst / Engraved Rays */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI;
            const x1 = 250 + 26 * Math.cos(angle);
            const y1 = 250 + 26 * Math.sin(angle);
            const x2 = 250 + 60 * Math.cos(angle);
            const y2 = 250 + 60 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#D9C3A5"
                strokeWidth="1.2"
                opacity="0.5"
              />
            );
          })}

          {/* Core Flame Pupil */}
          <g transform="translate(250, 250)">
            {/* Soft flame aura */}
            <path
              d="M 0 -24 C 14 -12, 18 10, 0 24 C -18 10, -14 -12, 0 -24 Z"
              fill="url(#flameGrad)"
              filter="url(#flameBlur)"
              opacity="0.7"
            />
            {/* Sharp inner flame */}
            <path
              d="M 0 -22 C 11 -10, 14 8, 0 20 C -14 8, -11 -10, 0 -22 Z"
              fill="url(#flameGrad)"
            />
            {/* White-hot center ember */}
            <circle cx="0" cy="4" r="5" fill="#FDFAF4" opacity="0.9" />
          </g>

          {/* Lens Reflection Highlight */}
          <ellipse
            cx="235"
            cy="232"
            rx="12"
            ry="6"
            transform="rotate(-25 235 232)"
            fill="#FFFFFF"
            opacity="0.75"
          />
        </g>
      </svg>
    </div>
  );
}
