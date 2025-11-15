import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { verifyPassword, generateStudentToken, setAuthCookie } from "@/lib/auth";
import { studentLoginSchema } from "@/lib/schemas/auth";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and parse request body with Zod
    const validationResult = studentLoginSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const { studentId, password } = validationResult.data;

    // Get student record using validated input
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

    // Verify password using validated input
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

    // Create response with student data
    const response = NextResponse.json({
      message: "Login successful",
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

    // Set HTTP-only cookie with token (XSS protection)
    setAuthCookie(response, token, "student");

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
