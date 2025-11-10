import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Branch } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all branches
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

    // Get all branches
    const branches = await db.scanByType(EntityType.BRANCH);

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Get branches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

// Create a new branch
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
    const { name, description, capacity } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Branch name is required" },
        { status: 400 }
      );
    }

    // Generate branch ID from name (replace spaces with hyphens, lowercase)
    const branchId = name.toLowerCase().replace(/\s+/g, "-");

    // Check if branch already exists
    const existingBranch = await db.get(
      `${EntityType.BRANCH}#${branchId}`,
      `${EntityType.BRANCH}#${branchId}`
    );

    if (existingBranch) {
      return NextResponse.json(
        { error: "Branch already exists" },
        { status: 409 }
      );
    }

    const newBranch: Branch = {
      PK: `${EntityType.BRANCH}#${branchId}`,
      SK: `${EntityType.BRANCH}#${branchId}`,
      entityType: EntityType.BRANCH,
      branchId,
      name,
      description: description || "",
      capacity: capacity || 0,
      occupied: 0,
      createdAt: new Date().toISOString(),
    };

    await db.put(newBranch);

    return NextResponse.json({
      message: "Branch created successfully",
      branch: newBranch,
    });
  } catch (error) {
    console.error("Create branch error:", error);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}

// Update a branch
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
    const { branchId, updates } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    // Update branch
    const updatedBranch = await db.update(
      `${EntityType.BRANCH}#${branchId}`,
      `${EntityType.BRANCH}#${branchId}`,
      updates
    );

    return NextResponse.json({
      message: "Branch updated successfully",
      branch: updatedBranch,
    });
  } catch (error) {
    console.error("Update branch error:", error);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 }
    );
  }
}

// Delete a branch
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
    const branchId = searchParams.get("branchId");

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    // Check if any students are assigned to this branch
    const students = await db.scanByType(EntityType.STUDENT);
    const studentsInBranch = students.filter(
      (s: any) => s.branch === branchId
    );

    if (studentsInBranch.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete branch with assigned students",
          studentsCount: studentsInBranch.length,
        },
        { status: 400 }
      );
    }

    await db.delete(
      `${EntityType.BRANCH}#${branchId}`,
      `${EntityType.BRANCH}#${branchId}`
    );

    return NextResponse.json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Delete branch error:", error);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}
