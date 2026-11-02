"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = target.closest("button, a, input, select, [data-cursor]");
      if (isInteractive) {
        setHovered(true);
        const customText = isInteractive.getAttribute("data-cursor");
        setCursorText(customText || "");
      } else {
        setHovered(false);
        setCursorText("");
      }
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Smooth trailing spring effect
  useEffect(() => {
    let animId: number;
    const follow = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(follow);
    };
    animId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animId);
  }, [pos]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Center Lead Dot */}
      <div
        className="fixed w-2.5 h-2.5 -ml-1.25 -mt-1.25 rounded-full bg-[#CC5500] pointer-events-none transition-transform duration-75 ease-out"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      />

      {/* Trailing Soft Ring */}
      <div
        className={`fixed rounded-full border border-[#CC5500] pointer-events-none flex items-center justify-center transition-all duration-200 ease-out ${
          hovered
            ? "w-14 h-14 -ml-7 -mt-7 bg-[#CC5500]/15 scale-110"
            : "w-8 h-8 -ml-4 -mt-4 opacity-50"
        }`}
        style={{ transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)` }}
      >
        {cursorText && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FDFAF4] drop-shadow">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
