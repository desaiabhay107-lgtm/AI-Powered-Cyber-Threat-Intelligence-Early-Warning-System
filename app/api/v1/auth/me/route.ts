import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, data: { user: null } });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        },
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error verifying session";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
