import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Room } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all rooms
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

    // Get all rooms
    const rooms = await db.scanByType(EntityType.ROOM);

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// Create a new room
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
    const { roomNumber, branch, capacity, floor, type } = body;

    if (!roomNumber || !branch) {
      return NextResponse.json(
        { error: "Room number and branch are required" },
        { status: 400 }
      );
    }

    // Generate room ID
    const roomId = `ROOM-${branch}-${roomNumber}`;

    // Check if room already exists
    const existingRoom = await db.get(
      `${EntityType.ROOM}#${branch}`,
      `${EntityType.ROOM}#${roomNumber}`
    );

    if (existingRoom) {
      return NextResponse.json(
        { error: "Room already exists in this branch" },
        { status: 409 }
      );
    }

    // Determine status based on capacity
    const status = "available";

    const newRoom: Room = {
      PK: `${EntityType.ROOM}#${branch}`,
      SK: `${EntityType.ROOM}#${roomNumber}`,
      entityType: EntityType.ROOM,
      branch,
      roomNumber,
      capacity: capacity || 2,
      occupied: 0,
      students: [],
    };

    await db.put(newRoom);

    return NextResponse.json({
      message: "Room created successfully",
      room: {
        ...newRoom,
        roomId,
        floor: floor || 1,
        type: type || "double",
        status,
      },
    });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// Update a room
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
    const { branch, roomNumber, updates } = body;

    if (!branch || !roomNumber) {
      return NextResponse.json(
        { error: "Branch and room number are required" },
        { status: 400 }
      );
    }

    // Update room
    const updatedRoom = await db.update(
      `${EntityType.ROOM}#${branch}`,
      `${EntityType.ROOM}#${roomNumber}`,
      updates
    );

    return NextResponse.json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// Delete a room
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
    const branch = searchParams.get("branch");
    const roomNumber = searchParams.get("roomNumber");

    if (!branch || !roomNumber) {
      return NextResponse.json(
        { error: "Branch and room number are required" },
        { status: 400 }
      );
    }

    // Check if room has students
    const room = (await db.get(
      `${EntityType.ROOM}#${branch}`,
      `${EntityType.ROOM}#${roomNumber}`
    )) as Room | undefined;

    if (room && room.students && room.students.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete room with assigned students",
          studentsCount: room.students.length,
        },
        { status: 400 }
      );
    }

    await db.delete(
      `${EntityType.ROOM}#${branch}`,
      `${EntityType.ROOM}#${roomNumber}`
    );

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
