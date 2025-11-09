import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Attendance, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get student's attendance history
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

    // Get attendance records for this student
    const attendanceRecords = await db.query(
      `${EntityType.ATTENDANCE}#${studentId}`,
      EntityType.ATTENDANCE
    );

    return NextResponse.json({ attendance: attendanceRecords });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// Mark attendance
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

    const studentId = payload.studentId;

    // Get student data
    const student = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.branch) {
      return NextResponse.json(
        { error: "Branch not assigned. Please contact admin." },
        { status: 400 }
      );
    }

    // Get today's date (YYYY-MM-DD format)
    const today = new Date().toISOString().split("T")[0];

    // Check if attendance already marked for today
    const existingAttendance = await db.get(
      `${EntityType.ATTENDANCE}#${studentId}`,
      `${EntityType.ATTENDANCE}#${today}`
    );

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Attendance already marked for today" },
        { status: 409 }
      );
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

    return NextResponse.json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
