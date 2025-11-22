import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: "Logout successful",
    });

    // Clear the HTTP-only cookie
    clearAuthCookie(response, "student");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
