import React from "react";

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low" | "info" | string;
  size?: "sm" | "md";
}

export default function SeverityBadge({ severity, size = "md" }: SeverityBadgeProps) {
  const sev = (severity || "info").toLowerCase();

  let bgClass = "bg-[var(--sev-info-bg)] text-[var(--sev-info)] border-[#D4CAC0]";
  let label = severity ? severity.toUpperCase() : "INFO";

  if (sev === "critical") {
    bgClass = "bg-[var(--sev-critical-bg)] text-[var(--sev-critical)] border-[#E2B7AE]";
  } else if (sev === "high") {
    bgClass = "bg-[var(--sev-high-bg)] text-[var(--sev-high)] border-[#E8C2A8]";
  } else if (sev === "medium") {
    bgClass = "bg-[var(--sev-medium-bg)] text-[var(--sev-medium)] border-[#E5CCA0]";
  } else if (sev === "low") {
    bgClass = "bg-[var(--sev-low-bg)] text-[var(--sev-low)] border-[#B5CCA9]";
  }

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-full border ${bgClass} ${sizeClass} tracking-wider transition-colors`}
    >
      {label}
    </span>
  );
}
