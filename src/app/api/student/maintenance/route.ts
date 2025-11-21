import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, MaintenanceRequest, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - try cookie first, then Authorization header
    let token = request.cookies.get("student_token")?.value;
    console.log("Cookie token:", token ? "Present" : "Missing");

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
      console.log("Authorization header token:", token ? "Present" : "Missing");
    }

    if (!token) {
      console.log("No token found in cookies or headers");
      return NextResponse.json({
        error: "Authentication required. Please log in to continue."
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    console.log("Token payload:", payload);

    if (!payload || payload.type !== "student") {
      console.log("Invalid payload or wrong type:", payload);
      return NextResponse.json({
        error: "Invalid authentication. Please log in again."
      }, { status: 401 });
    }

    const body = await request.json();
    const { issue, description } = body;
    const studentId = payload.studentId;

    // Validate required fields
    if (!issue || !description) {
      return NextResponse.json({
        error: "Please provide both issue type and description for your maintenance request."
      }, { status: 400 });
    }

    if (description.length < 10) {
      return NextResponse.json({
        error: "Please provide a more detailed description (at least 10 characters)."
      }, { status: 400 });
    }

    // Get student data
    const student = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!student) {
      return NextResponse.json({
        error: "Student profile not found. Please contact the administrator."
      }, { status: 404 });
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
      branch: student.branch || "Default",
      roomNumber: student.roomNumber || "Default",
      issue,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put(maintenanceRequest);

    return NextResponse.json({
      message: "Maintenance request submitted successfully! Our team will review it shortly.",
      request: maintenanceRequest,
    });
  } catch (error) {
    console.error("Maintenance request error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      {
        error: "An unexpected error occurred while submitting your request. Please try again or contact support if the problem persists.",
        details: process.env.NODE_ENV !== "production" ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - try cookie first, then Authorization header
    let token = request.cookies.get("student_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({
        error: "Authentication required. Please log in to view your requests."
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({
        error: "Invalid authentication. Please log in again."
      }, { status: 401 });
    }

    const studentId = payload.studentId;

    // Get all maintenance requests for this student
    const requests = await db.query(
      `${EntityType.MAINTENANCE}#${studentId}`,
      EntityType.MAINTENANCE
    );

    return NextResponse.json({
      requests,
      message: requests.length === 0 ? "You haven't submitted any maintenance requests yet." : undefined
    });
  } catch (error) {
    console.error("Get maintenance requests error:", error);
    return NextResponse.json(
      { error: "Unable to fetch your maintenance requests. Please try again later." },
      { status: 500 }
    );
  }
}
