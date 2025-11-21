import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { hashPassword, generateStudentToken, setAuthCookie } from "@/lib/auth";
import { studentSignupSchema } from "@/lib/schemas/auth";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and parse request body with Zod
    const validationResult = studentSignupSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const { studentId, password, name, email, phone } = validationResult.data;

    // Check if student already exists using validated input
    const existingStudent = await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    );

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student ID already registered" },
        { status: 409 }
      );
    }

    // Hash password using validated input
    const hashedPassword = await hashPassword(password);

    // Create student record with validated data
    const student: Student = {
      PK: `${EntityType.STUDENT}#${studentId}`,
      SK: `${EntityType.STUDENT}#${studentId}`,
      entityType: EntityType.STUDENT,
      studentId: studentId,
      password: hashedPassword,
      name: name,
      email: email,
      phone: phone,
      branch: "Default",
      roomNumber: "Default",
      registrationDate: new Date().toISOString(),
      feesPaid: false,
      active: true,
    };

    await db.put(student);

    // Generate token with validated data
    const token = generateStudentToken({
      studentId: studentId,
      name: name,
      email: email,
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
