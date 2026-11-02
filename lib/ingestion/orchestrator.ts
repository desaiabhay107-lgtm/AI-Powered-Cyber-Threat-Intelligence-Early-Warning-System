import connectToDatabase from "@/lib/mongoose";
import { FeedSource, IngestionRun } from "@/lib/models";
import { ingestCisaKev } from "./cisaKev";
import { ingestFirstEpss } from "./firstEpss";
import { ingestAbuseCh } from "./abuseCh";
import { runEarlyWarningEngine } from "@/lib/rules/engine";

export async function runFeedIngestion(
  feedKey: string
): Promise<{ success: boolean; recordsIngested: number; errorLog: string[] }> {
  const start = Date.now();
  const errorLog: string[] = [];
  let recordsIngested = 0;

  await connectToDatabase();

  try {
    if (feedKey === "cisa_kev" || feedKey === "all") {
      const res = await ingestCisaKev(150);
      recordsIngested += res.ingested + res.updated;
      if (res.error) errorLog.push(`CISA KEV: ${res.error}`);
    }

    if (feedKey === "first_epss" || feedKey === "all") {
      const res = await ingestFirstEpss();
      recordsIngested += res.updated;
      if (res.error) errorLog.push(`FIRST EPSS: ${res.error}`);
    }

    if (feedKey === "abuse_ch" || feedKey === "all") {
      const res = await ingestAbuseCh(100);
      recordsIngested += res.ingested + res.updated;
      if (res.error) errorLog.push(`abuse.ch: ${res.error}`);
    }

    const durationMs = Date.now() - start;
    const status = errorLog.length > 0 && recordsIngested === 0 ? "failed" : "success";

    // Record IngestionRun in MongoDB
    await IngestionRun.create({
      feedKey,
      startedAt: new Date(start),
      finishedAt: new Date(),
      status,
      fetched: recordsIngested,
      inserted: recordsIngested,
      updated: 0,
      errorLog,
    });

    // Update FeedSource tracking document
    await FeedSource.findOneAndUpdate(
      { key: feedKey },
      {
        $set: {
          lastRunAt: new Date(),
          lastStatus: status === "success" ? "healthy" : "failing",
          recordsLastRun: recordsIngested,
        },
      },
      { upsert: false }
    );

    // Correlate newly ingested intelligence with organizational assets
    try {
      await runEarlyWarningEngine();
    } catch (engineErr) {
      console.warn("[Early Warning Engine Trigger Notice]:", engineErr);
    }

    return {
      success: status === "success",
      recordsIngested,
      errorLog,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Orchestrator failed";
    errorLog.push(msg);
    return {
      success: false,
      recordsIngested,
      errorLog,
    };
  }
}
