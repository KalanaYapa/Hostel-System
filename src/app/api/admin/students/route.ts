import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all students
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all students
    const students = await db.scanByType(EntityType.STUDENT);

    // Remove password from response
    const sanitizedStudents = students.map((s: any) => {
      const { password, ...rest } = s;
      return rest;
    });

    return NextResponse.json({ students: sanitizedStudents });
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// Update student (assign room, branch, etc.)
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, updates } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Update student
    const updatedStudent = await db.update(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`,
      updates
    );

    // Remove password from response
    const { password, ...sanitized } = updatedStudent as any;

    return NextResponse.json({
      message: "Student updated successfully",
      student: sanitized,
    });
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// Delete/deactivate student
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Instead of deleting, deactivate the student
    await db.update(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`,
      { active: false }
    );

    return NextResponse.json({ message: "Student deactivated successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate student" },
      { status: 500 }
    );
  }
}
