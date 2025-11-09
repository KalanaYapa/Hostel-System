import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

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
