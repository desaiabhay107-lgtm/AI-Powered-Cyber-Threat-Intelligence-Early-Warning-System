import connectToDatabase from "@/lib/mongoose";
import { Vulnerability } from "@/lib/models";

const FIRST_EPSS_API = "https://api.first.org/data/v1/epss";

export async function ingestFirstEpss(): Promise<{ updated: number; error?: string }> {
  try {
    await connectToDatabase();

    // Query top 30 CVEs from database to update their real-time EPSS scores
    const cves = await Vulnerability.find({}).sort({ publishedAt: -1 }).limit(30);
    if (cves.length === 0) {
      return { updated: 0 };
    }

    const cveIds = cves.map((c) => c.cveId).join(",");
    const res = await fetch(`${FIRST_EPSS_API}?cve=${cveIds}`, {
      headers: { "User-Agent": "EmberWatch-CTI/2.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`FIRST EPSS API responded with status ${res.status}`);
    }

    const json = await res.json();
    const data: Array<{ cve: string; epss: string; percentile: string }> = json.data || [];

    let updated = 0;
    for (const item of data) {
      const epssNum = parseFloat(item.epss);
      if (!isNaN(epssNum)) {
        await Vulnerability.updateOne(
          { cveId: item.cve },
          {
            $set: {
              epssScore: epssNum,
              riskScore: Math.round(90 * epssNum + 10),
            },
          }
        );
        updated += 1;
      }
    }

    return { updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "FIRST EPSS sync failed";
    console.error("[FIRST EPSS Ingestion Error]:", msg);
    return { updated: 0, error: msg };
  }
}
