import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

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

    // Get all students
    const students = await db.scanByType(EntityType.STUDENT);
    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.active).length;
    const paidFees = students.filter((s: any) => s.feesPaid).length;
    const unpaidFees = totalStudents - paidFees;

    // Get all rooms
    const rooms = await db.scanByType(EntityType.ROOM);
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r: any) => r.occupied > 0).length;

    // Get pending maintenance requests
    const maintenanceRequests = await db.scanByType(EntityType.MAINTENANCE);
    const pendingMaintenance = maintenanceRequests.filter(
      (m: any) => m.status === "pending"
    ).length;

    // Get pending food orders
    const foodOrders = await db.scanByType(EntityType.FOOD_ORDER);
    const pendingOrders = foodOrders.filter(
      (o: any) => o.status === "pending"
    ).length;

    const stats = {
      totalStudents,
      activeStudents,
      totalRooms,
      occupiedRooms,
      pendingMaintenance,
      pendingOrders,
      paidFees,
      unpaidFees,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
