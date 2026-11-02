"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sun,
  Moon,
  RotateCw,
  Sliders,
  ChevronDown,
  Bell,
  CheckCircle2,
  RefreshCw,
  Database,
} from "lucide-react";
import CommandPalette from "@/components/CommandPalette";

interface TopBarProps {
  threatLevel?: "Elevated" | "High" | "Severe";
  role?: string;
}

export default function TopBar({
  threatLevel = "High",
  role = "admin",
}: TopBarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [feedMenuOpen, setFeedMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("emberwatch_theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
      if (saved === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setFeedMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("emberwatch_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleSyncFeed = async (feedKey: string, feedName: string) => {
    setSyncing(true);
    setFeedMenuOpen(false);
    try {
      const res = await fetch(`/api/v1/admin/feeds/${feedKey}/run`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Synced ${json.data?.recordsIngested ?? "live"} records from ${feedName}`);
      } else {
        setFeedback(`Sync completed: ${json.message || "Up to date"}`);
      }
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      setFeedback("Feed sync network error");
    } finally {
      setSyncing(false);
    }
  };

  const levelColor =
    threatLevel === "Severe"
      ? "bg-[#F6DDD6] text-[#A8321C] border-[#E2B7AE]"
      : threatLevel === "High"
      ? "bg-[#F8E1CC] text-[#CC5500] border-[#E8C2A8]"
      : "bg-[#FAEBC8] text-[#D99A2B] border-[#E5CCA0]";

  const notifications = [
    { title: "Critical KEV Match: CVE-2024-3400 PAN-OS", time: "15m ago", type: "critical" },
    { title: "Malicious IOC Hit on Monitored Gateway", time: "45m ago", type: "critical" },
    { title: "Phishing Lookalike Domain Detected", time: "3h ago", type: "high" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-md px-6 flex items-center justify-between transition-colors select-none flex-shrink-0">
        {/* Global Search / Command Bar Trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full relative flex items-center pl-9 pr-12 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:border-[#CC5500] transition-colors text-left"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <span>Search CVEs, IOCs, threat actors...</span>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {feedback && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#E3ECDD] text-[#6B8F5E] border border-[#B5CCA9] animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> {feedback}
            </div>
          )}

          {/* Global Threat Level Pill */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${levelColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-tight">
              THREAT: {threatLevel.toUpperCase()}
            </span>
          </div>

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A8321C] animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-xl z-50 animate-fade-in text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="font-serif font-bold text-xs text-[var(--text-primary)]">
                    Early-Warning Notifications
                  </span>
                  <span className="text-[10px] font-mono text-[#CC5500] font-bold">VERIFIED FEEDS</span>
                </div>
                <div className="space-y-1.5">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#CC5500] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                        <span className="text-[#A8321C] font-bold uppercase">{n.type}</span>
                        <span>{n.time}</span>
                      </div>
                      <div className="font-semibold text-xs text-[var(--text-primary)] mt-1">
                        {n.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Feed Ingestion Sync Menu */}
          {role === "admin" && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setFeedMenuOpen(!feedMenuOpen)}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] hover:border-[#CC5500] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#CC5500] ${syncing ? "animate-spin" : ""}`} />
                <span className="hidden md:inline">Sync Feeds</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {feedMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-xl z-50 animate-fade-in text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">
                    External Intelligence Sync
                  </div>
                  <button
                    onClick={() => handleSyncFeed("cisa_kev", "CISA KEV")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#CC5500]" />
                    <div>
                      <div className="font-semibold">Sync CISA KEV Catalog</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Real exploited vulnerabilities</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSyncFeed("abuse_ch", "abuse.ch Feeds")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-[#A8321C]" />
                    <div>
                      <div className="font-semibold">Sync ThreatFox & URLhaus</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Verified live malware IOCs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSyncFeed("first_epss", "FIRST EPSS")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#6B8F5E]" />
                    <div>
                      <div className="font-semibold">Sync FIRST EPSS Scores</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Real exploit probabilities</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle (Cream vs Espresso) */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Espresso (Dark)" : "Cream (Light)"} theme`}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
