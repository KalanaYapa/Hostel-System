import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    console.log(`Starting deletion process for student: ${studentId}`);
    const deletionLog: string[] = [];

    // 1. Get student record to find email
    deletionLog.push("1. Checking STUDENT record...");
    const student = await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    );

    const studentEmail = student?.email;
    if (student) {
      deletionLog.push(`Found student: ${student.name} (${studentEmail})`);
    } else {
      deletionLog.push("No STUDENT record found");
    }

    // 2. Delete STUDENT record
    if (student) {
      await db.delete(
        `${EntityType.STUDENT}#${studentId}`,
        `${EntityType.STUDENT}#${studentId}`
      );
      deletionLog.push("✓ Deleted STUDENT record");
    }

    // 3. Delete PENDING_STUDENT record (if exists)
    if (studentEmail) {
      deletionLog.push("2. Checking PENDING_STUDENT record...");
      const pendingStudent = await db.get(
        `${EntityType.PENDING_STUDENT}#${studentEmail}`,
        `${EntityType.PENDING_STUDENT}#${studentEmail}`
      );

      if (pendingStudent) {
        await db.delete(
          `${EntityType.PENDING_STUDENT}#${studentEmail}`,
          `${EntityType.PENDING_STUDENT}#${studentEmail}`
        );
        deletionLog.push("✓ Deleted PENDING_STUDENT record");
      } else {
        deletionLog.push("No PENDING_STUDENT record found");
      }

      // 4. Delete OTP record (if exists)
      deletionLog.push("3. Checking OTP record...");
      const otp = await db.get(
        `${EntityType.OTP}#${studentEmail}`,
        `${EntityType.OTP}#${studentEmail}`
      );

      if (otp) {
        await db.delete(
          `${EntityType.OTP}#${studentEmail}`,
          `${EntityType.OTP}#${studentEmail}`
        );
        deletionLog.push("✓ Deleted OTP record");
      } else {
        deletionLog.push("No OTP record found");
      }
    }

    // 5. Delete MAINTENANCE requests
    deletionLog.push("4. Checking MAINTENANCE requests...");
    const maintenanceRequests = await db.query(
      `${EntityType.MAINTENANCE}#${studentId}`
    );

    if (maintenanceRequests.length > 0) {
      deletionLog.push(`Found ${maintenanceRequests.length} maintenance request(s)`);
      for (const req of maintenanceRequests) {
        await db.delete(req.PK, req.SK);
        deletionLog.push(`✓ Deleted maintenance request: ${req.SK}`);
      }
    } else {
      deletionLog.push("No MAINTENANCE requests found");
    }

    // 6. Delete FOOD_ORDER records
    deletionLog.push("5. Checking FOOD_ORDER records...");
    const foodOrders = await db.query(
      `${EntityType.FOOD_ORDER}#${studentId}`
    );

    if (foodOrders.length > 0) {
      deletionLog.push(`Found ${foodOrders.length} food order(s)`);
      for (const order of foodOrders) {
        await db.delete(order.PK, order.SK);
        deletionLog.push(`✓ Deleted food order: ${order.SK}`);
      }
    } else {
      deletionLog.push("No FOOD_ORDER records found");
    }

    // 7. Delete PAYMENT records
    deletionLog.push("6. Checking PAYMENT records...");
    const payments = await db.query(
      `${EntityType.PAYMENT}#${studentId}`
    );

    if (payments.length > 0) {
      deletionLog.push(`Found ${payments.length} payment(s)`);
      for (const payment of payments) {
        await db.delete(payment.PK, payment.SK);
        deletionLog.push(`✓ Deleted payment: ${payment.SK}`);
      }
    } else {
      deletionLog.push("No PAYMENT records found");
    }

    // 8. Delete ATTENDANCE records
    deletionLog.push("7. Checking ATTENDANCE records...");
    const attendance = await db.query(
      `${EntityType.ATTENDANCE}#${studentId}`
    );

    if (attendance.length > 0) {
      deletionLog.push(`Found ${attendance.length} attendance record(s)`);
      for (const record of attendance) {
        await db.delete(record.PK, record.SK);
        deletionLog.push(`✓ Deleted attendance: ${record.SK}`);
      }
    } else {
      deletionLog.push("No ATTENDANCE records found");
    }

    // 9. Delete LATE_PASS requests
    deletionLog.push("8. Checking LATE_PASS requests...");
    const latePasses = await db.query(
      `${EntityType.LATE_PASS}#${studentId}`
    );

    if (latePasses.length > 0) {
      deletionLog.push(`Found ${latePasses.length} late pass request(s)`);
      for (const pass of latePasses) {
        await db.delete(pass.PK, pass.SK);
        deletionLog.push(`✓ Deleted late pass: ${pass.SK}`);
      }
    } else {
      deletionLog.push("No LATE_PASS requests found");
    }

    // 10. Remove student from ROOM (if assigned)
    if (student?.roomNumber && student?.branch) {
      deletionLog.push("9. Checking ROOM assignment...");
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
        deletionLog.push(`✓ Removed student from room: ${student.branch}-${student.roomNumber}`);
      } else {
        deletionLog.push("No ROOM assignment found");
      }
    }

    deletionLog.push(`✅ Successfully deleted all data for student: ${studentId}`);

    return NextResponse.json(
      {
        message: "Student data deleted successfully",
        studentId,
        log: deletionLog,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Failed to delete student data", details: String(error) },
      { status: 500 }
    );
  }
}
