import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Alert } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();
    const updateData: Record<string, any> = {};

    if (body.status) {
      updateData.status = body.status;
      if (body.status === "investigating") updateData.acknowledgedAt = new Date();
      if (body.status === "mitigated" || body.status === "false_positive") {
        updateData.resolvedAt = new Date();
      }
    }
    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo;
    }

    const updated = await Alert.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error updating alert";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
