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

    // Fetch all required data
    const [students, rooms, branches, maintenanceRequests, foodOrders, attendanceRecords, menuItems] = await Promise.all([
      db.scanByType(EntityType.STUDENT),
      db.scanByType(EntityType.ROOM),
      db.scanByType(EntityType.BRANCH),
      db.scanByType(EntityType.MAINTENANCE),
      db.scanByType(EntityType.FOOD_ORDER),
      db.scanByType(EntityType.ATTENDANCE),
      db.scanByType(EntityType.FOOD_MENU),
    ]);

    // Calculate attendance statistics
    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.active).length;

    // Get today's attendance
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendanceRecords.filter((a: any) => a.date === today);
    const presentToday = todayAttendance.filter((a: any) => a.status === "present").length;
    const absentToday = activeStudents - presentToday;
    const attendancePercentage = activeStudents > 0 ? Number(((presentToday / activeStudents) * 100).toFixed(1)) : 0;

    // Attendance by branch
    const attendanceByBranch = branches.map((branch: any) => {
      const branchStudents = students.filter((s: any) => s.branchId === branch.id && s.active);
      const branchPresent = todayAttendance.filter(
        (a: any) => a.status === "present" && branchStudents.some((s: any) => s.id === a.studentId)
      ).length;
      const branchTotal = branchStudents.length;
      const branchAbsent = branchTotal - branchPresent;

      return {
        branch: branch.name,
        present: branchPresent,
        absent: branchAbsent,
        total: branchTotal,
      };
    });

    // Room statistics
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r: any) => r.occupied > 0).length;
    const totalCapacity = rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
    const totalOccupied = rooms.reduce((sum: number, r: any) => sum + (r.occupied || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Number(((totalOccupied / totalCapacity) * 100).toFixed(1)) : 0;

    // Rooms by branch
    const roomsByBranch = branches.map((branch: any) => {
      const branchRooms = rooms.filter((r: any) => r.branchId === branch.id);
      const capacity = branchRooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
      const occupied = branchRooms.reduce((sum: number, r: any) => sum + (r.occupied || 0), 0);

      return {
        branch: branch.name,
        total: branchRooms.length,
        occupied: occupied,
        available: capacity - occupied,
      };
    });

    // Fee statistics
    const paidFees = students.filter((s: any) => s.feesPaid).length;
    const unpaidFees = students.filter((s: any) => !s.feesPaid && s.active).length;
    const partialFees = 0; // Assuming no partial fee tracking for now
    const collectionRate = totalStudents > 0 ? Number(((paidFees / totalStudents) * 100).toFixed(1)) : 0;

    // Maintenance statistics by status
    const maintenanceByStatus = [
      { status: "pending", count: maintenanceRequests.filter((m: any) => m.status === "pending").length },
      { status: "in-progress", count: maintenanceRequests.filter((m: any) => m.status === "in-progress").length },
      { status: "completed", count: maintenanceRequests.filter((m: any) => m.status === "completed").length },
      { status: "cancelled", count: maintenanceRequests.filter((m: any) => m.status === "cancelled").length },
    ].filter((item) => item.count > 0);

    // Maintenance by category
    const categoryCount: Record<string, number> = {};
    maintenanceRequests.forEach((m: any) => {
      const category = m.category || "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    const maintenanceByCategory = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Maintenance trends (last 5 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const maintenanceTrends = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const count = maintenanceRequests.filter((m: any) => m.createdAt?.startsWith(monthStr)).length;
      maintenanceTrends.push({
        month: monthNames[date.getMonth()],
        count,
      });
    }

    // Food statistics
    const itemOrderCount: Record<string, number> = {};
    let totalRevenue = 0;

    foodOrders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const itemName = item.name || item.itemName || "Unknown";
          itemOrderCount[itemName] = (itemOrderCount[itemName] || 0) + (item.quantity || 1);
        });
      }
      totalRevenue += order.total || 0;
    });

    const topItems = Object.entries(itemOrderCount)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Orders by category (from menu items)
    const categoryOrders: Record<string, number> = {
      Breakfast: 0,
      Lunch: 0,
      Dinner: 0,
      Snacks: 0,
    };

    foodOrders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const menuItem = menuItems.find((mi: any) => mi.id === item.itemId || mi.name === item.name);
          const category = menuItem?.category || "Snacks";
          categoryOrders[category] = (categoryOrders[category] || 0) + (item.quantity || 1);
        });
      }
    });

    const ordersByCategory = Object.entries(categoryOrders)
      .map(([category, orders]) => ({ category, orders }))
      .filter((item) => item.orders > 0);

    const statistics = {
      attendance: {
        byBranch: attendanceByBranch,
        overall: {
          present: presentToday,
          absent: absentToday,
          percentage: attendancePercentage,
        },
      },
      rooms: {
        byBranch: roomsByBranch,
        overall: {
          total: totalRooms,
          occupied: totalOccupied,
          occupancyRate,
        },
      },
      fees: {
        paid: paidFees,
        unpaid: unpaidFees,
        partial: partialFees,
        total: totalStudents,
        collectionRate,
      },
      maintenance: {
        byStatus: maintenanceByStatus,
        byCategory: maintenanceByCategory,
        trends: maintenanceTrends,
      },
      food: {
        topItems,
        byCategory: ordersByCategory,
        revenue: totalRevenue,
      },
    };

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error("Get statistics error:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
