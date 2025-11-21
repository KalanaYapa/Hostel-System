import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication - try cookie first, then Authorization header
    let token = request.cookies.get("admin_token")?.value;

    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }

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

    // Get all branches for distribution stats
    const branches = await db.scanByType(EntityType.BRANCH);

    // Room occupancy by branch
    const roomsByBranch = branches.map((branch: any) => {
      const branchRooms = rooms.filter((r: any) => r.branchId === branch.id);
      const totalCapacity = branchRooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
      const currentOccupancy = branchRooms.reduce((sum: number, r: any) => sum + (r.occupied || 0), 0);

      return {
        name: branch.name,
        totalRooms: branchRooms.length,
        occupiedRooms: branchRooms.filter((r: any) => r.occupied > 0).length,
        capacity: totalCapacity,
        occupied: currentOccupancy,
        available: totalCapacity - currentOccupancy,
      };
    });

    // Student distribution by branch
    const studentsByBranch = branches.map((branch: any) => {
      const branchStudents = students.filter((s: any) => s.branchId === branch.id);
      return {
        name: branch.name,
        total: branchStudents.length,
        active: branchStudents.filter((s: any) => s.active).length,
        inactive: branchStudents.filter((s: any) => !s.active).length,
      };
    });

    // Fee status breakdown
    const feeStatus = [
      { name: "Paid", value: paidFees, percentage: totalStudents > 0 ? Math.round((paidFees / totalStudents) * 100) : 0 },
      { name: "Unpaid", value: unpaidFees, percentage: totalStudents > 0 ? Math.round((unpaidFees / totalStudents) * 100) : 0 },
    ];

    // Maintenance requests by status
    const maintenanceByStatus = [
      { name: "Pending", value: maintenanceRequests.filter((m: any) => m.status === "pending").length },
      { name: "In Progress", value: maintenanceRequests.filter((m: any) => m.status === "in-progress").length },
      { name: "Completed", value: maintenanceRequests.filter((m: any) => m.status === "completed").length },
      { name: "Cancelled", value: maintenanceRequests.filter((m: any) => m.status === "cancelled").length },
    ].filter(item => item.value > 0);

    // Food orders by status
    const ordersByStatus = [
      { name: "Pending", value: foodOrders.filter((o: any) => o.status === "pending").length },
      { name: "Completed", value: foodOrders.filter((o: any) => o.status === "completed").length },
      { name: "Cancelled", value: foodOrders.filter((o: any) => o.status === "cancelled").length },
    ].filter(item => item.value > 0);

    // Overall room occupancy metrics
    const totalCapacity = rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
    const totalOccupied = rooms.reduce((sum: number, r: any) => sum + (r.occupied || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    const stats = {
      totalStudents,
      activeStudents,
      totalRooms,
      occupiedRooms,
      pendingMaintenance,
      pendingOrders,
      paidFees,
      unpaidFees,
      totalCapacity,
      totalOccupied,
      occupancyRate,
    };

    const chartData = {
      roomsByBranch,
      studentsByBranch,
      feeStatus,
      maintenanceByStatus,
      ordersByStatus,
    };

    return NextResponse.json({ stats, chartData });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
