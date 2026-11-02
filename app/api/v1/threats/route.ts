import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Threat } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = getSeedStore();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const severity = searchParams.get("severity");
  const type = searchParams.get("type");
  const source = searchParams.get("source");

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const count = await Threat.countDocuments();
      if (count > 0) {
        const query: Record<string, any> = {};
        if (severity && severity !== "all") query.severity = severity;
        if (type && type !== "all") query.type = type;
        if (source && source !== "all") query.source = { $regex: source, $options: "i" };
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: "i" } },
            { summary: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ];
        }

        const total = await Threat.countDocuments(query);
        const threats = await Threat.find(query)
          .sort({ riskScore: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        return NextResponse.json({
          success: true,
          data: threats,
          meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }
    }
  } catch (err) {
    console.warn("MongoDB threats query fallback:", err);
  }

  // Fallback to store
  let filtered = store.threats;
  if (severity && severity !== "all") filtered = filtered.filter((t) => t.severity === severity);
  if (type && type !== "all") filtered = filtered.filter((t) => t.type === type);
  if (source && source !== "all") filtered = filtered.filter((t) => t.source.toLowerCase().includes(source.toLowerCase()));
  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.summary.toLowerCase().includes(search) ||
        t.tags.some((tg: string) => tg.toLowerCase().includes(search))
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
