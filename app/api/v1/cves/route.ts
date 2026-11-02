import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Vulnerability } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = getSeedStore();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const isKev = searchParams.get("isKev");
  const minCvss = parseFloat(searchParams.get("minCvss") || "0");

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const count = await Vulnerability.countDocuments();
      if (count > 0) {
        const query: Record<string, any> = {};
        if (isKev === "true") query.isKev = true;
        if (minCvss > 0) query.cvssScore = { $gte: minCvss };
        if (search) {
          query.$or = [
            { cveId: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { "affected.vendor": { $regex: search, $options: "i" } },
            { "affected.product": { $regex: search, $options: "i" } },
          ];
        }
        const total = await Vulnerability.countDocuments(query);
        const cves = await Vulnerability.find(query)
          .sort({ isKev: -1, cvssScore: -1, publishedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        return NextResponse.json({
          success: true,
          data: cves,
          meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }
    }
  } catch (err) {
    console.warn("MongoDB CVE query fallback:", err);
  }

  // Fallback to store
  let filtered = store.cves;
  if (isKev === "true") filtered = filtered.filter((c) => c.isKev);
  if (minCvss > 0) filtered = filtered.filter((c) => c.cvssScore >= minCvss);
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.cveId.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.affected.some((a: any) => a.vendor.toLowerCase().includes(search) || a.product.toLowerCase().includes(search))
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
