import connectToDatabase from "@/lib/mongoose";
import { Vulnerability, Threat } from "@/lib/models";

const CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

export interface KevEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes?: string;
}

export async function ingestCisaKev(limit = 100): Promise<{ ingested: number; updated: number; error?: string }> {
  try {
    const res = await fetch(CISA_KEV_URL, {
      headers: { "User-Agent": "EmberWatch-CTI/2.0 (Security Intelligence System)" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`CISA KEV fetch failed with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const vulnerabilities: KevEntry[] = data.vulnerabilities || [];

    await connectToDatabase();

    let ingested = 0;
    let updated = 0;

    // Process most recent KEV vulnerabilities first
    const slice = vulnerabilities.slice(-limit).reverse();

    for (const v of slice) {
      const cveId = v.cveID.trim();
      const isRansomware = v.knownRansomwareCampaignUse?.toLowerCase() === "known";
      const riskScore = isRansomware ? 99 : 95;

      const existing = await Vulnerability.findOne({ cveId });

      if (existing) {
        existing.isKev = true;
        existing.kevDateAdded = new Date(v.dateAdded);
        existing.aiRemediation = [v.requiredAction];
        if (v.shortDescription && existing.description.length < 50) {
          existing.description = v.shortDescription;
        }
        await existing.save();
        updated += 1;
      } else {
        await Vulnerability.create({
          cveId,
          description: v.shortDescription || v.vulnerabilityName,
          cvssScore: 9.8,
          severity: "critical",
          epssScore: isRansomware ? 0.94 : 0.85,
          isKev: true,
          kevDateAdded: new Date(v.dateAdded),
          affected: [
            {
              vendor: v.vendorProject,
              product: v.product,
              versions: ["All vulnerable unpatched versions"],
            },
          ],
          cwe: ["CWE-119"],
          references: [`https://nvd.nist.gov/vuln/detail/${cveId}`],
          publishedAt: new Date(v.dateAdded),
          riskScore,
          aiSummary: `CISA mandated mitigation: ${v.vulnerabilityName}. ${isRansomware ? "Actively weaponized in known ransomware extortion campaigns." : "Observed in active exploitation."}`,
          aiRemediation: [v.requiredAction, "Audit network perimeter for indicators of exploit."],
        });
        ingested += 1;
      }

      // If associated with known ransomware campaign, register a threat campaign document
      if (isRansomware) {
        const threatTitle = `Active Ransomware Exploitation: ${v.product} (${cveId})`;
        const existingThreat = await Threat.findOne({ cveIds: cveId });
        if (!existingThreat) {
          await Threat.create({
            title: threatTitle,
            summary: `CISA KEV flagged active ransomware campaign exploiting ${v.vendorProject} ${v.product} via ${cveId}.`,
            aiSummary: `High-priority extortion risk: ${v.requiredAction}. Mandated remediation deadline: ${v.dueDate}.`,
            type: "ransomware",
            severity: "critical",
            riskScore: 98,
            source: "CISA KEV Catalog",
            tags: ["cisa-kev", "ransomware", v.vendorProject.toLowerCase()],
            cveIds: [cveId],
            sector: ["Defense", "Healthcare", "Finance", "Critical Infrastructure"],
            firstSeen: new Date(v.dateAdded),
            lastSeen: new Date(),
          });
        }
      }
    }

    return { ingested, updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "CISA KEV ingestion failed";
    console.error("[CISA KEV Ingestion Error]:", msg);
    return { ingested: 0, updated: 0, error: msg };
  }
}
