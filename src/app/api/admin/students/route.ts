import { NextRequest, NextResponse } from "next/server";
import db, { EntityType, Student } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

// Get all students
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

    // Remove password from response
    const sanitizedStudents = students.map((s: any) => {
      const { password, ...rest } = s;
      return rest;
    });

    return NextResponse.json({ students: sanitizedStudents });
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// Update student (assign room, branch, etc.)
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
    const { studentId, updates } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get current student data
    const currentStudent = (await db.get(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`
    )) as Student | undefined;

    if (!currentStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Handle room assignment changes
    if (updates.branch !== undefined || updates.roomNumber !== undefined) {
      const newBranch = updates.branch || currentStudent.branch;
      const newRoomNumber = updates.roomNumber || currentStudent.roomNumber;
      const oldBranch = currentStudent.branch;
      const oldRoomNumber = currentStudent.roomNumber;

      // If removing room assignment (setting to empty)
      if (!newBranch || !newRoomNumber) {
        // Remove student from old room if exists
        if (oldBranch && oldRoomNumber) {
          const oldRoom = await db.get(
            `${EntityType.ROOM}#${oldBranch}`,
            `${EntityType.ROOM}#${oldRoomNumber}`
          );

          if (oldRoom) {
            const updatedStudents = (oldRoom.students || []).filter(
              (id: string) => id !== studentId
            );
            await db.update(
              `${EntityType.ROOM}#${oldBranch}`,
              `${EntityType.ROOM}#${oldRoomNumber}`,
              {
                students: updatedStudents,
                occupied: updatedStudents.length,
              }
            );
          }

          // Update old branch occupied count
          const oldBranchData = await db.get(
            `${EntityType.BRANCH}#${oldBranch}`,
            `${EntityType.BRANCH}#${oldBranch}`
          );
          if (oldBranchData) {
            await db.update(
              `${EntityType.BRANCH}#${oldBranch}`,
              `${EntityType.BRANCH}#${oldBranch}`,
              { occupied: Math.max(0, (oldBranchData.occupied || 0) - 1) }
            );
          }
        }
      } else if (
        newBranch !== oldBranch ||
        newRoomNumber !== oldRoomNumber
      ) {
        // Room is changing - update both old and new rooms

        // Remove from old room if exists
        if (oldBranch && oldRoomNumber) {
          const oldRoom = await db.get(
            `${EntityType.ROOM}#${oldBranch}`,
            `${EntityType.ROOM}#${oldRoomNumber}`
          );

          if (oldRoom) {
            const updatedStudents = (oldRoom.students || []).filter(
              (id: string) => id !== studentId
            );
            await db.update(
              `${EntityType.ROOM}#${oldBranch}`,
              `${EntityType.ROOM}#${oldRoomNumber}`,
              {
                students: updatedStudents,
                occupied: updatedStudents.length,
              }
            );
          }

          // Decrement old branch occupied count
          if (oldBranch !== newBranch) {
            const oldBranchData = await db.get(
              `${EntityType.BRANCH}#${oldBranch}`,
              `${EntityType.BRANCH}#${oldBranch}`
            );
            if (oldBranchData) {
              await db.update(
                `${EntityType.BRANCH}#${oldBranch}`,
                `${EntityType.BRANCH}#${oldBranch}`,
                { occupied: Math.max(0, (oldBranchData.occupied || 0) - 1) }
              );
            }
          }
        }

        // Add to new room
        const newRoom = await db.get(
          `${EntityType.ROOM}#${newBranch}`,
          `${EntityType.ROOM}#${newRoomNumber}`
        );

        if (!newRoom) {
          return NextResponse.json(
            { error: "Room not found" },
            { status: 404 }
          );
        }

        // Check if room has capacity
        if ((newRoom.occupied || 0) >= newRoom.capacity) {
          return NextResponse.json(
            { error: "Room is at full capacity" },
            { status: 400 }
          );
        }

        // Check if student is already in this room
        const studentsList = newRoom.students || [];
        if (!studentsList.includes(studentId)) {
          studentsList.push(studentId);
        }

        await db.update(
          `${EntityType.ROOM}#${newBranch}`,
          `${EntityType.ROOM}#${newRoomNumber}`,
          {
            students: studentsList,
            occupied: studentsList.length,
          }
        );

        // Increment new branch occupied count (only if branch changed or student was not in any branch)
        if (newBranch !== oldBranch || !oldBranch) {
          const newBranchData = await db.get(
            `${EntityType.BRANCH}#${newBranch}`,
            `${EntityType.BRANCH}#${newBranch}`
          );
          if (newBranchData) {
            await db.update(
              `${EntityType.BRANCH}#${newBranch}`,
              `${EntityType.BRANCH}#${newBranch}`,
              { occupied: (newBranchData.occupied || 0) + 1 }
            );
          }
        }
      }
    }

    // Update student record
    const updatedStudent = await db.update(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`,
      updates
    );

    // Remove password from response
    const { password, ...sanitized } = updatedStudent as any;

    return NextResponse.json({
      message: "Student updated successfully",
      student: sanitized,
    });
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// Delete/deactivate student
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
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Instead of deleting, deactivate the student
    await db.update(
      `${EntityType.STUDENT}#${studentId}`,
      `${EntityType.STUDENT}#${studentId}`,
      { active: false }
    );

    return NextResponse.json({ message: "Student deactivated successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate student" },
      { status: 500 }
    );
  }
}
