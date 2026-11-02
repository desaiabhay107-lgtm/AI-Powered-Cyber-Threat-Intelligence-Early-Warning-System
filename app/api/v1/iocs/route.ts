import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { IOC } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = getSeedStore();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "25", 10));
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const type = searchParams.get("type");
  const verdict = searchParams.get("verdict");

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const count = await IOC.countDocuments();
      if (count > 0) {
        const query: Record<string, any> = {};
        if (type && type !== "all") query.type = type;
        if (verdict && verdict !== "all") query.verdict = verdict;
        if (search) {
          query.$or = [
            { value: { $regex: search, $options: "i" } },
            { malwareFamily: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ];
        }

        const total = await IOC.countDocuments(query);
        const iocs = await IOC.find(query)
          .sort({ riskScore: -1, lastSeen: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        return NextResponse.json({
          success: true,
          data: iocs,
          meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }
    }
  } catch (err) {
    console.warn("MongoDB IOCs query fallback:", err);
  }

  // Fallback to store
  let filtered = store.iocs;
  if (type && type !== "all") filtered = filtered.filter((i) => i.type === type);
  if (verdict && verdict !== "all") filtered = filtered.filter((i) => i.verdict === verdict);
  if (search) {
    filtered = filtered.filter(
      (i) =>
        i.value.toLowerCase().includes(search) ||
        (i.malwareFamily && i.malwareFamily.toLowerCase().includes(search))
    );
  }

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  return NextResponse.json({
    success: true,
    data: paginated,
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}
