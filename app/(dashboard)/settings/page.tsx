"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Radio,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  Cpu,
  Shield,
  Sparkles,
  Users,
  Download,
  Plus,
} from "lucide-react";

export default function SettingsAdminPage() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [modelHealth, setModelHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<"feeds" | "users" | "audit">("feeds");

  // User management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, mRes] = await Promise.all([
        fetch("/api/v1/admin/feeds"),
        fetch("/api/v1/ai/model-health"),
      ]);
      const fJson = await fRes.json();
      const mJson = await mRes.json();

      if (fJson.success) {
        setFeeds(fJson.data.feeds);
        setRuns(fJson.data.recentRuns);
      }
      if (mJson.success) {
        setModelHealth(mJson.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/v1/admin/users");
      const json = await res.json();
      if (json.success) setUsersList(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/v1/admin/audit-logs?limit=50");
      const json = await res.json();
      if (json.success) setAuditLogs(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "audit") fetchAuditLogs();
  }, [activeTab, fetchUsers, fetchAuditLogs]);

  const handleRunFeed = async (key: string) => {
    setRunningKey(key);
    try {
      await fetch(`/api/v1/admin/feeds/${key}/run`, { method: "POST" });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningKey(null);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const json = await res.json();
      if (json.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role } : u))
        );
      } else {
        alert(json.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReSeed = async () => {
    if (
      !confirm(
        "Re-initialize intelligence database with verified CISA KEV catalog and abuse.ch telemetry? Existing data will be preserved where possible."
      )
    )
      return;
    setSeeding(true);
    try {
      const res = await fetch("/api/v1/seed?force=true", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert("Database successfully initialized with verified threat intelligence!");
        window.location.reload();
      } else {
        alert(json.error || "Seed failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const handleExportAudit = async () => {
    const rows = ["Action,User,IP,Timestamp"];
    auditLogs.forEach((log) => {
      rows.push(
        `"${log.action}","${log.user}","${log.ip}","${new Date(log.createdAt || log.time).toISOString()}"`
      );
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emberwatch-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-[#CC5500] mb-1">CONFIGURATION CONSOLE</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
            System Administration &amp; <span className="italic font-normal text-[#CC5500]">Feeds.</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            Threat feed synchronization intervals, AI classifier telemetry, user access control, and audit logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("feeds")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === "feeds" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            Feed Ingestion
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === "users" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            User Access
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === "audit" ? "bg-[#CC5500] text-white" : "text-[var(--text-muted)]"
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === "feeds" && (
        <div className="space-y-6">
          {/* Feed Sources Management */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 warm-shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#CC5500]" /> Automated Threat Intelligence Feeds
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Scheduled background ingestion workers with exponential backoff and schema deduplication
                </p>
              </div>
              <button
                onClick={fetchAdminData}
                className="p-2 rounded-xl border border-[var(--border-color)] text-xs hover:bg-[var(--bg-page)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="text-xs text-[var(--text-muted)] font-mono py-6 text-center">
                Loading feed status...
              </div>
            ) : feeds.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] font-mono py-6 text-center">
                No feeds configured. Connect MongoDB to load feed sources.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeds.map((feed) => (
                  <div
                    key={feed.key}
                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {feed.lastStatus?.toUpperCase() || "HEALTHY"}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          Every {feed.intervalMinutes}m
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                        {feed.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)] font-mono">
                        Last sync: {feed.recordsLastRun ?? "—"} items
                      </span>
                      <button
                        onClick={() => handleRunFeed(feed.key)}
                        disabled={runningKey === feed.key}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#CC5500] text-white hover:bg-[#B04A00] transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Play className={`w-3 h-3 ${runningKey === feed.key ? "animate-spin" : ""}`} />
                        {runningKey === feed.key ? "Syncing..." : "Run Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Model Health Card */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 warm-shadow-sm">
            <h2 className="font-serif font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#CC5500]" /> AI Engine &amp; Classifier Performance Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modelHealth?.models?.map((mod: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#CC5500] font-bold">
                      {mod.status}
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      {mod.accuracy || "Operational"}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xs text-[var(--text-primary)]">
                    {mod.name}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">
                    {mod.f1Score ? `F1 Score: ${mod.f1Score}` : `Z-Score Threshold: ${mod.zScoreThreshold}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Re-seed Tool */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-3 warm-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#CC5500]" /> Intelligence Database Initializer
              </h2>
              <p className="text-xs text-[var(--text-muted)] max-w-xl">
                Populate MongoDB with verified CISA KEV catalog entries, abuse.ch IOCs, and FIRST EPSS scores. Only affects empty collections — existing records are preserved.
              </p>
            </div>

            <button
              onClick={handleReSeed}
              disabled={seeding}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#A8321C] text-white hover:bg-[#8D2814] transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
            >
              {seeding ? "Initializing..." : "Initialize Intelligence"}
            </button>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 warm-shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#CC5500]" /> Organization User Management
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Manage roles (Admin, Analyst, Viewer) and access control policies
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="p-2 rounded-xl border border-[var(--border-color)] text-xs hover:bg-[var(--bg-page)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {usersLoading ? (
            <div className="text-xs text-[var(--text-muted)] font-mono py-6 text-center">
              Loading users...
            </div>
          ) : usersList.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] font-mono py-6 text-center">
              No users found. Connect MongoDB and run /api/v1/seed to initialize accounts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px] uppercase bg-[var(--bg-page)]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Login</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-[var(--bg-page)] transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[var(--text-primary)]">{u.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-mono font-bold uppercase text-[#CC5500] cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="analyst">Analyst</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            u.isActive
                              ? "bg-[#E3ECDD] text-[#6B8F5E]"
                              : "bg-[#F5E6E0] text-[#A8321C]"
                          }`}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--text-muted)] font-mono">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          {u.role === "admin" ? "Full Access" : "Restricted"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 warm-shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#CC5500]" /> Security Audit Logs
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Chronological audit trail of operator logins, rule updates, and feed executions
              </p>
            </div>
            <button
              onClick={handleExportAudit}
              disabled={auditLogs.length === 0}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-[var(--bg-page)] flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          {auditLoading ? (
            <div className="text-xs text-[var(--text-muted)] font-mono py-6 text-center">
              Loading audit logs...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] font-mono py-6 text-center">
              No audit events recorded yet. Events are logged as users interact with the system.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {log.action}
                    </span>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      User: {log.userName || log.user || "—"} • IP: {log.ip || "—"}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">
                    {log.at ? new Date(log.at).toLocaleString() : (log.createdAt ? new Date(log.createdAt).toLocaleString() : "—")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
