import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { hashPassword, generateStudentToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, password, name, email, phone } = body;

    // Validation
    if (!studentId || !password || !name || !email || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if student already exists
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create student record
    const student: Student = {
      PK: `${EntityType.STUDENT}#${studentId}`,
      SK: `${EntityType.STUDENT}#${studentId}`,
      entityType: EntityType.STUDENT,
      studentId,
      password: hashedPassword,
      name,
      email,
      phone,
      registrationDate: new Date().toISOString(),
      feesPaid: false,
      active: true,
    };

    await db.put(student);

    // Generate token
    const token = generateStudentToken({
      studentId,
      name,
      email,
      type: "student",
    });

    return NextResponse.json(
      {
        message: "Student registered successfully",
        token,
        student: {
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          phone: student.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to register student" },
      { status: 500 }
    );
  }
}
