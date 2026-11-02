import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { FeedSource, IngestionRun } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }
    await connectToDatabase();
    const feeds = await FeedSource.find({}).sort({ name: 1 });
    const recentRuns = await IngestionRun.find({}).sort({ startedAt: -1 }).limit(10);
    return NextResponse.json({ success: true, data: { feeds, recentRuns } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching feeds";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
