import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/lib/models";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  await connectToDatabase();

  const users = await User.find({}, { passwordHash: 0, failedLoginAttempts: 0, lockoutUntil: 0 })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, data: users });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  await connectToDatabase();

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role || !["admin", "analyst", "viewer"].includes(role)) {
    return NextResponse.json({ success: false, error: "Invalid userId or role" }, { status: 400 });
  }

  // Prevent self-demotion of the last admin
  if (role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    const targetUser = await User.findById(userId).lean() as any;
    if (adminCount <= 1 && targetUser?.role === "admin") {
      return NextResponse.json({ success: false, error: "Cannot remove the last admin account" }, { status: 400 });
    }
  }

  const updated = await User.findByIdAndUpdate(userId, { role }, { new: true, projection: { passwordHash: 0 } });
  if (!updated) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}
