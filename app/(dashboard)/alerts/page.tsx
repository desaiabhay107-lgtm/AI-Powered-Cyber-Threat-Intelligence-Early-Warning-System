"use client";

import React, { useState, useEffect } from "react";
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import SeverityBadge from "@/components/SeverityBadge";

export default function EarlyWarningCenterPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/alerts");
      const json = await res.json();
      if (json.success) {
        setAlerts(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateAlertStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
        );
        if (selectedAlert?._id === id) {
          setSelectedAlert((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: "new", title: "New Alerts", color: "border-t-[#A8321C]" },
    { key: "investigating", title: "Investigating", color: "border-t-[#CC5500]" },
    { key: "mitigated", title: "Mitigated", color: "border-t-[#6B8F5E]" },
    { key: "false_positive", title: "False Positive", color: "border-t-[#8A7B6E]" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-[#CC5500] mb-1">PROACTIVE TRIAGE</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
            Early Warning <span className="italic font-normal text-[#CC5500]">Center.</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            Proactive correlation engine matching new zero-days, CISA KEV entries, and telemetry anomalies.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              viewMode === "kanban" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            Kanban Triage
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              viewMode === "table" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colAlerts = alerts.filter((a) => a.status === col.key);
            return (
              <div
                key={col.key}
                className={`rounded-2xl border border-[var(--border-color)] border-t-4 ${col.color} bg-[var(--bg-card)] p-4 space-y-3 warm-shadow-sm min-h-[500px] flex flex-col`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {col.title}
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-muted)]">
                    {colAlerts.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colAlerts.map((alert) => (
                    <div
                      key={alert._id}
                      onClick={() => setSelectedAlert(alert)}
                      className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#CC5500] cursor-pointer transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <SeverityBadge severity={alert.severity} size="sm" />
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-serif font-bold text-[var(--text-primary)] leading-tight">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                        {alert.reason}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">
                        <span className="font-mono font-semibold text-[#CC5500]">
                          Risk: {alert.riskScore}/100
                        </span>
                        <span>{alert.assignedTo || "Unassigned"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-x-auto warm-shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px] uppercase bg-[var(--bg-page)]">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Alert Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {alerts.map((alert) => (
                <tr key={alert._id} className="hover:bg-[var(--bg-page)] transition-colors">
                  <td className="p-3">
                    <SeverityBadge severity={alert.severity} size="sm" />
                  </td>
                  <td className="p-3 font-semibold text-[var(--text-primary)] max-w-sm truncate">
                    {alert.title}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-xs uppercase font-bold text-[var(--text-secondary)]">
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{alert.assignedTo || "—"}</td>
                  <td className="p-3 font-mono font-bold text-[#CC5500]">
                    {alert.riskScore}/100
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="text-xs font-semibold text-[#CC5500] hover:underline"
                    >
                      Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alert Triage Drawer / Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={selectedAlert.severity} />
                  <span className="text-xs font-mono uppercase bg-[var(--bg-page)] px-2 py-0.5 rounded border border-[var(--border-color)] font-bold">
                    STATUS: {selectedAlert.status}
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                  {selectedAlert.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-page)]"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Correlation Reason & Trigger Rule
              </h4>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-page)] p-3 rounded-xl border border-[var(--border-color)]">
                {selectedAlert.reason}
              </p>
            </div>

            {/* AI Prescribed Actions */}
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[#E8C2A8] dark:border-[#4A2E20] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#CC5500]">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommended Response Actions
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--text-primary)] list-disc pl-4">
                {selectedAlert.recommendedActions?.map((act: string, i: number) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            {/* Quick Status State Transitions */}
            <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Transition Alert State:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateAlertStatus(selectedAlert._id, "investigating")}
                  disabled={selectedAlert.status === "investigating"}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#CC5500] text-white hover:bg-[#B04A00] disabled:opacity-40"
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => updateAlertStatus(selectedAlert._id, "mitigated")}
                  disabled={selectedAlert.status === "mitigated"}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#6B8F5E] text-white hover:bg-[#57744C] disabled:opacity-40"
                >
                  Mark Mitigated
                </button>
                <button
                  onClick={() => updateAlertStatus(selectedAlert._id, "false_positive")}
                  disabled={selectedAlert.status === "false_positive"}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-card)] disabled:opacity-40"
                >
                  False Positive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
