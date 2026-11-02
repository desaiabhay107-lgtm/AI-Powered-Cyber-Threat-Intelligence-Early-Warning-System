import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { IOC } from "@/lib/models";
import { getSeedStore } from "@/lib/store/seedStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getSeedStore();

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const iocsWithGeo = await IOC.find({
        "geo.lat": { $exists: true, $ne: null },
      })
        .select("value type geo malwareFamily riskScore verdict")
        .limit(60);

      if (iocsWithGeo.length > 0) {
        const points = iocsWithGeo.map((ioc) => ({
          id: ioc._id,
          indicator: ioc.value,
          type: ioc.type,
          lat: ioc.geo?.lat || 0,
          lng: ioc.geo?.lng || 0,
          country: ioc.geo?.country || "Unknown",
          countryCode: ioc.geo?.countryCode || "",
          malwareFamily: ioc.malwareFamily || "Unassigned",
          riskScore: ioc.riskScore,
          verdict: ioc.verdict,
        }));
        return NextResponse.json({ success: true, data: points });
      }
    }
  } catch (err) {
    console.warn("MongoDB map query fallback:", err);
  }

  // Fallback to seeded geolocations
  const fallbackPoints = store.iocs
    .filter((ioc) => ioc.geo && ioc.geo.lat)
    .slice(0, 40)
    .map((ioc) => ({
      id: ioc._id,
      indicator: ioc.value,
      type: ioc.type,
      lat: ioc.geo.lat,
      lng: ioc.geo.lng,
      country: ioc.geo.country,
      countryCode: ioc.geo.countryCode,
      malwareFamily: ioc.malwareFamily,
      riskScore: ioc.riskScore,
      verdict: ioc.verdict,
    }));

  return NextResponse.json({ success: true, data: fallbackPoints });
}
