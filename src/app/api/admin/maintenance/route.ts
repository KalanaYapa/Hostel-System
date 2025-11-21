import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all maintenance requests
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication - try cookie first, then Authorization header
    let token = request.cookies.get("admin_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await db.scanByType(EntityType.MAINTENANCE);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get maintenance requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    );
  }
}

// Update maintenance request status
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication - try cookie first, then Authorization header
    let token = request.cookies.get("admin_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, studentId, status, adminNotes } = body;

    if (!requestId || !studentId || !status) {
      return NextResponse.json(
        { error: "Request ID, student ID, and status are required" },
        { status: 400 }
      );
    }

    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (adminNotes) {
      updates.adminNotes = adminNotes;
    }

    if (status === "completed") {
      updates.resolvedAt = new Date().toISOString();
    }

    const updatedRequest = await db.update(
      `${EntityType.MAINTENANCE}#${studentId}`,
      `${EntityType.MAINTENANCE}#${requestId}`,
      updates
    );

    return NextResponse.json({
      message: "Maintenance request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update maintenance request error:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance request" },
      { status: 500 }
    );
  }
}
