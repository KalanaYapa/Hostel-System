import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, generateAdminToken, setAuthCookie } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/schemas/auth";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and parse request body with Zod
    const validationResult = adminLoginSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Verify admin password using validated input
    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateAdminToken();

    // Create response (token sent via HTTP-only cookie only)
    const response = NextResponse.json({
      message: "Admin login successful",
    });

    // Set HTTP-only cookie with token (XSS protection)
    setAuthCookie(response, token, "admin");

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
