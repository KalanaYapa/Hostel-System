import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Payment, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - try cookie first, then Authorization header
    let token = request.cookies.get("student_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, paymentType } = body;
    const studentId = payload.studentId;

    // Get student data
    const student = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create payment record
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payment: Payment = {
      PK: `${EntityType.PAYMENT}#${studentId}`,
      SK: `${EntityType.PAYMENT}#${paymentId}`,
      entityType: EntityType.PAYMENT,
      paymentId,
      studentId,
      studentName: student.name,
      amount,
      paymentType: paymentType || "hostel-fee",
      status: "completed", // Simple payment - immediately mark as completed
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    await db.put(payment);

    // Update student fees status if it's a hostel fee
    if (paymentType === "hostel-fee") {
      await db.update(
        `${EntityType.STUDENT}#${studentId}`,
        `${EntityType.STUDENT}#${studentId}`,
        { feesPaid: true }
      );
    }

    return NextResponse.json({
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - try cookie first, then Authorization header
    let token = request.cookies.get("student_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = payload.studentId;

    // Get all payments for this student
    const payments = await db.query(
      `${EntityType.PAYMENT}#${studentId}`,
      EntityType.PAYMENT
    );

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
