import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";
    const result = await seedDatabase(force);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error seeding database";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await seedDatabase(false);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error seeding database";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
