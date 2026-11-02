"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ShieldAlert,
  Radio,
  Bug,
  Bot,
  Settings,
  ArrowRight,
  Flame,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  const actions = [
    { label: "Command Overview", category: "Navigation", href: "/dashboard", icon: ShieldAlert },
    { label: "Threat Feed & Telemetry", category: "Navigation", href: "/threats", icon: Radio },
    { label: "IOC Explorer & Lookup", category: "Navigation", href: "/iocs", icon: Search },
    { label: "CVE Intelligence Library", category: "Navigation", href: "/cves", icon: Bug },
    { label: "Early Warning Center", category: "Navigation", href: "/alerts", icon: ShieldAlert },
    { label: "AI Threat Analyst Chat", category: "Navigation", href: "/ai", icon: Bot },
    { label: "System Admin & Feeds", category: "Navigation", href: "/settings", icon: Settings },
    { label: "Investigate CVE-2024-3400 (PAN-OS)", category: "Intelligence Quick-Link", href: "/cves", icon: Flame },
    { label: "Inspect Malicious C2 IP 198.51.100.24", category: "Indicator Quick-Link", href: "/iocs", icon: Search },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-xl bg-white dark:bg-[#2E1B13] rounded-3xl border border-[#EBDDC6] dark:border-[#4A2E20] shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#EBDDC6] dark:border-[#4A2E20] bg-[#FDFAF4] dark:bg-[#23130C]">
          <Search className="w-5 h-5 text-[#CC5500]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, CVEs, indicators, actions..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#2A1810] dark:text-[#FDFAF4] focus:outline-none placeholder-[#7A5C48]"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#3B2418] border border-[#EBDDC6] text-[#7A5C48]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#7A5C48] font-mono">
              No matching commands or intelligence items.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8E1CC]/60 dark:hover:bg-[#3A2319] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FDFAF4] dark:bg-[#23130C] border border-[#EBDDC6] dark:border-[#4A2E20] flex items-center justify-center text-[#CC5500]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#2A1810] dark:text-[#FDFAF4] group-hover:text-[#CC5500] transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-[#7A5C48]">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D9C3A5] group-hover:text-[#CC5500] group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Helper */}
        <div className="p-3 border-t border-[#EBDDC6] dark:border-[#4A2E20] bg-[#FDFAF4] dark:bg-[#23130C] text-[10px] font-mono text-[#7A5C48] flex items-center justify-between">
          <span>Navigate with mouse or Enter</span>
          <span>EmberWatch Command Engine</span>
        </div>
      </div>
    </div>
  );
}
