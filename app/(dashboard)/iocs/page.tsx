"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Globe,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import RiskGauge from "@/components/RiskGauge";

export default function IOCExplorerPage() {
  const [query, setQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [iocsList, setIocsList] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");

  const fetchStoredIocs = async () => {
    try {
      const res = await fetch(`/api/v1/iocs?type=${typeFilter}&verdict=${verdictFilter}&limit=20`);
      const json = await res.json();
      if (json.success) {
        setIocsList(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStoredIocs();
  }, [typeFilter, verdictFilter]);

  const handleLookup = async (e?: React.FormEvent, customValue?: string) => {
    if (e) e.preventDefault();
    const val = customValue || query;
    if (!val.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/v1/iocs/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indicator: val.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setLookupResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "Indicator,Type,Verdict,RiskScore,MalwareFamily,FirstSeen\n";
    const rows = iocsList
      .map(
        (i) =>
          `"${i.value}","${i.type}","${i.verdict}","${i.riskScore}","${i.malwareFamily || ""}","${i.firstSeen}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emberwatch-iocs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="eyebrow text-[#CC5500] mb-1">INDICATOR REPUTATION</div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
          IOC Explorer & Threat <span className="italic font-normal text-[#CC5500]">Enrichment.</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          Instant multi-pivot analysis across IPs, domains, hashes, URLs, and CVEs with explainable AI verdicts.
        </p>
      </div>

      {/* Main IOC Lookup Search Bar */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow-sm space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter IP (e.g. 198.51.100.24), domain, SHA256 hash, URL, or CVE ID..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-semibold bg-[#CC5500] text-white hover:bg-[#B04A00] transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Enrich & Score"}
          </button>
        </form>

        {/* Quick sample indicator chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--text-muted)] font-mono text-[11px]">Quick Tests:</span>
          {[
            { label: "C2 IP", val: "198.51.100.24" },
            { label: "Phishing Domain", val: "emberwatclh-login.example.com" },
            { label: "High-Entropy DGA", val: "xqz99b78k12am.example.xyz" },
            { label: "PAN-OS Zero-Day", val: "CVE-2024-3400" },
          ].map((sample) => (
            <button
              key={sample.val}
              type="button"
              onClick={() => {
                setQuery(sample.val);
                handleLookup(undefined, sample.val);
              }}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] font-mono text-[10px] hover:border-[#CC5500] hover:text-[#CC5500] transition-colors"
            >
              {sample.label}: <span className="font-semibold">{sample.val}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lookup Result Card */}
      {lookupResult && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 warm-shadow space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-[var(--bg-page)] px-2 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-muted)]">
                  {lookupResult.detectedType}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    lookupResult.verdict === "malicious"
                      ? "bg-[#F6DDD6] text-[#A8321C] border border-[#E2B7AE]"
                      : lookupResult.verdict === "suspicious"
                      ? "bg-[#F8E1CC] text-[#CC5500] border border-[#E8C2A8]"
                      : "bg-[#E3ECDD] text-[#6B8F5E] border border-[#B5CCA9]"
                  }`}
                >
                  VERDICT: {lookupResult.verdict}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-mono font-bold text-[var(--text-primary)] break-all">
                {lookupResult.indicator}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lookupResult.indicator);
                  alert("Copied indicator to clipboard");
                }}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-medium hover:bg-[var(--bg-page)] transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>

          {/* Verdict & Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 flex flex-col items-center justify-center">
              <RiskGauge score={lookupResult.riskScore} label="Composite Risk Score" size={170} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CC5500]" /> Why this score? (Explainable AI Breakdown)
              </h3>
              <div className="space-y-2">
                {lookupResult.factors?.map((f: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-[var(--text-primary)]">{f.factor}:</strong>{" "}
                      <span className="text-[var(--text-secondary)]">{f.description}</span>
                    </div>
                    <span className="font-mono font-semibold text-[#CC5500] ml-3 whitespace-nowrap">
                      +{f.contribution} pts
                    </span>
                  </div>
                ))}
              </div>

              {lookupResult.recommendation && (
                <div className="p-3 rounded-xl bg-[#F8E1CC] dark:bg-[#3A2319] border border-[#E8C2A8] text-xs font-medium text-[#A8321C] dark:text-[#E0533C]">
                  {lookupResult.recommendation}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stored Indicators Table with Export */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 warm-shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-base text-[var(--text-primary)]">
              Indexed Intelligence Indicators
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Showing active database indicators with reputation verdicts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)]"
            >
              <option value="all">All Types</option>
              <option value="ip">IP</option>
              <option value="domain">Domain</option>
              <option value="url">URL</option>
              <option value="sha256">SHA256</option>
            </select>

            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)]"
            >
              <option value="all">All Verdicts</option>
              <option value="malicious">Malicious</option>
              <option value="suspicious">Suspicious</option>
              <option value="clean">Clean</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[#CC5500] hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px] uppercase bg-[var(--bg-page)]">
              <tr>
                <th className="p-3">Indicator</th>
                <th className="p-3">Type</th>
                <th className="p-3">Verdict</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Family</th>
                <th className="p-3">Location</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {iocsList.map((ioc) => (
                <tr key={ioc._id} className="hover:bg-[var(--bg-page)] transition-colors">
                  <td className="p-3 font-mono font-medium text-[var(--text-primary)] max-w-xs truncate">
                    {ioc.value}
                  </td>
                  <td className="p-3 font-mono uppercase text-[var(--text-muted)]">{ioc.type}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        ioc.verdict === "malicious"
                          ? "bg-[#F6DDD6] text-[#A8321C]"
                          : ioc.verdict === "suspicious"
                          ? "bg-[#F8E1CC] text-[#CC5500]"
                          : "bg-[#E3ECDD] text-[#6B8F5E]"
                      }`}
                    >
                      {ioc.verdict}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#CC5500]">
                    {ioc.riskScore}/100
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">
                    {ioc.malwareFamily || "—"}
                  </td>
                  <td className="p-3 text-[var(--text-muted)] font-mono">
                    {ioc.geo?.country || "—"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setQuery(ioc.value);
                        handleLookup(undefined, ioc.value);
                      }}
                      className="text-[#CC5500] hover:underline font-medium"
                    >
                      Enrich
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
