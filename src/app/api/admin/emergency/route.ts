import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, EmergencyContact } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all emergency contacts
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

    const contacts = await db.scanByType(EntityType.EMERGENCY_CONTACT);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Get emergency contacts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contacts" },
      { status: 500 }
    );
  }
}

// Add new emergency contact
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { category, name, phone, email, description, available247 } = body;

    if (!category || !name || !phone || !description) {
      return NextResponse.json(
        { error: "Category, name, phone, and description are required" },
        { status: 400 }
      );
    }

    const contactId = `CONTACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const contact: EmergencyContact = {
      PK: `${EntityType.EMERGENCY_CONTACT}#${category}`,
      SK: `${EntityType.EMERGENCY_CONTACT}#${contactId}`,
      entityType: EntityType.EMERGENCY_CONTACT,
      contactId,
      category,
      name,
      phone,
      email,
      description,
      available247: available247 || false,
    };

    await db.put(contact);

    return NextResponse.json({
      message: "Emergency contact added successfully",
      contact,
    });
  } catch (error) {
    console.error("Add emergency contact error:", error);
    return NextResponse.json(
      { error: "Failed to add emergency contact" },
      { status: 500 }
    );
  }
}

// Update emergency contact
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { contactId, category, updates } = body;

    if (!contactId || !category) {
      return NextResponse.json(
        { error: "Contact ID and category are required" },
        { status: 400 }
      );
    }

    const updatedContact = await db.update(
      `${EntityType.EMERGENCY_CONTACT}#${category}`,
      `${EntityType.EMERGENCY_CONTACT}#${contactId}`,
      updates
    );

    return NextResponse.json({
      message: "Emergency contact updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Update emergency contact error:", error);
    return NextResponse.json(
      { error: "Failed to update emergency contact" },
      { status: 500 }
    );
  }
}

// Delete emergency contact
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");
    const category = searchParams.get("category");

    if (!contactId || !category) {
      return NextResponse.json(
        { error: "Contact ID and category are required" },
        { status: 400 }
      );
    }

    await db.delete(
      `${EntityType.EMERGENCY_CONTACT}#${category}`,
      `${EntityType.EMERGENCY_CONTACT}#${contactId}`
    );

    return NextResponse.json({
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete emergency contact error:", error);
    return NextResponse.json(
      { error: "Failed to delete emergency contact" },
      { status: 500 }
    );
  }
}
