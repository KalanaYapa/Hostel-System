import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, OTPVerification, PendingStudent } from "@/lib/dynamodb";
import { hashPassword } from "@/lib/auth";
import { studentSignupSchema } from "@/lib/schemas/auth";
import { generateOTP, sendOTPEmail } from "@/lib/otp";

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

    // Check if email is already registered
    const existingPendingByEmail = await db.get(
      `${EntityType.PENDING_STUDENT}#${email}`,
      `${EntityType.PENDING_STUDENT}#${email}`
    );

    // Delete old pending student if exists (allowing re-registration)
    if (existingPendingByEmail) {
      await db.delete(
        `${EntityType.PENDING_STUDENT}#${email}`,
        `${EntityType.PENDING_STUDENT}#${email}`
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Store pending student data
    const pendingStudent: PendingStudent = {
      PK: `${EntityType.PENDING_STUDENT}#${email}`,
      SK: `${EntityType.PENDING_STUDENT}#${email}`,
      entityType: EntityType.PENDING_STUDENT,
      studentId,
      password: hashedPassword,
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
    };

    await db.put(pendingStudent);

    // Check if OTP already exists for this email
    const existingOTP = await db.get(
      `${EntityType.OTP}#${email}`,
      `${EntityType.OTP}#${email}`
    );

    // Delete old OTP if exists
    if (existingOTP) {
      await db.delete(
        `${EntityType.OTP}#${email}`,
        `${EntityType.OTP}#${email}`
      );
    }

    // Store OTP in database
    const otpRecord: OTPVerification = {
      PK: `${EntityType.OTP}#${email}`,
      SK: `${EntityType.OTP}#${email}`,
      entityType: EntityType.OTP,
      email,
      otp,
      createdAt: new Date().toISOString(),
      verified: false,
      attempts: 0,
    };

    await db.put(otpRecord);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name);

    if (!emailSent) {
      // Clean up if email failed
      await db.delete(`${EntityType.OTP}#${email}`, `${EntityType.OTP}#${email}`);
      await db.delete(`${EntityType.PENDING_STUDENT}#${email}`, `${EntityType.PENDING_STUDENT}#${email}`);

      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "OTP sent successfully to your email",
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
