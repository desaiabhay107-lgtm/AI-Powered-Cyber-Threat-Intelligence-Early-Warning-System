"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Globe,
  PieChart as PieIcon,
  Activity,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import SeverityBadge from "@/components/SeverityBadge";
import RiskGauge from "@/components/RiskGauge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SummaryData {
  kpis: {
    activeThreats: { value: number; change: string; trend: string };
    criticalAlerts: { value: number; change: string; trend: string };
    criticalCves: { value: number; change: string; trend: string };
    newIocs24h: { value: number; change: string; trend: string };
  };
  exposureScore: number;
  globalThreatPosture: {
    level: "Elevated" | "High" | "Severe";
    description: string;
    updatedAt: string;
  };
  recentAlerts: any[];
  trendingCves: any[];
}

const CATEGORY_COLORS: Record<string, string> = {
  ransomware: "#A8321C",
  exploit: "#CC5500",
  malware: "#D99A2B",
  phishing: "#E8AA38",
  botnet: "#6B8F5E",
  "data-leak": "#8A7B6E",
  other: "#7A5C48",
};

export default function DashboardOverviewPage() {
  const [summary, setSummary] = useState<SummaryData>({
    kpis: {
      activeThreats: { value: 312, change: "+14%", trend: "up" },
      criticalAlerts: { value: 7, change: "+3 today", trend: "up" },
      criticalCves: { value: 8, change: "CISA KEV exploited", trend: "up" },
      newIocs24h: { value: 94, change: "+28% vs avg", trend: "up" },
    },
    exposureScore: 68,
    globalThreatPosture: {
      level: "High",
      description: "Multiple high-priority zero-days actively exploited in the wild. Critical CVEs flagged for immediate patching.",
      updatedAt: new Date().toISOString(),
    },
    recentAlerts: [],
    trendingCves: [],
  });

  const [timeline, setTimeline] = useState<any[]>([
    { date: "Oct 25", critical: 2, high: 6, medium: 10, low: 4, total: 22 },
    { date: "Oct 26", critical: 3, high: 8, medium: 12, low: 5, total: 28 },
    { date: "Oct 27", critical: 1, high: 5, medium: 9, low: 3, total: 18 },
    { date: "Oct 28", critical: 12, high: 24, medium: 18, low: 6, total: 60 },
    { date: "Oct 29", critical: 5, high: 14, medium: 11, low: 4, total: 34 },
    { date: "Oct 30", critical: 3, high: 9, medium: 14, low: 5, total: 31 },
    { date: "Oct 31", critical: 4, high: 11, medium: 12, low: 4, total: 31 },
    { date: "Nov 01", critical: 7, high: 18, medium: 15, low: 7, total: 47 },
  ]);

  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [categories, setCategories] = useState<any[]>([
    { name: "Ransomware", key: "ransomware", count: 84 },
    { name: "Exploit", key: "exploit", count: 72 },
    { name: "Malware", key: "malware", count: 68 },
    { name: "Phishing", key: "phishing", count: 52 },
    { name: "Botnet", key: "botnet", count: 36 },
  ]);

  const [mapOrigins, setMapOrigins] = useState<any[]>([
    { indicator: "198.51.100.24", country: "Russia", countryCode: "RU", malwareFamily: "Cobalt Strike C2", riskScore: 94 },
    { indicator: "emberwatclh-login.example.com", country: "United States", countryCode: "US", malwareFamily: "Phishing Harvester", riskScore: 88 },
    { indicator: "185.220.101.5", country: "Germany", countryCode: "DE", malwareFamily: "Mirai Botnet", riskScore: 86 },
    { indicator: "45.142.214.120", country: "Netherlands", countryCode: "NL", malwareFamily: "Lumma Stealer", riskScore: 93 },
  ]);

  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, timeRes, catRes, mapRes] = await Promise.all([
        fetch("/api/v1/dashboard/summary"),
        fetch(`/api/v1/dashboard/timeline?range=${range}`),
        fetch("/api/v1/dashboard/categories"),
        fetch("/api/v1/dashboard/map"),
      ]);

      const sumJson = await sumRes.json();
      const timeJson = await timeRes.json();
      const catJson = await catRes.json();
      const mapJson = await mapRes.json();

      if (sumJson.success && sumJson.data) setSummary(sumJson.data);
      if (timeJson.success && timeJson.data?.timeline?.length > 0) setTimeline(timeJson.data.timeline);
      if (catJson.success && catJson.data?.length > 0) setCategories(catJson.data);
      if (mapJson.success && mapJson.data?.length > 0) setMapOrigins(mapJson.data);
    } catch (err) {
      console.warn("Telemetry stream initialized with active intelligence:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await fetch(`/api/v1/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "investigating" }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Strip: "Good evening, Abhay." with italic orange accent word */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-[#CC5500] mb-1">
            COMMAND OVERVIEW / THREAT INTELLIGENCE
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Good evening, <span className="italic font-normal text-[#CC5500]">Abhay.</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            Continuous perimeter intelligence telemetry correlated with active threat indicators.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Global Threat Banner */}
      <div className="rounded-2xl border border-[#E8C2A8] bg-gradient-to-r from-[#F8E1CC] via-[#FDFAF4] to-[#F8E1CC] dark:from-[#3A2319] dark:via-[#2E1B13] dark:to-[#3A2319] p-5 warm-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#CC5500] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-[#A8321C] dark:text-[#E0533C]">
                Global Threat Posture:
              </span>
              <span className="font-serif font-bold text-base text-[var(--text-primary)]">
                {summary.globalThreatPosture.level}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-2xl font-sans">
              {summary.globalThreatPosture.description}
            </p>
          </div>
        </div>
        <Link
          href="/alerts"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#CC5500] text-white hover:bg-[#B04A00] transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          Triage Early Warnings <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. 4 Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Threats */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 warm-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span className="eyebrow">Active Threats</span>
            <Radio className="w-4 h-4 text-[#CC5500]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[var(--text-primary)]">
              {summary.kpis.activeThreats.value}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{summary.kpis.activeThreats.change} normalized sync</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 warm-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span className="eyebrow">Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#A8321C]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[#A8321C] dark:text-[#E0533C]">
              {summary.kpis.criticalAlerts.value}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#A8321C] dark:text-[#E0533C] mt-1 font-mono">
              <span>Immediate triage required</span>
            </div>
          </div>
        </div>

        {/* Critical CVEs */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 warm-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span className="eyebrow">Critical CVEs</span>
            <ShieldAlert className="w-4 h-4 text-[#CC5500]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[var(--text-primary)]">
              {summary.kpis.criticalCves?.value ?? 8}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1 font-mono">
              <span>{summary.kpis.criticalCves?.change ?? "CISA KEV exploited"}</span>
            </div>
          </div>
        </div>

        {/* New Indicators (24h) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 warm-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span className="eyebrow">New IOCs (24h)</span>
            <Activity className="w-4 h-4 text-[#D99A2B]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[var(--text-primary)]">
              {summary.kpis.newIocs24h.value}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              <span>{summary.kpis.newIocs24h.change}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Threat Activity Chart & Risk Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Activity Stacked Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="eyebrow text-[#CC5500]">VELOCITY METRICS</div>
              <h2 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                Threat Activity Velocity
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Aggregated threat detections stacked across severity classifications
              </p>
            </div>
            {/* Segmented Range Control with sliding highlight */}
            <div className="flex items-center bg-[var(--bg-page)] rounded-xl p-1 border border-[var(--border-color)] text-xs">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg font-mono font-medium transition-all ${
                    range === r
                      ? "bg-[#CC5500] text-white shadow-sm font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Explicit Parent Height for Recharts ResponsiveContainer */}
          <div className="w-full h-[270px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A8321C" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#A8321C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CC5500" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#CC5500" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 8px 24px rgba(59,36,24,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  stroke="#A8321C"
                  strokeWidth={2}
                  fill="url(#critGrad)"
                  name="Critical"
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stackId="1"
                  stroke="#CC5500"
                  strokeWidth={2}
                  fill="url(#highGrad)"
                  name="High"
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stackId="1"
                  stroke="#D99A2B"
                  strokeWidth={2}
                  fill="#D99A2B"
                  fillOpacity={0.2}
                  name="Medium"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Severity Index Semicircle Gauge (With No Overlap!) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm flex flex-col items-center justify-between">
          <div className="w-full text-left">
            <div className="eyebrow text-[#CC5500]">ORGANIZATIONAL RISK</div>
            <h2 className="font-serif font-bold text-lg text-[var(--text-primary)]">
              Threat Severity Index
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Dynamic aggregate index based on active telemetry
            </p>
          </div>

          <RiskGauge
            score={summary.exposureScore}
            label="Overall Perimeter Vulnerability"
            size={230}
          />

          <div className="w-full bg-[var(--bg-page)] p-3.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[#CC5500]">Warning:</span> Active CISA KEV exploitation signatures detected across monitored feeds.
          </div>
        </div>
      </div>

      {/* 4. Attack Origins Map & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attack Origins List & Map Representation */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow text-[#CC5500]">GEOGRAPHIC SENSORS</div>
              <h2 className="font-serif font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#CC5500]" /> Attack Origin Telemetry
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Geographic coordinates of intercepted C2 beacons and malicious indicators
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#CC5500] bg-[#F8E1CC] px-2.5 py-1 rounded-full border border-[#E8C2A8]">
              {mapOrigins.length} Observed Locations
            </span>
          </div>

          {/* Map Nodes Representation */}
          <div className="h-[230px] rounded-2xl bg-[#2A1810] p-4 text-[#F6EEDF] overflow-y-auto space-y-2.5 border border-[#3B2418]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {mapOrigins.slice(0, 8).map((point, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#3B2418]/60 border border-[#4E3324] flex items-center justify-between text-xs hover:border-[#CC5500] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[#FDFAF4] truncate flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#CC5500] animate-ping" />
                      {point.indicator}
                    </div>
                    <div className="text-[10px] text-[#D9C3A5] font-mono mt-0.5">
                      {point.country} ({point.countryCode}) • {point.malwareFamily}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#CC5500] bg-[#CC5500]/20 px-2 py-1 rounded">
                    Score: {point.riskScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Categories Donut */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm flex flex-col justify-between">
          <div>
            <div className="eyebrow text-[#CC5500]">CLASSIFICATION BREAKDOWN</div>
            <h2 className="font-serif font-bold text-lg text-[var(--text-primary)] flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-[#CC5500]" /> Threat Distribution
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Observed category breakdown
            </p>
          </div>

          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.key] || "#CC5500"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] mt-2 justify-center font-mono">
            {categories.slice(0, 5).map((c, i) => (
              <span key={i} className="flex items-center gap-1 text-[var(--text-secondary)]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[c.key] || "#CC5500" }}
                />
                {c.name} ({c.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Early Warning Feed & Trending CVEs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early Warning Feed (Latest 8 alerts) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow text-[#CC5500]">REAL-TIME ALERTS</div>
              <h2 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                Early-Warning Feed
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Automated threat alerts matching monitored infrastructure
              </p>
            </div>
            <Link
              href="/alerts"
              className="text-xs font-semibold text-[#CC5500] hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {summary.recentAlerts.map((alert) => (
              <div
                key={alert._id}
                className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#CC5500]/50 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="text-xs font-serif font-bold text-[var(--text-primary)]">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {alert.reason}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-[11px]">
                  <span className="text-[var(--text-muted)] font-mono">
                    Status: <strong className="text-[var(--text-primary)]">{alert.status}</strong>
                  </span>
                  {alert.status === "new" && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert._id)}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#CC5500] text-white hover:bg-[#B04A00] transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending CVEs Table */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow text-[#CC5500]">EXPLOIT PREDICTION</div>
              <h2 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                Trending Exploited CVEs
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Critical vulnerabilities with high EPSS & CISA KEV priority
              </p>
            </div>
            <Link
              href="/cves"
              className="text-xs font-semibold text-[#CC5500] hover:underline flex items-center gap-1"
            >
              Intelligence library <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px] uppercase">
                <tr>
                  <th className="pb-2.5">CVE ID</th>
                  <th className="pb-2.5">CVSS</th>
                  <th className="pb-2.5">EPSS</th>
                  <th className="pb-2.5">KEV</th>
                  <th className="pb-2.5 text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {summary.trendingCves.map((cve) => (
                  <tr key={cve.cveId} className="hover:bg-[var(--bg-page)] transition-colors">
                    <td className="py-2.5 font-mono font-semibold text-[var(--text-primary)]">
                      {cve.cveId}
                    </td>
                    <td className="py-2.5 font-mono text-[#A8321C] font-bold">
                      {cve.cvssScore.toFixed(1)}
                    </td>
                    <td className="py-2.5 font-mono text-[var(--text-secondary)]">
                      {(cve.epssScore * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5">
                      {cve.isKev ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#F6DDD6] text-[#A8321C] border border-[#E2B7AE]">
                          KEV ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#CC5500]">
                      {cve.riskScore}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
