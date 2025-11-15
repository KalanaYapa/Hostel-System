import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, generateAdminToken, setAuthCookie } from "@/lib/auth";
import { sanitizeString, validateRequestBody } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request structure
    validateRequestBody(body, ['password']);

    // Sanitize and validate password
    let sanitizedPassword: string;

    try {
      sanitizedPassword = sanitizeString(body.password);

      // Password length validation
      if (sanitizedPassword.length < 6 || sanitizedPassword.length > 128) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Verify admin password using sanitized input
    const isValid = verifyAdminPassword(sanitizedPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateAdminToken();

    // Create response
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
