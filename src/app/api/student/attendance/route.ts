import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Attendance, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get student's attendance history
export async function GET(request: NextRequest) {
  try {
    // Verify authentication - try cookie first, then Authorization header
    let token = request.cookies.get("student_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({
        error: "Authentication required. Please log in to view your attendance."
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({
        error: "Invalid authentication. Please log in again."
      }, { status: 401 });
    }

    const studentId = payload.studentId;

    // Get attendance records for this student
    const attendanceRecords = await db.query(
      `${EntityType.ATTENDANCE}#${studentId}`,
      EntityType.ATTENDANCE
    );

    return NextResponse.json({
      attendance: attendanceRecords,
      message: attendanceRecords.length === 0 ? "No attendance records found. Start by marking your attendance today!" : undefined
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Unable to fetch your attendance records. Please try again later." },
      { status: 500 }
    );
  }
}

// Mark attendance
export async function POST(request: NextRequest) {
  try {
    // Verify authentication - try cookie first, then Authorization header
    let token = request.cookies.get("student_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({
        error: "Authentication required. Please log in to mark attendance."
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({
        error: "Invalid authentication. Please log in again."
      }, { status: 401 });
    }

    const studentId = payload.studentId;

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

    // Get today's date (YYYY-MM-DD format)
    const today = new Date().toISOString().split("T")[0];

    // Check if attendance already marked for today
    const existingAttendance = await db.get(
      `${EntityType.ATTENDANCE}#${studentId}`,
      `${EntityType.ATTENDANCE}#${today}`
    );

    if (existingAttendance) {
      return NextResponse.json({
        error: "You have already marked your attendance for today. Come back tomorrow!",
        alreadyMarked: true,
        markedAt: existingAttendance.checkInTime
      }, { status: 409 });
    }

    // Create attendance record
    const attendance: Attendance = {
      PK: `${EntityType.ATTENDANCE}#${studentId}`,
      SK: `${EntityType.ATTENDANCE}#${today}`,
      entityType: EntityType.ATTENDANCE,
      studentId,
      studentName: student.name,
      branch: student.branch,
      date: today,
      present: true,
      checkInTime: new Date().toISOString(),
    };

    await db.put(attendance);

    const checkInTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return NextResponse.json({
      message: `Attendance marked successfully at ${checkInTime}! Have a great day!`,
      attendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while marking attendance. Please try again or contact support if the problem persists." },
      { status: 500 }
    );
  }
}
