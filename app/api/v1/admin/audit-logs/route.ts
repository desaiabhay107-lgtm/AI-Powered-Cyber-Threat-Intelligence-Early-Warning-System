import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { AuditLog } from "@/lib/models";

export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  await connectToDatabase();

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);

  // AuditLog model may not exist if old — gracefully fall back to empty
  let logs: any[] = [];
  try {
    logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  } catch {
    logs = [];
  }

  return NextResponse.json({ success: true, data: logs });
}
