import { NextRequest, NextResponse } from "next/server";
import { db, EntityType, LatePassRequest } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// POST: Submit a new late pass request
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestedDate, startTime, endTime, reason, description } = body;

    // Validate required fields
    if (!requestedDate || !startTime || !endTime || !reason || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get student details
    const studentId = payload.studentId;
    const student = await db.get(
      `STUDENT#${studentId}`,
      `STUDENT#${studentId}`
    );

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Generate request ID
    const requestId = `LP${Date.now()}`;
    const now = new Date().toISOString();

    // Create late pass request
    const latePassRequest: LatePassRequest = {
      PK: `LATE_PASS#${studentId}`,
      SK: `LATE_PASS#${requestId}`,
      entityType: EntityType.LATE_PASS,
      requestId,
      studentId,
      studentName: student.name,
      branch: student.branch || "Not Assigned",
      roomNumber: student.roomNumber || "Not Assigned",
      requestedDate,
      startTime,
      endTime,
      reason,
      description,
      status: "pending",
      createdAt: now,
    };

    await db.put(latePassRequest);

    return NextResponse.json({
      message: "Late pass request submitted successfully",
      request: latePassRequest,
    });
  } catch (error) {
    console.error("Error submitting late pass request:", error);
    return NextResponse.json(
      { error: "Failed to submit late pass request" },
      { status: 500 }
    );
  }
}

// GET: Fetch all late pass requests for the logged-in student
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = payload.studentId;

    // Query all late pass requests for this student
    const requests = await db.query(`LATE_PASS#${studentId}`, "LATE_PASS#");

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
