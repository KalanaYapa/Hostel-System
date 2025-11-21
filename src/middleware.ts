import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get environment
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";

  // 1. HTTPS Enforcement (Production only)
  if (isProduction) {
    const protocol = request.headers.get("x-forwarded-proto") || "http";

    // Redirect HTTP to HTTPS in production
    if (protocol === "http") {
      const httpsUrl = request.url.replace("http://", "https://");
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  // 2. Security Headers
  const headers = response.headers;

  // Strict-Transport-Security (HSTS)
  // Force HTTPS for 1 year, including subdomains
  if (isProduction) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // X-Content-Type-Options
  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // X-Frame-Options
  // Prevent clickjacking attacks
  headers.set("X-Frame-Options", "DENY");

  // X-XSS-Protection
  // Enable browser XSS protection
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  // Control referrer information
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content-Security-Policy
  // Prevent XSS, clickjacking, and other code injection attacks
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  headers.set("Content-Security-Policy", cspDirectives.join("; "));

  // Permissions-Policy (formerly Feature-Policy)
  // Disable unnecessary browser features
  const permissionsPolicy = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()", // Disable FLoC tracking
  ];
  headers.set("Permissions-Policy", permissionsPolicy.join(", "));

  // 3. Development-only warning
  if (isDevelopment) {
    // Add a header to indicate development mode (for debugging)
    headers.set("X-Development-Mode", "true");
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
