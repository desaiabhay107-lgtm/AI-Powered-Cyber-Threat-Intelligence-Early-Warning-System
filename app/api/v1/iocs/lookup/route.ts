import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { IOC, Vulnerability, Threat } from "@/lib/models";
import { evaluateIOC, calculateRiskScore } from "@/lib/ai";

export const dynamic = "force-dynamic";

function detectIndicatorType(input: string): "ip" | "domain" | "url" | "md5" | "sha1" | "sha256" | "cve" | "email" {
  const clean = input.trim();

  if (/^cve-\d{4}-\d{4,}$/i.test(clean)) return "cve";
  if (/^https?:\/\//i.test(clean)) return "url";
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(clean)) return "ip";
  if (/^[a-f0-9]{32}$/i.test(clean)) return "md5";
  if (/^[a-f0-9]{40}$/i.test(clean)) return "sha1";
  if (/^[a-f0-9]{64}$/i.test(clean)) return "sha256";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return "email";
  return "domain";
}

export async function POST(request: Request) {
  try {
    const { indicator } = await request.json();
    if (!indicator || !indicator.trim()) {
      return NextResponse.json(
        { success: false, error: "Indicator value is required" },
        { status: 400 }
      );
    }

    const value = indicator.trim();
    const detectedType = detectIndicatorType(value);

    await connectToDatabase();

    // Check if CVE
    if (detectedType === "cve") {
      const vuln = await Vulnerability.findOne({ cveId: value.toUpperCase() });
      if (vuln) {
        return NextResponse.json({
          success: true,
          data: {
            type: "cve",
            indicator: vuln.cveId,
            verdict: vuln.isKev ? "malicious" : "suspicious",
            riskScore: vuln.riskScore,
            details: vuln,
            explanation: `Identified CVE vulnerability rated at CVSS ${vuln.cvssScore}. ${
              vuln.isKev ? "Flagged on CISA Known Exploited Vulnerabilities catalog." : ""
            }`,
          },
        });
      }
    }

    // Check existing stored record
    let storedRecord = await IOC.findOne({ value });

    // AI Evaluation & Explainable Scoring
    const aiEval = evaluateIOC(value, detectedType);
    const scoreEval = calculateRiskScore({
      severity: aiEval.verdict === "malicious" ? "critical" : aiEval.verdict === "suspicious" ? "high" : "low",
      sourceCount: storedRecord ? 3 : 1,
      publishedAt: storedRecord?.firstSeen || new Date(),
      matchesWatchedAsset: false,
    });

    const relatedThreats = await Threat.find({
      $or: [{ tags: { $regex: value, $options: "i" } }, { title: { $regex: value, $options: "i" } }],
    }).limit(3);

    return NextResponse.json({
      success: true,
      data: {
        indicator: value,
        detectedType,
        verdict: storedRecord?.verdict || aiEval.verdict,
        confidence: storedRecord?.confidence || 85,
        riskScore: storedRecord?.riskScore || aiEval.riskScore,
        factors: scoreEval.factors,
        reasons: aiEval.reasons,
        geo: storedRecord?.geo || {
          country: "United States",
          countryCode: "US",
          lat: 37.77,
          lng: -122.41,
          org: "Cloud Hosting Provider",
        },
        firstSeen: storedRecord?.firstSeen || new Date(),
        lastSeen: storedRecord?.lastSeen || new Date(),
        malwareFamily: storedRecord?.malwareFamily || "Unassigned / Generic Threat",
        relatedThreats,
        recommendation:
          (storedRecord?.verdict || aiEval.verdict) === "malicious"
            ? "CRITICAL: Immediately block this indicator on firewalls, DNS resolvers, and email gateways."
            : "MONITOR: Log occurrences and query internal endpoint history for recent contact.",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error performing IOC lookup";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
