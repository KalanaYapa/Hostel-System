import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { verifyPassword, generateStudentToken, setAuthCookie } from "@/lib/auth";
import { sanitizeStudentId, sanitizeString, validateRequestBody } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request structure
    validateRequestBody(body, ['studentId', 'password']);

    // Sanitize and validate inputs
    let sanitizedStudentId: string;
    let sanitizedPassword: string;

    try {
      sanitizedStudentId = sanitizeStudentId(body.studentId);
      sanitizedPassword = sanitizeString(body.password);

      // Password length validation
      if (sanitizedPassword.length < 6 || sanitizedPassword.length > 128) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Get student record using sanitized input
    const student = (await db.get(
      `${EntityType.STUDENT}#${sanitizedStudentId}`,
      `${EntityType.STUDENT}#${sanitizedStudentId}`
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

    // Verify password using sanitized input
    const isValidPassword = await verifyPassword(sanitizedPassword, student.password);
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
