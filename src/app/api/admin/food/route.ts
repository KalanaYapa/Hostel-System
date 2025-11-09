import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, FoodMenuItem } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all menu items and orders
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

    // Get all menu items
    const menu = await db.scanByType(EntityType.FOOD_MENU);
    const orders = await db.scanByType(EntityType.FOOD_ORDER);

    return NextResponse.json({ menu, orders });
  } catch (error) {
    console.error("Get food data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch food data" },
      { status: 500 }
    );
  }
}

// Add new menu item
export async function POST(request: NextRequest) {
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
    const { name, description, price, category } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Create menu item
    const menuId = `MENU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const menuItem: FoodMenuItem = {
      PK: `${EntityType.FOOD_MENU}#${menuId}`,
      SK: `${EntityType.FOOD_MENU}#${menuId}`,
      entityType: EntityType.FOOD_MENU,
      menuId,
      name,
      description: description || "",
      price: parseFloat(price),
      category,
      available: true,
      createdAt: new Date().toISOString(),
    };

    await db.put(menuItem);

    return NextResponse.json({
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Add menu item error:", error);
    return NextResponse.json(
      { error: "Failed to add menu item" },
      { status: 500 }
    );
  }
}

// Update menu item
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
    const { menuId, updates } = body;

    if (!menuId) {
      return NextResponse.json(
        { error: "Menu ID is required" },
        { status: 400 }
      );
    }

    // Update menu item
    const updatedItem = await db.update(
      `${EntityType.FOOD_MENU}#${menuId}`,
      `${EntityType.FOOD_MENU}#${menuId}`,
      updates
    );

    return NextResponse.json({
      message: "Menu item updated successfully",
      menuItem: updatedItem,
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// Delete menu item
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get("menuId");

    if (!menuId) {
      return NextResponse.json(
        { error: "Menu ID is required" },
        { status: 400 }
      );
    }

    await db.delete(
      `${EntityType.FOOD_MENU}#${menuId}`,
      `${EntityType.FOOD_MENU}#${menuId}`
    );

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete menu item error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
