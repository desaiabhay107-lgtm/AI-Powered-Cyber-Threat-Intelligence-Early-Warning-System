"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowRight,
  Shield,
  Radio,
  Search,
  Bug,
  Bot,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Globe,
  BellRing,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import EmberEyeArtwork from "@/components/EmberEyeArtwork";
import CustomCursor from "@/components/CustomCursor";

export default function RedesignedLandingPage() {
  // Preloader state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [fullNavOpen, setFullNavOpen] = useState(false);

  // Live Stats
  const [stats, setStats] = useState({
    threats: 312,
    iocs: 1520,
    cves: 155,
    alerts: 40,
  });

  useEffect(() => {
    // 1.5s preloader timer (0 -> 100)
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPreloaderDone(true), 250);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    // Nav scroll tracker
    const handleScroll = () => {
      if (window.scrollY > 80) setNavScrolled(true);
      else setNavScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch live summary stats
    fetch("/api/v1/dashboard/summary")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats({
            threats: json.data.kpis.activeThreats.value || 312,
            iocs: 1520,
            cves: 155,
            alerts: json.data.kpis.criticalAlerts.value || 40,
          });
        }
      })
      .catch(() => {});

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden select-none">
      <CustomCursor />

      {/* 1. Preloader Overlay (1.5s curtain split) */}
      {!preloaderDone && (
        <div
          className={`fixed inset-0 z-[1000] bg-[#2A1810] flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
            loadingProgress >= 100 ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#CC5500] text-white flex items-center justify-center shadow-2xl animate-pulse">
              <Flame className="w-7 h-7" />
            </div>
            <div className="font-serif text-2xl tracking-tight text-[#FDFAF4]">
              EmberWatch
            </div>
            <div className="w-48 h-1 bg-[#3B2418] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#CC5500] transition-all duration-75"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="font-mono text-xs text-[#D9C3A5]">
              INITIALIZING TELEMETRY • {loadingProgress}%
            </span>
          </div>
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 transition-all duration-300 ${
          navScrolled
            ? "bg-[#2A1810]/90 backdrop-blur-md border-b border-[#3B2418] py-4"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#A8321C] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-lg text-[#FDFAF4] tracking-tight">
              EmberWatch
            </span>
          </Link>

          {/* Nav links (Minimal uppercase) */}
          <nav className="hidden lg:flex items-center gap-8 eyebrow text-[#D9C3A5]">
            <a href="#platform" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#telemetry" className="hover:text-white transition-colors">
              Telemetry
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Intelligence
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#F6EEDF] hover:text-white transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#CC5500] text-white hover:bg-[#B04A00] transition-all shadow-md active:scale-95"
            >
              Launch Console
            </Link>

            {/* Circular Full-Screen Menu Toggle */}
            <button
              onClick={() => setFullNavOpen(true)}
              className="w-10 h-10 rounded-full border border-[#4E3324] bg-[#3B2418]/60 text-[#FDFAF4] flex items-center justify-center hover:border-[#CC5500] transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Overlay Navigation Menu */}
      {fullNavOpen && (
        <div className="fixed inset-0 z-[100] bg-[#2A1810] text-[#FDFAF4] p-8 md:p-16 flex flex-col justify-between animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-xl text-[#FDFAF4]">
              EmberWatch Directory
            </span>
            <button
              onClick={() => setFullNavOpen(false)}
              className="w-12 h-12 rounded-full border border-[#4E3324] text-white flex items-center justify-center hover:bg-[#3B2418] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 my-auto">
            {[
              { label: "Command Overview", href: "/dashboard" },
              { label: "Threat Feed", href: "/threats" },
              { label: "IOC Explorer", href: "/iocs" },
              { label: "CVE Intelligence", href: "/cves" },
              { label: "Early Warning Center", href: "/alerts" },
              { label: "Admin Login", href: "/auth/login" },
            ].map((item, idx) => (
              <div key={idx} className="overflow-hidden">
                <Link
                  href={item.href}
                  onClick={() => setFullNavOpen(false)}
                  className="block font-display text-4xl md:text-6xl hover:text-[#CC5500] hover:translate-x-4 transition-all duration-300"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#3B2418] pt-6 text-xs font-mono text-[#D9C3A5]">
            <span>FOR DEFENSIVE CYBERSECURITY OPERATIONS ONLY</span>
            <span>© 2026 EMBERWATCH • ZERO EXTERNAL DEPENDENCY</span>
          </div>
        </div>
      )}

      {/* 3. Hero Section (100vh, Chocolate-900 with grain and Halftone Eye) */}
      <section className="relative min-h-screen bg-[#2A1810] text-[#FDFAF4] grain-overlay flex flex-col justify-between px-6 md:px-12 pt-28 pb-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto z-10">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="eyebrow text-[#CC5500] tracking-[0.22em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CC5500] animate-ping" />
              THREAT INTELLIGENCE / EARLY WARNING / AI
            </div>

            {/* Giant Serif Headline with Lumora-style Italic Accent Word */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-display font-normal text-[#FDFAF4] tracking-tight leading-[0.98]">
              See the threat before it{" "}
              <span className="italic font-normal text-[#CC5500] font-display">
                strikes.
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#D9C3A5] font-sans leading-relaxed max-w-xl">
              Security teams drown in scattered vulnerability data. EmberWatch continuously ingests public threat feeds, computes explainable AI risk scores, and correlates zero-days with internal watchlist assets before incidents occur.
            </p>

            {/* Circular Arrow "EXPLORE" Button */}
            <div className="pt-4 flex items-center gap-6">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-4 px-6 py-4 rounded-full border border-[#D9C3A5]/40 hover:border-[#CC5500] bg-[#3B2418]/60 hover:bg-[#CC5500] text-[#FDFAF4] transition-all duration-300 shadow-xl"
              >
                <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                  EXPLORE THE PLATFORM
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-[#2A1810] flex items-center justify-center transition-all group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Hero Column: Animated Halftone Ember Eye */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <EmberEyeArtwork size={460} className="max-w-full drop-shadow-2xl" />
          </div>
        </div>

        {/* Hero Footer Strip */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between pt-6 border-t border-[#3B2418] text-xs font-mono text-[#D9C3A5] z-10">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#CC5500] animate-bounce" />
            <span className="tracking-widest uppercase text-[11px]">SCROLL TO EXPLORE</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="tracking-tight text-[11px]">
              {stats.threats} THREAT CAMPAIGNS NORMALIZED TODAY
            </span>
          </div>
        </div>
      </section>

      {/* 4. Marquee Strip (Infinite Horizontal Scroll in outlined serif) */}
      <section className="bg-[#3B2418] py-4 border-y border-[#4E3324] overflow-hidden whitespace-nowrap select-none">
        <div className="inline-flex gap-8 animate-[marquee_24s_linear_infinite] font-display text-2xl md:text-3xl tracking-widest uppercase text-[#D9C3A5]">
          <span>CVE INTEL</span>
          <span>•</span>
          <span className="italic text-[#CC5500]">CISA KEV</span>
          <span>•</span>
          <span>FIRST EPSS</span>
          <span>•</span>
          <span>MITRE ATT&CK</span>
          <span>•</span>
          <span className="italic text-[#CC5500]">RANSOMWARE EXTORTION</span>
          <span>•</span>
          <span>DGA DETECTION</span>
          <span>•</span>
          <span>SHANNON ENTROPY</span>
          <span>•</span>
          <span className="italic text-[#CC5500]">EARLY WARNING</span>
          <span>•</span>
          <span>CVE INTEL</span>
          <span>•</span>
          <span className="italic text-[#CC5500]">CISA KEV</span>
          <span>•</span>
        </div>
      </section>

      {/* 5. Statement Section (Cream) with High-Contrast Typography */}
      <section id="platform" className="py-24 px-6 md:px-12 bg-[#FDFAF4] text-[#2A1810]">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="eyebrow text-[#CC5500]">CORE PHILOSOPHY</div>
          <h2 className="text-3xl md:text-5xl font-display leading-tight text-[#2A1810]">
            Intelligence without context is just noise. We filter global cyber telemetry down to what{" "}
            <span className="italic text-[#CC5500]">truly matters.</span>
          </h2>
          <p className="text-sm md:text-base text-[#4E3324] font-sans leading-relaxed max-w-2xl mx-auto">
            Traditional SIEM and feed aggregators flood analysts with false positives. EmberWatch continuously analyzes threat feeds, calculates an explainable 0–100 risk index, and flags high-likelihood exploits with prescribed mitigations.
          </p>
        </div>
      </section>

      {/* 6. Pinned 4-Step Process Section (Collect, Normalise, Score, Warn) */}
      <section id="architecture" className="py-20 px-6 md:px-12 bg-[#F6EEDF] border-t border-[#EBDDC6]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="eyebrow text-[#CC5500]">SYSTEM FLOW</div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[#2A1810]">
                Four steps from raw feed to perimeter warning.
              </h2>
            </div>
            <span className="text-xs font-mono text-[#7A5C48]">AUTOMATED ENGINE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Collect",
                desc: "Ingests public threat feeds (NVD 2.0, CISA KEV, EPSS, ThreatFox, AlienVault OTX) with backoff retries and offline seed resilience.",
              },
              {
                step: "02",
                title: "Normalise",
                desc: "De-duplicates disparate feeds into canonical MongoDB schemas with temporal recency decay and compound fingerprint indexing.",
              },
              {
                step: "03",
                title: "Analyse with AI",
                desc: "Computes explainable 0–100 risk scores combining severity, EPSS exploitation signals, Shannon entropy DGA, and classifier weights.",
              },
              {
                step: "04",
                title: "Warn",
                desc: "Correlates emergent campaigns with verified CISA KEV signatures and pushes proactive early-warning triage cards before incidents escalate.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-white border border-[#EBDDC6] warm-shadow-sm space-y-3 hover:-translate-y-1 transition-transform"
              >
                <span className="font-display text-4xl text-[#CC5500] font-bold">
                  {s.step}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2A1810]">{s.title}</h3>
                <p className="text-xs text-[#4E3324] leading-relaxed font-sans">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Live Stats Band (Chocolate-900) */}
      <section id="telemetry" className="py-16 px-6 md:px-12 bg-[#2A1810] text-[#FDFAF4] border-y border-[#3B2418]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-display text-[#FDFAF4]">
              {stats.threats}+
            </div>
            <div className="eyebrow text-[#D9C3A5]">ACTIVE CAMPAIGNS</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-display text-[#CC5500]">
              {stats.iocs.toLocaleString()}+
            </div>
            <div className="eyebrow text-[#D9C3A5]">INDEXED INDICATORS</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-display text-[#FDFAF4]">
              {stats.cves}+
            </div>
            <div className="eyebrow text-[#D9C3A5]">CRITICAL CVES</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-display text-[#A8321C]">
              {stats.alerts}
            </div>
            <div className="eyebrow text-[#D9C3A5]">EARLY WARNINGS</div>
          </div>
        </div>
      </section>

      {/* 8. Feature Cards Grid (3D tilt feel with orange glow) */}
      <section id="features" className="py-24 px-6 md:px-12 bg-[#FDFAF4]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="eyebrow text-[#CC5500]">DEFENSIVE CAPABILITIES</div>
            <h2 className="text-3xl md:text-5xl font-display text-[#2A1810]">
              Everything security teams need to stay ahead.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Explainable Risk Scoring",
                desc: "0–100 composite index weighting CVSS severity, EPSS probability, CISA KEV status, reporting prevalence, and watchlist exposure.",
                icon: Sparkles,
              },
              {
                title: "IOC Multi-Pivot Lookup",
                desc: "Instant reputation, Shannon entropy DGA scoring, whois geo-enrichment, and CSV export for IPs, domains, hashes, and URLs.",
                icon: Search,
              },
              {
                title: "Early Warning Center",
                desc: "4-column Kanban board triaging alerts from new to mitigated with automated audit trail logging and prescribed remediation.",
                icon: BellRing,
              },
              {
                title: "CVE Intelligence & KEV",
                desc: "Live NVD CVE library with FIRST EPSS exploit likelihood probabilities, CISA KEV tags, and actionable remediation steps.",
                icon: Bug,
              },
              {
                title: "Grounded AI Analyst",
                desc: "Plain-English conversational assistant citing stored threat records, drafting incident briefs, and analyzing CVEs.",
                icon: Bot,
              },
              {
                title: "Admin Feed Console",
                desc: "Full control over automated ingestion pipelines, user roles, audit logs, and AI classifier telemetry.",
                icon: Layers,
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white border border-[#EBDDC6] warm-shadow space-y-4 hover:border-[#CC5500] hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F8E1CC] text-[#CC5500] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#2A1810]">{f.title}</h3>
                  <p className="text-xs text-[#4E3324] leading-relaxed font-sans">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Banner */}
      <section className="bg-gradient-to-r from-[#CC5500] to-[#A8321C] text-white py-20 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-white">
            Ready to see what&apos;s <span className="italic">coming?</span>
          </h2>
          <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-xl mx-auto">
            Experience complete proactive cyber threat intelligence with zero external dependencies and 100% turnkey seed data.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#2A1810] text-[#FDFAF4] hover:bg-black font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-2xl active:scale-95"
            >
              LAUNCH COMMAND CENTER <ArrowRight className="w-4 h-4 text-[#CC5500]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Rich Editorial Footer (Chocolate-900) */}
      <footer className="bg-[#2A1810] text-[#F6EEDF] py-12 px-6 md:px-12 border-t border-[#3B2418]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#CC5500] text-white flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-base text-[#FDFAF4]">
              EmberWatch
            </span>
            <span className="text-[10px] font-mono text-[#D9C3A5]">
              DEFENSIVE INTELLIGENCE SYSTEMS
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#A48873] text-center">
            Defensive Security Platform • All Feeds for Authorized Threat Intelligence Use Only
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-[#D9C3A5]">
            <Link href="/auth/login" className="hover:text-white transition-colors">
              SIGN IN
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              DASHBOARD
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
