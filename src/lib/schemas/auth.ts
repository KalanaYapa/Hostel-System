import { z } from "zod";

/**
 * Shared field validators for reusability
 */

// Student ID: alphanumeric, hyphens, underscores (3-50 chars)
export const studentIdSchema = z
  .string()
  .min(3, "Student ID must be at least 3 characters")
  .max(50, "Student ID must not exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Student ID can only contain letters, numbers, hyphens, and underscores"
  );

// Password: 6-128 characters
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must not exceed 128 characters");

// Name: 2-100 characters
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters");

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email must not exceed 255 characters");

// Phone number: 10-15 digits (allows + prefix)
export const phoneSchema = z
  .string()
  .regex(
    /^\+?[0-9]{10,15}$/,
    "Phone number must be 10-15 digits, optionally starting with +"
  );

/**
 * Student Login Schema
 */
export const studentLoginSchema = z.object({
  studentId: studentIdSchema,
  password: passwordSchema,
});

export type StudentLoginInput = z.infer<typeof studentLoginSchema>;

/**
 * Student Signup Schema
 */
export const studentSignupSchema = z.object({
  studentId: studentIdSchema,
  password: passwordSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;

/**
 * Admin Login Schema
 */
export const adminLoginSchema = z.object({
  password: passwordSchema,
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
