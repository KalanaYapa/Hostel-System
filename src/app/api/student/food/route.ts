import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, FoodOrder, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get food menu and student's orders
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = payload.studentId;

    // Get food menu
    const menu = await db.scanByType(EntityType.FOOD_MENU);

    // Get student's orders
    const orders = await db.query(
      `${EntityType.FOOD_ORDER}#${studentId}`,
      EntityType.FOOD_ORDER
    );

    return NextResponse.json({ menu, orders });
  } catch (error) {
    console.error("Get food data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch food data" },
      { status: 500 }
    );
  }
}

// Place food order
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;
    const studentId = payload.studentId;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    // Get student data
    const student = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create food order
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const order: FoodOrder = {
      PK: `${EntityType.FOOD_ORDER}#${studentId}`,
      SK: `${EntityType.FOOD_ORDER}#${orderId}`,
      entityType: EntityType.FOOD_ORDER,
      orderId,
      studentId,
      studentName: student.name,
      items,
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await db.put(order);

    return NextResponse.json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
