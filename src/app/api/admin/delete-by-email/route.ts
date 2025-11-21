import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log(`Starting deletion process for email: ${email}`);
    const deletionLog: string[] = [];

    // 1. Delete PENDING_STUDENT record
    deletionLog.push("1. Checking PENDING_STUDENT record...");
    const pendingStudent = await db.get(
      `${EntityType.PENDING_STUDENT}#${email}`,
      `${EntityType.PENDING_STUDENT}#${email}`
    );

    if (pendingStudent) {
      await db.delete(
        `${EntityType.PENDING_STUDENT}#${email}`,
        `${EntityType.PENDING_STUDENT}#${email}`
      );
      deletionLog.push(`✓ Deleted PENDING_STUDENT record (Student ID: ${pendingStudent.studentId})`);
    } else {
      deletionLog.push("No PENDING_STUDENT record found");
    }

    // 2. Delete OTP record
    deletionLog.push("2. Checking OTP record...");
    const otp = await db.get(
      `${EntityType.OTP}#${email}`,
      `${EntityType.OTP}#${email}`
    );

    if (otp) {
      await db.delete(
        `${EntityType.OTP}#${email}`,
        `${EntityType.OTP}#${email}`
      );
      deletionLog.push("✓ Deleted OTP record");
    } else {
      deletionLog.push("No OTP record found");
    }

    // 3. Find and delete any STUDENT records with this email
    deletionLog.push("3. Scanning for STUDENT records with this email...");
    const allStudents = await db.scanByType(EntityType.STUDENT);
    const matchingStudents = allStudents.filter((s: any) => s.email === email);

    if (matchingStudents.length > 0) {
      deletionLog.push(`Found ${matchingStudents.length} student(s) with this email`);

      for (const student of matchingStudents) {
        const studentId = student.studentId;
        deletionLog.push(`Processing student: ${studentId} (${student.name})`);

        // Delete student record
        await db.delete(
          `${EntityType.STUDENT}#${studentId}`,
          `${EntityType.STUDENT}#${studentId}`
        );
        deletionLog.push(`✓ Deleted STUDENT record for ${studentId}`);

        // Delete MAINTENANCE requests
        const maintenanceRequests = await db.query(
          `${EntityType.MAINTENANCE}#${studentId}`
        );
        if (maintenanceRequests.length > 0) {
          for (const req of maintenanceRequests) {
            await db.delete(req.PK, req.SK);
          }
          deletionLog.push(`✓ Deleted ${maintenanceRequests.length} maintenance request(s)`);
        }

        // Delete FOOD_ORDER records
        const foodOrders = await db.query(
          `${EntityType.FOOD_ORDER}#${studentId}`
        );
        if (foodOrders.length > 0) {
          for (const order of foodOrders) {
            await db.delete(order.PK, order.SK);
          }
          deletionLog.push(`✓ Deleted ${foodOrders.length} food order(s)`);
        }

        // Delete PAYMENT records
        const payments = await db.query(
          `${EntityType.PAYMENT}#${studentId}`
        );
        if (payments.length > 0) {
          for (const payment of payments) {
            await db.delete(payment.PK, payment.SK);
          }
          deletionLog.push(`✓ Deleted ${payments.length} payment(s)`);
        }

        // Delete ATTENDANCE records
        const attendance = await db.query(
          `${EntityType.ATTENDANCE}#${studentId}`
        );
        if (attendance.length > 0) {
          for (const record of attendance) {
            await db.delete(record.PK, record.SK);
          }
          deletionLog.push(`✓ Deleted ${attendance.length} attendance record(s)`);
        }

        // Delete LATE_PASS requests
        const latePasses = await db.query(
          `${EntityType.LATE_PASS}#${studentId}`
        );
        if (latePasses.length > 0) {
          for (const pass of latePasses) {
            await db.delete(pass.PK, pass.SK);
          }
          deletionLog.push(`✓ Deleted ${latePasses.length} late pass request(s)`);
        }

        // Remove from ROOM if assigned
        if (student.roomNumber && student.branch) {
          const room = await db.get(
            `${EntityType.ROOM}#${student.branch}`,
            `${EntityType.ROOM}#${student.roomNumber}`
          );

          if (room && room.students?.includes(studentId)) {
            const updatedStudents = room.students.filter((id: string) => id !== studentId);
            await db.update(
              `${EntityType.ROOM}#${student.branch}`,
              `${EntityType.ROOM}#${student.roomNumber}`,
              {
                students: updatedStudents,
                occupied: updatedStudents.length,
              }
            );
            deletionLog.push(`✓ Removed from room: ${student.branch}-${student.roomNumber}`);
          }
        }
      }
    } else {
      deletionLog.push("No STUDENT records found with this email");
    }

    deletionLog.push(`✅ Successfully deleted all data for email: ${email}`);

    return NextResponse.json(
      {
        message: "Email data deleted successfully",
        email,
        log: deletionLog,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete by email error:", error);
    return NextResponse.json(
      { error: "Failed to delete email data", details: String(error) },
      { status: 500 }
    );
  }
}
