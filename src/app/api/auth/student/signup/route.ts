import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { hashPassword, generateStudentToken, setAuthCookie } from "@/lib/auth";
import {
  sanitizeStudentId,
  sanitizeString,
  sanitizeEmail,
  sanitizePhoneNumber,
  validateRequestBody,
} from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request structure
    validateRequestBody(body, ['studentId', 'password', 'name', 'email', 'phone']);

    // Sanitize and validate all inputs
    let sanitizedStudentId: string;
    let sanitizedPassword: string;
    let sanitizedName: string;
    let sanitizedEmail: string;
    let sanitizedPhone: string;

    try {
      sanitizedStudentId = sanitizeStudentId(body.studentId);
      sanitizedPassword = sanitizeString(body.password);
      sanitizedName = sanitizeString(body.name);
      sanitizedEmail = sanitizeEmail(body.email);
      sanitizedPhone = sanitizePhoneNumber(body.phone);

      // Password strength validation
      if (sanitizedPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      if (sanitizedPassword.length > 128) {
        return NextResponse.json(
          { error: "Password too long" },
          { status: 400 }
        );
      }

      // Name validation
      if (sanitizedName.length < 2 || sanitizedName.length > 100) {
        return NextResponse.json(
          { error: "Name must be between 2 and 100 characters" },
          { status: 400 }
        );
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.message || "Invalid input format" },
        { status: 400 }
      );
    }

    // Check if student already exists using sanitized input
    const existingStudent = await db.get(
      `${EntityType.STUDENT}#${sanitizedStudentId}`,
      `${EntityType.STUDENT}#${sanitizedStudentId}`
    );

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student ID already registered" },
        { status: 409 }
      );
    }

    // Hash password using sanitized input
    const hashedPassword = await hashPassword(sanitizedPassword);

    // Create student record with sanitized data
    const student: Student = {
      PK: `${EntityType.STUDENT}#${sanitizedStudentId}`,
      SK: `${EntityType.STUDENT}#${sanitizedStudentId}`,
      entityType: EntityType.STUDENT,
      studentId: sanitizedStudentId,
      password: hashedPassword,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      registrationDate: new Date().toISOString(),
      feesPaid: false,
      active: true,
    };

    await db.put(student);

    // Generate token with sanitized data
    const token = generateStudentToken({
      studentId: sanitizedStudentId,
      name: sanitizedName,
      email: sanitizedEmail,
      type: "student",
    });

    // Create response with student data
    const response = NextResponse.json(
      {
        message: "Student registered successfully",
        student: {
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          phone: student.phone,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie with token (XSS protection)
    setAuthCookie(response, token, "student");

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to register student" },
      { status: 500 }
    );
  }
}
