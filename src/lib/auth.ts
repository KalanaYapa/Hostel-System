import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export interface JWTPayload {
  studentId: string;
  name: string;
  email: string;
  type: "student";
}

export interface AdminJWTPayload {
  type: "admin";
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token for student
export function generateStudentToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Generate JWT token for admin
export function generateAdminToken(): string {
  const payload: AdminJWTPayload = { type: "admin" };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | AdminJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload | AdminJWTPayload;
  } catch (error) {
    return null;
  }
}

// Verify admin password
export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * Cookie configuration for secure HTTP-only cookies
 * Protects against XSS attacks by making tokens inaccessible to JavaScript
 */
export const COOKIE_CONFIG = {
  student: {
    name: "student_token",
    options: {
      httpOnly: true,           // Prevents JavaScript access (XSS protection)
      secure: IS_PRODUCTION,    // HTTPS only in production
      sameSite: "strict" as const, // CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    },
  },
  admin: {
    name: "admin_token",
    options: {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict" as const,
      maxAge: 24 * 60 * 60,     // 24 hours in seconds
      path: "/",
    },
  },
};

/**
 * Set authentication cookie in response
 */
export function setAuthCookie(
  response: NextResponse,
  token: string,
  type: "student" | "admin"
): NextResponse {
  const config = COOKIE_CONFIG[type];

  response.cookies.set(config.name, token, config.options);

  return response;
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(
  response: NextResponse,
  type: "student" | "admin"
): NextResponse {
  const config = COOKIE_CONFIG[type];

  response.cookies.set(config.name, "", {
    ...config.options,
    maxAge: 0, // Expire immediately
  });

  return response;
}

/**
 * Get token from cookies
 */
export function getTokenFromCookies(
  request: Request,
  type: "student" | "admin"
): string | null {
  const config = COOKIE_CONFIG[type];
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[config.name] || null;
}

/**
 * Verify token from cookies and return payload
 */
export function verifyTokenFromCookies(
  request: Request,
  type: "student" | "admin"
): JWTPayload | AdminJWTPayload | null {
  const token = getTokenFromCookies(request, type);

  if (!token) return null;

  const payload = verifyToken(token);

  // Verify the token type matches the expected type
  if (!payload || payload.type !== type) {
    return null;
  }

  return payload;
}
