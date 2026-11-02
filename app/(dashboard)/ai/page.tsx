"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, Shield, ExternalLink, Link2, User, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    type: "threat" | "cve" | "ioc";
    id: string;
    title: string;
  }>;
  at?: string;
}

export default function AiAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the EmberWatch AI Threat Analyst. I am grounded directly in your stored threat intelligence, CISA KEV catalog, CVE database, and IOC intelligence. How can I assist your security operations today?",
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    "Summarise today's critical threats",
    "What are the most exploited CVEs right now?",
    "Explain CVE-2024-3400 and remediation",
    "Draft an incident brief for active C2 beaconing",
  ];

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: json.data.reply,
            citations: json.data.citations,
            at: new Date(json.data.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <div>
          <div className="eyebrow text-[#CC5500] mb-1">GROUNDED COPILOT</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Bot className="w-7 h-7 text-[#CC5500]" /> EmberWatch AI <span className="italic font-normal text-[#CC5500]">Analyst.</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
            Grounded intelligence assistant equipped with retrieval-augmented generation and citation verification.
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] warm-shadow-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#CC5500] to-[#A8321C] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                msg.role === "user"
                  ? "bg-[#CC5500] text-white"
                  : "bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-color)]"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-[var(--border-color)] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#CC5500] font-bold block">
                    Verified Citations & Grounded Intelligence:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <Link2 className="w-3 h-3 text-[#CC5500]" /> {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[9px] font-mono ${
                  msg.role === "user" ? "text-white/80 text-right" : "text-[var(--text-muted)]"
                }`}
              >
                {msg.at}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-[#4E3324] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#CC5500]" />
            Consulting threat feeds and synthesizing response...
          </div>
        )}
      </div>

      {/* Suggested Prompts Pill Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
          Suggested:
        </span>
        {suggestedPrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full text-xs border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#CC5500] hover:text-[#CC5500] transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Analyst to evaluate CVEs, investigate indicators, or summarize perimeter risk..."
          className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-[#CC5500] text-white hover:bg-[#B04A00] transition-colors disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
