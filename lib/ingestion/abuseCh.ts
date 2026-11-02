import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import { IOC, Threat } from "@/lib/models";

const THREATFOX_API = "https://threatfox-api.abuse.ch/api/v1/";
const URLHAUS_API = "https://urlhaus-api.abuse.ch/v1/urls/recent/";

export async function ingestAbuseCh(limit = 100): Promise<{ ingested: number; updated: number; error?: string }> {
  let ingested = 0;
  let updated = 0;

  try {
    await connectToDatabase();

    // 1. Ingest ThreatFox IOCs
    try {
      const tfRes = await fetch(THREATFOX_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "EmberWatch-CTI/2.0",
        },
        body: JSON.stringify({ query: "get_iocs", days: 1 }),
        next: { revalidate: 1800 },
      });

      if (tfRes.ok) {
        const tfData = await tfRes.json();
        if (tfData.query_status === "ok" && Array.isArray(tfData.data)) {
          const slice = tfData.data.slice(0, limit);
          for (const item of slice) {
            const rawVal = item.ioc || item.ioc_value;
            if (!rawVal) continue;

            const cleanVal = rawVal.split(":")[0]; // Strip port for IP addresses if needed
            const rawType = item.ioc_type || "ip";
            const type = rawType.includes("ip")
              ? "ip"
              : rawType.includes("domain")
              ? "domain"
              : rawType.includes("url")
              ? "url"
              : "sha256";

            const malware = item.malware_printable || item.malware || "Malware";
            const confidence = item.confidence_level || 85;
            const risk = Math.min(100, Math.round(confidence * 0.95) + 5);

            const fingerprint = crypto
              .createHash("sha256")
              .update(`${type}:${cleanVal}`)
              .digest("hex");

            const existing = await IOC.findOne({ fingerprint });

            if (existing) {
              existing.lastSeen = new Date();
              existing.confidence = confidence;
              await existing.save();
              updated += 1;
            } else {
              await IOC.create({
                value: cleanVal,
                type,
                source: "abuse.ch ThreatFox",
                sourceRef: item.threat_type_desc || "ThreatFox Live Feed",
                malwareFamily: malware,
                threatType: item.threat_type || "malware",
                tags: item.tags || [type, malware.toLowerCase()],
                confidence,
                riskScore: risk,
                verdict: "malicious",
                firstSeen: item.first_seen ? new Date(item.first_seen) : new Date(),
                lastSeen: new Date(),
                fingerprint,
              });
              ingested += 1;
            }
          }
        }
      }
    } catch (tfErr) {
      console.warn("[ThreatFox Sync Notice]:", tfErr);
    }

    // 2. Ingest URLhaus Recent Malicious URLs
    try {
      const uhRes = await fetch(URLHAUS_API, {
        headers: { "User-Agent": "EmberWatch-CTI/2.0" },
        next: { revalidate: 1800 },
      });

      if (uhRes.ok) {
        const uhData = await uhRes.json();
        if (uhData.query_status === "ok" && Array.isArray(uhData.urls)) {
          const slice = uhData.urls.slice(0, Math.floor(limit / 2));
          for (const item of slice) {
            const urlVal = item.url;
            if (!urlVal) continue;

            const fingerprint = crypto
              .createHash("sha256")
              .update(`url:${urlVal}`)
              .digest("hex");

            const existing = await IOC.findOne({ fingerprint });

            if (existing) {
              existing.lastSeen = new Date();
              await existing.save();
              updated += 1;
            } else {
              await IOC.create({
                value: urlVal,
                type: "url",
                source: "abuse.ch URLhaus",
                sourceRef: item.urlhaus_reference,
                malwareFamily: item.threat || "Malware Distribution",
                threatType: "malware",
                tags: item.tags || ["urlhaus", "payload"],
                confidence: 90,
                riskScore: 92,
                verdict: "malicious",
                firstSeen: item.date_added ? new Date(item.date_added) : new Date(),
                lastSeen: new Date(),
                fingerprint,
              });
              ingested += 1;
            }
          }
        }
      }
    } catch (uhErr) {
      console.warn("[URLhaus Sync Notice]:", uhErr);
    }

    return { ingested, updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "abuse.ch ingestion error";
    console.error("[abuse.ch Ingestion Error]:", msg);
    return { ingested, updated, error: msg };
  }
}
