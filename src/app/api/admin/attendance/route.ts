import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all attendance records with statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all attendance records
    const attendanceRecords = await db.scanByType(EntityType.ATTENDANCE);

    // Get all students
    const students = await db.scanByType(EntityType.STUDENT);

    // Calculate statistics by student
    const studentStats = students.map((student: any) => {
      const studentAttendance = attendanceRecords.filter(
        (a: any) => a.studentId === student.studentId
      );
      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter((a: any) => a.present).length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        studentId: student.studentId,
        studentName: student.name,
        branch: student.branch,
        roomNumber: student.roomNumber,
        totalDays,
        presentDays,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    // Calculate statistics by branch
    const branchStats: Record<string, any> = {};
    students.forEach((student: any) => {
      if (student.branch) {
        if (!branchStats[student.branch]) {
          branchStats[student.branch] = {
            branch: student.branch,
            totalStudents: 0,
            totalAttendance: 0,
          };
        }
        branchStats[student.branch].totalStudents++;

        const studentAttendance = attendanceRecords.filter(
          (a: any) => a.studentId === student.studentId
        );
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(
          (a: any) => a.present
        ).length;
        const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        branchStats[student.branch].totalAttendance += percentage;
      }
    });

    // Calculate average attendance per branch
    Object.keys(branchStats).forEach((branch) => {
      const stats = branchStats[branch];
      stats.averageAttendance =
        stats.totalStudents > 0
          ? Math.round((stats.totalAttendance / stats.totalStudents) * 10) / 10
          : 0;
      delete stats.totalAttendance;
    });

    // Get today's attendance
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendanceRecords.filter(
      (a: any) => a.date === today
    );

    return NextResponse.json({
      attendance: attendanceRecords,
      studentStats,
      branchStats: Object.values(branchStats),
      todayStats: {
        date: today,
        totalMarked: todayAttendance.length,
        totalStudents: students.filter((s: any) => s.active).length,
        percentage:
          students.filter((s: any) => s.active).length > 0
            ? Math.round(
                (todayAttendance.length /
                  students.filter((s: any) => s.active).length) *
                  100 *
                  10
              ) / 10
            : 0,
      },
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
