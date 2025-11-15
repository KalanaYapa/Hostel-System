import { NextRequest, NextResponse } from "next/server";
import { db, EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// GET: Fetch all late pass requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Scan all late pass requests
    const requests = await db.scanByType(EntityType.LATE_PASS);

    // Sort by creation date (newest first)
    const sortedRequests = requests.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ requests: sortedRequests });
  } catch (error) {
    console.error("Error fetching late pass requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch late pass requests" },
      { status: 500 }
    );
  }
}

// PATCH: Update late pass request status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, studentId, status, approvalNotes } = body;

    if (!requestId || !studentId || !status) {
      return NextResponse.json(
        { error: "Request ID, student ID, and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const PK = `LATE_PASS#${studentId}`;
    const SK = `LATE_PASS#${requestId}`;

    // Check if request exists
    const existingRequest = await db.get(PK, SK);
    if (!existingRequest) {
      return NextResponse.json(
        { error: "Late pass request not found" },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Add approval timestamp and notes if approved or rejected
    if (status === "approved" || status === "rejected") {
      updates.approvedAt = new Date().toISOString();
      updates.approvedBy = "Admin"; // You can add admin name from token if stored
    }

    if (approvalNotes) {
      updates.approvalNotes = approvalNotes;
    }

    // Update the request
    const updatedRequest = await db.update(PK, SK, updates);

    return NextResponse.json({
      message: "Late pass request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating late pass request:", error);
    return NextResponse.json(
      { error: "Failed to update late pass request" },
      { status: 500 }
    );
  }
}
