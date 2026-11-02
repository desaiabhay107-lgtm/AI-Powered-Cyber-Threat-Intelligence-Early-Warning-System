import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Threat } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getSeedStore();

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const counts = await Threat.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      if (counts.length > 0) {
        const formatted = counts.map((c) => ({
          name: c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : "Other",
          key: c._id || "other",
          count: c.count,
        }));
        return NextResponse.json({ success: true, data: formatted });
      }
    }
  } catch (err) {
    console.warn("MongoDB categories query fallback:", err);
  }

  // Fallback to store distribution
  const countsMap: Record<string, number> = {};
  store.threats.forEach((t) => {
    countsMap[t.type] = (countsMap[t.type] || 0) + 1;
  });

  const formatted = Object.entries(countsMap).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    key: k,
    count: v,
  }));

  return NextResponse.json({ success: true, data: formatted });
}
