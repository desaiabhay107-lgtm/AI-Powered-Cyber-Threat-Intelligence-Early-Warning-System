import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Alert } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = getSeedStore();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const count = await Alert.countDocuments();
      if (count > 0) {
        const query: Record<string, any> = {};
        if (status && status !== "all") query.status = status;
        if (severity && severity !== "all") query.severity = severity;

        const alerts = await Alert.find(query)
          .sort({ createdAt: -1 })
          .populate("assetIds", "name type vendor criticality");

        return NextResponse.json({ success: true, data: alerts });
      }
    }
  } catch (err) {
    console.warn("MongoDB alerts query fallback:", err);
  }

  // Fallback to store
  let filtered = store.alerts;
  if (status && status !== "all") filtered = filtered.filter((a) => a.status === status);
  if (severity && severity !== "all") filtered = filtered.filter((a) => a.severity === severity);

  return NextResponse.json({ success: true, data: filtered });
}
