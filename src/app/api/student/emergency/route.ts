import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

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

    // Get all emergency contacts
    const contacts = await db.scanByType(EntityType.EMERGENCY_CONTACT);

    // Group by category
    const grouped = contacts.reduce((acc: any, contact: any) => {
      if (!acc[contact.category]) {
        acc[contact.category] = [];
      }
      acc[contact.category].push(contact);
      return acc;
    }, {});

    return NextResponse.json({ contacts, grouped });
  } catch (error) {
    console.error("Get emergency contacts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contacts" },
      { status: 500 }
    );
  }
}
