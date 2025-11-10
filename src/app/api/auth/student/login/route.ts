import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { verifyPassword, generateStudentToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, password } = body;

    // Validation
    if (!studentId || !password) {
      return NextResponse.json(
        { error: "Student ID and password are required" },
        { status: 400 }
      );
    }

    // Get student record
    const student = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!student) {
      return NextResponse.json(
        { error: "Invalid student ID or password" },
        { status: 401 }
      );
    }

    // Check if student is active
    if (!student.active) {
      return NextResponse.json(
        { error: "Student account is inactive" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, student.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid student ID or password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateStudentToken({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      type: "student",
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      student: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        branch: student.branch,
        roomNumber: student.roomNumber,
        feesPaid: student.feesPaid,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
