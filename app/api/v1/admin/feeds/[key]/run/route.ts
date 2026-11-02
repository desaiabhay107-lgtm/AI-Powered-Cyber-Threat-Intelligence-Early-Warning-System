import { NextResponse } from "next/server";
import { getSessionUser, checkRBAC } from "@/lib/auth";
import { runFeedIngestion } from "@/lib/ingestion/orchestrator";
import dbConnect from "@/lib/mongoose";
import { AuditLog } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRBAC(user, ["admin"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only administrators can trigger feed ingestion" },
        { status: 403 }
      );
    }

    const { key } = await params;
    const result = await runFeedIngestion(key);

    // Write audit log non-critically
    try {
      await dbConnect();
      await AuditLog.create({
        userId: user.userId || user.id,
        userName: user.email,
        action: "FEED_SYNC_TRIGGERED",
        entity: "FeedSource",
        entityId: key,
        ip: "server",
        at: new Date(),
      });
    } catch { /* ignore */ }

    return NextResponse.json({
      success: result.success,
      data: {
        recordsIngested: result.recordsIngested,
        errorLog: result.errorLog,
      },
      message: result.success
        ? `Successfully synchronized feed "${key}" with external source.`
        : `Feed ingestion encountered warnings: ${result.errorLog.join("; ")}`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error running feed sync";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
