import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, MaintenanceRequest, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { issue, description } = body;
    const studentId = payload.studentId;

    // Get student data
    const student = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.branch || !student.roomNumber) {
      return NextResponse.json(
        { error: "Room not assigned. Please contact admin." },
        { status: 400 }
      );
    }

    // Create maintenance request
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maintenanceRequest: MaintenanceRequest = {
      PK: `${EntityType.MAINTENANCE}#${studentId}`,
      SK: `${EntityType.MAINTENANCE}#${requestId}`,
      entityType: EntityType.MAINTENANCE,
      requestId,
      studentId,
      studentName: student.name,
      branch: student.branch,
      roomNumber: student.roomNumber,
      issue,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put(maintenanceRequest);

    return NextResponse.json({
      message: "Maintenance request submitted successfully",
      request: maintenanceRequest,
    });
  } catch (error) {
    console.error("Maintenance request error:", error);
    return NextResponse.json(
      { error: "Failed to submit maintenance request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = payload.studentId;

    // Get all maintenance requests for this student
    const requests = await db.query(
      `${EntityType.MAINTENANCE}#${studentId}`,
      EntityType.MAINTENANCE
    );

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get maintenance requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    );
  }
}
