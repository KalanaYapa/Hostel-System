import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, generateAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validation
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Verify admin password
    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateAdminToken();

    return NextResponse.json({
      message: "Admin login successful",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
