import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student, OTPVerification, PendingStudent } from "@/lib/dynamodb";
import { generateStudentToken, setAuthCookie } from "@/lib/auth";
import { validateOTPFormat, isOTPExpired } from "@/lib/otp";
import { z } from "zod";

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers"),
});

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = verifyOTPSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const { email, otp } = validationResult.data;

    // Get OTP record
    const otpRecord = await db.get(
      `${EntityType.OTP}#${email}`,
      `${EntityType.OTP}#${email}`
    ) as OTPVerification | undefined;

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Check if OTP is already verified
    if (otpRecord.verified) {
      return NextResponse.json(
        { error: "OTP already used. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check if OTP has expired (10 minutes)
    if (isOTPExpired(otpRecord.createdAt)) {
      // Clean up expired OTP
      await db.delete(`${EntityType.OTP}#${email}`, `${EntityType.OTP}#${email}`);
      await db.delete(`${EntityType.PENDING_STUDENT}#${email}`, `${EntityType.PENDING_STUDENT}#${email}`);

      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check maximum attempts
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      // Clean up after too many attempts
      await db.delete(`${EntityType.OTP}#${email}`, `${EntityType.OTP}#${email}`);
      await db.delete(`${EntityType.PENDING_STUDENT}#${email}`, `${EntityType.PENDING_STUDENT}#${email}`);

      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await db.update(
        `${EntityType.OTP}#${email}`,
        `${EntityType.OTP}#${email}`,
        { attempts: otpRecord.attempts + 1 }
      );

      return NextResponse.json(
        {
          error: "Invalid OTP. Please try again.",
          attemptsRemaining: MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1)
        },
        { status: 400 }
      );
    }

    // OTP is valid - get pending student data
    const pendingStudent = await db.get(
      `${EntityType.PENDING_STUDENT}#${email}`,
      `${EntityType.PENDING_STUDENT}#${email}`
    ) as PendingStudent | undefined;

    if (!pendingStudent) {
      return NextResponse.json(
        { error: "Registration data not found. Please start registration again." },
        { status: 404 }
      );
    }

    // Check if student ID was already taken (race condition check)
    const existingStudent = await db.get(
      `${EntityType.STUDENT}#${pendingStudent.studentId}`,
      `${EntityType.STUDENT}#${pendingStudent.studentId}`
    );

    if (existingStudent) {
      // Clean up
      await db.delete(`${EntityType.OTP}#${email}`, `${EntityType.OTP}#${email}`);
      await db.delete(`${EntityType.PENDING_STUDENT}#${email}`, `${EntityType.PENDING_STUDENT}#${email}`);

      return NextResponse.json(
        { error: "Student ID already registered" },
        { status: 409 }
      );
    }

    // Create actual student record
    const student: Student = {
      PK: `${EntityType.STUDENT}#${pendingStudent.studentId}`,
      SK: `${EntityType.STUDENT}#${pendingStudent.studentId}`,
      entityType: EntityType.STUDENT,
      studentId: pendingStudent.studentId,
      password: pendingStudent.password, // Already hashed
      name: pendingStudent.name,
      email: pendingStudent.email,
      phone: pendingStudent.phone,
      registrationDate: new Date().toISOString(),
      feesPaid: false,
      active: true,
    };

    await db.put(student);

    // Mark OTP as verified
    await db.update(
      `${EntityType.OTP}#${email}`,
      `${EntityType.OTP}#${email}`,
      { verified: true }
    );

    // Clean up pending student and OTP (optional - can keep for audit)
    await db.delete(`${EntityType.PENDING_STUDENT}#${email}`, `${EntityType.PENDING_STUDENT}#${email}`);
    // Optionally keep OTP record for audit trail
    // await db.delete(`${EntityType.OTP}#${email}`, `${EntityType.OTP}#${email}`);

    // Generate token
    const token = generateStudentToken({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      type: "student",
    });

    // Create response (token sent via HTTP-only cookie only)
    const response = NextResponse.json(
      {
        message: "Email verified and registration completed successfully",
        student: {
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          phone: student.phone,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    setAuthCookie(response, token, "student");

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
