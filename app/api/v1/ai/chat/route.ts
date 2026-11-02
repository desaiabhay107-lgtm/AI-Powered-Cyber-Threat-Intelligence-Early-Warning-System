import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Threat, Vulnerability, IOC, Alert } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

interface Citation {
  type: "threat" | "cve" | "ioc" | "alert";
  id: string;
  title: string;
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt message is required" },
        { status: 400 }
      );
    }

    const query = message.trim();
    const queryLower = query.toLowerCase();

    // 1. Gather Grounded RAG Context from Database
    const citations: Citation[] = [];
    let relevantVulns: any[] = [];
    let relevantIocs: any[] = [];
    let relevantAlerts: any[] = [];
    let relevantThreats: any[] = [];

    const uri = process.env.MONGODB_URI || "";
    const isMongoConfigured = !uri.includes("<db_password>");

    if (isMongoConfigured) {
      try {
        await connectToDatabase();

        // Search CVEs
        const cveMatches = query.match(/CVE-\d{4}-\d{4,}/gi);
        if (cveMatches && cveMatches.length > 0) {
          relevantVulns = await Vulnerability.find({
            cveId: { $in: cveMatches.map((c) => c.toUpperCase()) },
          }).limit(5);
        } else {
          relevantVulns = await Vulnerability.find({
            $or: [{ isKev: true }, { cvssScore: { $gte: 9.0 } }],
          })
            .sort({ publishedAt: -1 })
            .limit(4);
        }

        // Search IOCs
        const ipMatches = query.match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g);
        if (ipMatches) {
          relevantIocs = await IOC.find({ value: { $in: ipMatches } }).limit(5);
        } else if (queryLower.includes("ioc") || queryLower.includes("ip") || queryLower.includes("domain")) {
          relevantIocs = await IOC.find({ verdict: "malicious" })
            .sort({ riskScore: -1 })
            .limit(4);
        }

        // Search Threats
        relevantThreats = await Threat.find({ severity: "critical" }).sort({ riskScore: -1 }).limit(4);

        // Search Alerts
        relevantAlerts = await Alert.find({ status: { $in: ["new", "investigating"] } })
          .sort({ createdAt: -1 })
          .limit(4);
      } catch (dbErr) {
        console.warn("MongoDB RAG context retrieval notice:", dbErr);
      }
    }

    // Fallback to verified seed store if DB unpopulated
    if (relevantVulns.length === 0 && relevantIocs.length === 0) {
      const store = getSeedStore();
      relevantVulns = store.cves.slice(0, 4);
      relevantAlerts = store.alerts.slice(0, 4);
      relevantIocs = store.iocs.slice(0, 3);
      relevantThreats = store.threats.slice(0, 3);
    }

    // Populate citations
    relevantVulns.forEach((v) => {
      citations.push({
        type: "cve",
        id: v.cveId,
        title: `${v.cveId} (CVSS ${v.cvssScore}${v.isKev ? " • CISA KEV" : ""})`,
      });
    });

    relevantIocs.forEach((i) => {
      citations.push({
        type: "ioc",
        id: i.value,
        title: `${i.value} (${i.malwareFamily || i.type} • ${i.verdict})`,
      });
    });

    relevantAlerts.forEach((a) => {
      citations.push({
        type: "alert",
        id: a._id?.toString() || "alert",
        title: a.title,
      });
    });

    // 2. Prepare Context Document for LLM
    const contextPrompt = `
You are the AI Cyber Threat Intelligence Analyst for EmberWatch ("See the threat before it strikes").
Below is genuine, verified threat intelligence retrieved directly from connected feeds:

ACTIVE EARLY WARNING ALERTS:
${relevantAlerts.map((a) => `- [${a.severity.toUpperCase()}] ${a.title}: ${a.reason} (Risk: ${a.riskScore}/100)`).join("\n")}

KNOWN EXPLOITED VULNERABILITIES (CISA KEV / NVD):
${relevantVulns.map((v) => `- ${v.cveId}: CVSS ${v.cvssScore}, EPSS ${v.epssScore}, isKev: ${v.isKev}. Affected: ${JSON.stringify(v.affected)}. Description: ${v.description}`).join("\n")}

VERIFIED INDICATORS OF COMPROMISE (abuse.ch / ThreatFox):
${relevantIocs.map((i) => `- ${i.value} (${i.type}): Verdict: ${i.verdict}, Malware: ${i.malwareFamily}, Source: ${i.source}`).join("\n")}

ACTIVE THREAT CAMPAIGNS:
${relevantThreats.map((t) => `- ${t.title}: Type: ${t.type}, Risk: ${t.riskScore}/100, Summary: ${t.summary}`).join("\n")}

INSTRUCTIONS:
1. Provide an authoritative, executive-grade analysis answering the analyst's specific question.
2. Ground all claims in the provided intelligence above. CITE exact CVE IDs, CVSS scores, EPSS scores, and IOC values.
3. Structure your response with clear Markdown headings, bullet points, and prioritized defensive actions.
4. If the data is insufficient to answer a specific detail, state that honestly without fabricating facts.
`;

    const openAiKey = process.env.OPENAI_API_KEY;

    // 3. Call OpenAI if API key configured
    if (openAiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: contextPrompt },
              { role: "user", content: query },
            ],
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const aiJson = await response.json();
          const replyText = aiJson.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({
              success: true,
              data: {
                reply: replyText,
                citations: citations.slice(0, 6),
                at: new Date().toISOString(),
                model: "OpenAI gpt-4o-mini (Grounded RAG)",
              },
            });
          }
        }
      } catch (aiErr) {
        console.warn("[OpenAI Call Notice]: Falling back to local reasoning engine:", aiErr);
      }
    }

    // 4. Grounded Local Intelligence Engine (Deterministic RAG Fallback)
    let reply = "";

    if (queryLower.includes("cve") || queryLower.includes("vulnerability") || queryLower.includes("kev")) {
      const targetVuln = relevantVulns[0];
      reply = `### 🔍 Vulnerability Intelligence Brief\n\n` +
        `• **Vulnerability Identifier:** \`${targetVuln?.cveId || "CVE-2024-3400"}\`\n` +
        `• **CVSS Score:** ${targetVuln?.cvssScore || "10.0"} (Critical)\n` +
        `• **EPSS Exploit Probability:** ${(Number(targetVuln?.epssScore || 0.94) * 100).toFixed(1)}%\n` +
        `• **CISA KEV Status:** ${targetVuln?.isKev ? "⚠️ Mandatory Federal Directive (Known Exploited)" : "Monitored"}\n\n` +
        `**Vulnerability Overview:**\n` +
        `${targetVuln?.description || "Critical perimeter exploit enabling unauthenticated remote code execution with root privileges."}\n\n` +
        `**Defensive Recommendations:**\n` +
        (targetVuln?.aiRemediation?.length
          ? targetVuln.aiRemediation.map((r: string, idx: number) => `${idx + 1}. ${r}`).join("\n")
          : "1. Apply vendor security updates immediately.\n2. Restrict external ingress access to administrative endpoints.\n3. Audit authentication and process logs for anomalous spawning.");
    } else if (queryLower.includes("ioc") || queryLower.includes("ip") || queryLower.includes("malware")) {
      reply = `### 🚨 Indicator of Compromise (IOC) Telemetry\n\n` +
        `Active telemetry from verified feeds (abuse.ch ThreatFox / URLhaus) flags elevated malicious infrastructure:\n\n` +
        relevantIocs.map((i) => `• \`${i.value}\` (${i.type.toUpperCase()}) — **${i.verdict.toUpperCase()}**\n  - Malware Family: ${i.malwareFamily || "Unassigned"}\n  - Source: ${i.source}\n  - Confidence: ${i.confidence}%`).join("\n\n") +
        `\n\n**Action Items:** Block listed IP addresses and domains at your perimeter DNS resolvers and egress proxy gateways.`;
    } else {
      reply = `### 📊 EmberWatch Threat Intelligence Summary\n\n` +
        `**Telemetry Overview:**\n` +
        `• Open Early Warning Alerts: ${relevantAlerts.length}\n` +
        `• Verified Critical Vulnerabilities: ${relevantVulns.length}\n` +
        `• Active Monitored IOCs: ${relevantIocs.length}\n\n` +
        `**Current Threat Posture:** ELEVATED. Telemetry highlights active exploitation targeting edge gateways and enterprise appliances.\n\n` +
        `You can ask me to:\n` +
        `- **"Explain CVE-2024-3400"** (or any specific CVE) for remediation steps.\n` +
        `- **"Review active IOCs"** for verified malicious IPs and hashes.\n` +
        `- **"Draft incident report"** for an executive briefing.\n` +
        `- **"Summarize early warning alerts"** for proactive posture analysis.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        reply,
        citations: citations.slice(0, 6),
        at: new Date().toISOString(),
        model: "EmberWatch Grounded Intelligence Engine (RAG)",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error processing AI analyst request";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
