"use client";

import React, { useState, useEffect } from "react";
import {
  Bug,
  Search,
  Filter,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import SeverityBadge from "@/components/SeverityBadge";

export default function CveIntelligencePage() {
  const [cves, setCves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kevOnly, setKevOnly] = useState(false);
  const [minCvss, setMinCvss] = useState(0);
  const [selectedCve, setSelectedCve] = useState<any | null>(null);

  const fetchCves = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        isKev: kevOnly ? "true" : "false",
        minCvss: minCvss.toString(),
      });
      const res = await fetch(`/api/v1/cves?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCves(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCves();
  }, [kevOnly, minCvss]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCves();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-[#CC5500] mb-1">VULNERABILITY INTELLIGENCE</div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
          CVE Intelligence & Exploit <span className="italic font-normal text-[#CC5500]">Prediction.</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          NVD CVE database with FIRST EPSS exploit likelihood scores, CISA KEV tags, and remediation guidance.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] warm-shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search CVE ID (e.g. CVE-2024-3400), vendor, product, or description..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
          />
        </form>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={kevOnly}
              onChange={(e) => setKevOnly(e.target.checked)}
              className="rounded accent-[#CC5500]"
            />
            <span className="font-semibold text-[#A8321C]">CISA KEV Only</span>
          </label>

          <select
            value={minCvss}
            onChange={(e) => setMinCvss(parseFloat(e.target.value))}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="0">All CVSS Scores</option>
            <option value="9.0">CVSS ≥ 9.0 (Critical)</option>
            <option value="7.0">CVSS ≥ 7.0 (High)</option>
            <option value="4.0">CVSS ≥ 4.0 (Medium)</option>
          </select>
        </div>
      </div>

      {/* CVE Table */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-x-auto warm-shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px] uppercase bg-[var(--bg-page)]">
            <tr>
              <th className="p-3">CVE Identifier</th>
              <th className="p-3">Severity</th>
              <th className="p-3">CVSS</th>
              <th className="p-3">EPSS Likelihood</th>
              <th className="p-3">CISA KEV</th>
              <th className="p-3">Impacted Products</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {cves.map((cve) => (
              <tr key={cve.cveId} className="hover:bg-[var(--bg-page)] transition-colors">
                <td className="p-3 font-mono font-bold text-[var(--text-primary)]">
                  {cve.cveId}
                </td>
                <td className="p-3">
                  <SeverityBadge severity={cve.severity} size="sm" />
                </td>
                <td className="p-3 font-mono font-bold text-[#A8321C]">
                  {cve.cvssScore.toFixed(1)}
                </td>
                <td className="p-3 font-mono text-[var(--text-secondary)]">
                  {(cve.epssScore * 100).toFixed(1)}%
                </td>
                <td className="p-3">
                  {cve.isKev ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#F6DDD6] text-[#A8321C] border border-[#E2B7AE]">
                      KEV EXPLOITED
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)]">—</span>
                  )}
                </td>
                <td className="p-3 text-[var(--text-secondary)] max-w-xs truncate">
                  {cve.affected?.map((a: any) => `${a.vendor} ${a.product}`).join(", ")}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setSelectedCve(cve)}
                    className="text-xs font-semibold text-[#CC5500] hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected CVE Modal / Drawer */}
      {selectedCve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={selectedCve.severity} />
                  <span className="text-xl font-serif font-bold text-[var(--text-primary)]">
                    {selectedCve.cveId}
                  </span>
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                  CVSS Base: {selectedCve.cvssScore} • EPSS Probability: {(selectedCve.epssScore * 100).toFixed(1)}%
                </div>
              </div>
              <button
                onClick={() => setSelectedCve(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-page)]"
              >
                Close
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {selectedCve.description}
              </p>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[#E8C2A8] dark:border-[#4A2E20] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#CC5500]">
                <Sparkles className="w-3.5 h-3.5" /> AI Analyst Remediation Guidance
              </div>
              <p className="text-xs text-[var(--text-primary)]">
                {selectedCve.aiSummary || "Vulnerability under active weaponization scans. Expedite vendor patch application."}
              </p>
            </div>

            {/* Remediation Steps */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Prescribed Mitigations
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
                <li>Deploy verified firmware or package update from vendor advisory channels.</li>
                <li>Verify ingress firewall rules blocking unauthorized administrative interfaces.</li>
                <li>Monitor authentication logs for brute-force or privilege escalation artifacts.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
