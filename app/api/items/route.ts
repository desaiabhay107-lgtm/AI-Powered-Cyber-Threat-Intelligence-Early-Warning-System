import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Item from "@/models/Item";

export const dynamic = "force-dynamic";

export async function GET() {
  const uri = process.env.MONGODB_URI || "";
  if (uri.includes("<db_password>")) {
    return NextResponse.json(
      { error: "Please configure your database password in .env.local" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const items = await Item.find({}).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching items";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uri = process.env.MONGODB_URI || "";
  if (uri.includes("<db_password>")) {
    return NextResponse.json(
      { error: "Please configure your database password in .env.local" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    await connectToDatabase();
    const item = await Item.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating item";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
