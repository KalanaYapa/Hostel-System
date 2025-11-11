import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Update order status
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "preparing", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get all orders to find the one we need to update
    const allOrders = await db.scanByType(EntityType.FOOD_ORDER);
    const orderToUpdate = allOrders.find((order: any) => order.orderId === orderId);

    if (!orderToUpdate) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update the order
    const updates: any = { status };

    // If status is delivered, add deliveredAt timestamp
    if (status === "delivered") {
      updates.deliveredAt = new Date().toISOString();
    }

    const updatedOrder = await db.update(
      orderToUpdate.PK,
      orderToUpdate.SK,
      updates
    );

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
