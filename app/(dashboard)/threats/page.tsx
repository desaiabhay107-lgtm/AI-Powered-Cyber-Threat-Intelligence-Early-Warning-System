"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SeverityBadge from "@/components/SeverityBadge";

export default function ThreatFeedPage() {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer detail state
  const [selectedThreat, setSelectedThreat] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"detail" | "json">("detail");

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        severity: severityFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/v1/threats?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setThreats(json.data);
        setTotalPages(json.meta.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [page, severityFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchThreats();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-[#CC5500] mb-1">INTELLIGENCE STREAM</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">
            Normalized Threat <span className="italic font-normal text-[#CC5500]">Feed.</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            Real-time multi-source telemetry aggregated and scored across public feeds and advisory networks.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setViewMode("card")}
            className={`p-1.5 rounded-lg text-xs ${
              viewMode === "card" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs ${
              viewMode === "table" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] warm-shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns, signatures, CVEs, or tags..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Threat Types</option>
            <option value="ransomware">Ransomware</option>
            <option value="phishing">Phishing</option>
            <option value="malware">Malware</option>
            <option value="exploit">Exploit</option>
            <option value="botnet">Botnet</option>
            <option value="data-leak">Data Leak</option>
          </select>
        </div>
      </div>

      {/* Threat List (Cards or Table) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] font-mono">
          Loading normalized threat events...
        </div>
      ) : threats.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
          <p className="text-sm font-semibold">No threats match current filter criteria.</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {threats.map((threat) => (
            <div
              key={threat._id}
              onClick={() => setSelectedThreat(threat)}
              className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[#CC5500] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={threat.severity} size="sm" />
                  <span className="text-xs font-mono font-bold text-[#CC5500]">
                    Risk {threat.riskScore}/100
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] line-clamp-2">
                  {threat.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {threat.summary}
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[var(--border-color)]">
                <div className="flex flex-wrap gap-1">
                  {threat.tags?.slice(0, 3).map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-color)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>{threat.source}</span>
                  <span>{new Date(threat.firstSeen).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-x-auto warm-shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px] uppercase bg-[var(--bg-page)]">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Campaign / Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Source</th>
                <th className="p-3">First Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {threats.map((threat) => (
                <tr
                  key={threat._id}
                  onClick={() => setSelectedThreat(threat)}
                  className="hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <SeverityBadge severity={threat.severity} size="sm" />
                  </td>
                  <td className="p-3 font-semibold text-[var(--text-primary)] max-w-md truncate">
                    {threat.title}
                  </td>
                  <td className="p-3 font-mono capitalize">{threat.type}</td>
                  <td className="p-3 font-mono font-bold text-[#CC5500]">
                    {threat.riskScore}/100
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{threat.source}</td>
                  <td className="p-3 font-mono text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(threat.firstSeen).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2 text-xs font-mono">
        <span className="text-[var(--text-muted)]">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-page)] disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-page)] disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Detail Slide-Drawer */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--bg-card)] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-[var(--border-color)]">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-start justify-between">
                <SeverityBadge severity={selectedThreat.severity} />
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-page)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)]">
                  {selectedThreat.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-mono">
                  <span>Type: {selectedThreat.type.toUpperCase()}</span>
                  <span>•</span>
                  <span>Source: {selectedThreat.source}</span>
                </div>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-[var(--border-color)] gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("detail")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "detail"
                      ? "border-[#CC5500] text-[#CC5500]"
                      : "border-transparent text-[var(--text-muted)]"
                  }`}
                >
                  Intelligence Breakdown
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "json"
                      ? "border-[#CC5500] text-[#CC5500]"
                      : "border-transparent text-[var(--text-muted)]"
                  }`}
                >
                  Raw STIX / JSON
                </button>
              </div>

              {activeTab === "detail" ? (
                <div className="space-y-5">
                  {/* AI Plain-English Summary */}
                  <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[#E8C2A8] dark:border-[#4A2E20] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#CC5500]">
                      <Sparkles className="w-3.5 h-3.5" /> AI Analyst Assessment
                    </div>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                      {selectedThreat.aiSummary || selectedThreat.summary}
                    </p>
                  </div>

                  {/* Related CVEs & Actors */}
                  {selectedThreat.cveIds?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                        Linked Vulnerabilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedThreat.cveIds.map((cve: string) => (
                          <span
                            key={cve}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[var(--bg-page)] text-[#A8321C] border border-[var(--border-color)]"
                          >
                            {cve}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}


                </div>
              ) : (
                <pre className="p-4 rounded-xl bg-[#2A1810] text-[#F6EEDF] text-[11px] font-mono overflow-x-auto max-h-[350px]">
                  {JSON.stringify(selectedThreat, null, 2)}
                </pre>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-end">
              <span className="text-xs text-[var(--text-muted)] font-mono">
                Risk Rating: <strong className="text-[#CC5500]">{selectedThreat.riskScore}/100</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
