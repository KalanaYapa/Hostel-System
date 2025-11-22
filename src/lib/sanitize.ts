/**
 * DynamoDB Injection Protection Utilities
 *
 * This module provides functions to sanitize and validate user inputs
 * to prevent injection attacks in DynamoDB queries.
 *
 * DynamoDB-specific threats:
 * - Malicious key values that could access unauthorized data
 * - Expression attribute injection in filter/condition expressions
 * - Type confusion attacks (passing objects instead of strings)
 * - Partition/sort key manipulation
 * - Extremely large inputs causing performance issues
 */

/**
 * Check if a value contains potential injection patterns
 * DynamoDB uses different operators than MongoDB, but we still need to protect against:
 * - Objects when strings are expected
 * - Arrays when single values are expected
 * - Special characters in partition/sort keys
 */
function containsDangerousPattern(value: any): boolean {
  if (typeof value === 'object' && value !== null) {
    // DynamoDB doesn't use $-prefixed operators like MongoDB,
    // but we should still reject objects where primitives are expected
    // This prevents type confusion attacks
    return true;
  }

  if (Array.isArray(value)) {
    // Reject arrays where single values are expected
    return true;
  }

  return false;
}

/**
 * Sanitize a string value by removing dangerous characters and patterns
 */
export function sanitizeString(value: any): string {
  if (typeof value !== 'string') {
    return String(value);
  }

  // Remove null bytes
  let sanitized = value.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}

/**
 * Sanitize an object by validating structure
 * For DynamoDB, we primarily need to ensure objects are used appropriately
 * and don't contain unexpected types
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    // Sanitize key name (prevent injection through key names)
    const sanitizedKey = sanitizeString(key);

    // For DynamoDB, validate that keys don't contain special characters
    // that could interfere with attribute names
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedKey)) {
      throw new Error('Invalid characters in object key');
    }

    // Recursively sanitize values
    sanitized[sanitizedKey] = sanitizeObject(obj[key]);
  }

  return sanitized;
}

/**
 * Validate and sanitize email format
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();

  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Validate and sanitize student ID
 * Only allows alphanumeric characters, hyphens, and underscores
 */
export function sanitizeStudentId(studentId: string): string {
  const sanitized = sanitizeString(studentId);

  // Only allow alphanumeric, hyphens, underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(sanitized)) {
    throw new Error('Invalid student ID format. Only letters, numbers, hyphens, and underscores allowed.');
  }

  if (sanitized.length < 3 || sanitized.length > 50) {
    throw new Error('Student ID must be between 3 and 50 characters');
  }

  return sanitized;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string {
  const sanitized = sanitizeString(phone);

  // Remove all non-digit characters except + for international codes
  const cleaned = sanitized.replace(/[^\d+]/g, '');

  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number length');
  }

  return cleaned;
}

/**
 * Sanitize alphanumeric input (for IDs, codes, etc.)
 */
export function sanitizeAlphanumeric(value: string, minLength = 1, maxLength = 100): string {
  const sanitized = sanitizeString(value);

  const validPattern = /^[a-zA-Z0-9]+$/;
  if (!validPattern.test(sanitized)) {
    throw new Error('Only alphanumeric characters allowed');
  }

  if (sanitized.length < minLength || sanitized.length > maxLength) {
    throw new Error(`Length must be between ${minLength} and ${maxLength} characters`);
  }

  return sanitized;
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(value: any, options?: { min?: number; max?: number; integer?: boolean }): number {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }

  if (options?.integer && !Number.isInteger(num)) {
    throw new Error('Must be an integer');
  }

  if (options?.min !== undefined && num < options.min) {
    throw new Error(`Must be at least ${options.min}`);
  }

  if (options?.max !== undefined && num > options.max) {
    throw new Error(`Must be at most ${options.max}`);
  }

  return num;
}

/**
 * Sanitize date string
 */
export function sanitizeDate(dateString: string): string {
  const sanitized = sanitizeString(dateString);

  // Validate ISO date format
  const date = new Date(sanitized);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  return date.toISOString();
}

/**
 * Sanitize enum value
 */
export function sanitizeEnum<T extends string>(value: string, allowedValues: readonly T[]): T {
  const sanitized = sanitizeString(value);

  if (!allowedValues.includes(sanitized as T)) {
    throw new Error(`Invalid value. Allowed values: ${allowedValues.join(', ')}`);
  }

  return sanitized as T;
}

/**
 * Sanitize text input with length limits
 */
export function sanitizeText(text: string, minLength = 0, maxLength = 5000): string {
  const sanitized = sanitizeString(text);

  if (sanitized.length < minLength) {
    throw new Error(`Text must be at least ${minLength} characters`);
  }

  if (sanitized.length > maxLength) {
    throw new Error(`Text must be at most ${maxLength} characters`);
  }

  return sanitized;
}

/**
 * Validate request body structure
 */
export function validateRequestBody(body: any, requiredFields: string[]): void {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Sanitize DynamoDB partition key (PK) value
 * Ensures the key doesn't contain characters that could cause issues
 */
export function sanitizePartitionKey(pk: string): string {
  const sanitized = sanitizeString(pk);

  // DynamoDB keys can contain most characters, but we validate the format
  // to ensure it matches expected patterns (ENTITY_TYPE#ID)
  if (sanitized.length === 0) {
    throw new Error('Partition key cannot be empty');
  }

  if (sanitized.length > 2048) {
    throw new Error('Partition key too long (max 2048 bytes)');
  }

  return sanitized;
}

/**
 * Sanitize DynamoDB sort key (SK) value
 * Ensures the key doesn't contain characters that could cause issues
 */
export function sanitizeSortKey(sk: string): string {
  const sanitized = sanitizeString(sk);

  if (sanitized.length === 0) {
    throw new Error('Sort key cannot be empty');
  }

  if (sanitized.length > 1024) {
    throw new Error('Sort key too long (max 1024 bytes)');
  }

  return sanitized;
}

/**
 * Validate expression attribute name for DynamoDB
 * Expression attribute names start with # and map to actual attribute names
 */
export function sanitizeExpressionAttributeName(name: string): string {
  const sanitized = sanitizeString(name);

  // Expression attribute names must start with #
  if (!sanitized.startsWith('#')) {
    throw new Error('Expression attribute names must start with #');
  }

  // Validate the format
  if (!/^#[a-zA-Z0-9_]+$/.test(sanitized)) {
    throw new Error('Invalid expression attribute name format');
  }

  return sanitized;
}

/**
 * Validate expression attribute value placeholder for DynamoDB
 * Expression attribute values start with : and are placeholders for actual values
 */
export function sanitizeExpressionAttributeValue(placeholder: string): string {
  const sanitized = sanitizeString(placeholder);

  // Expression attribute values must start with :
  if (!sanitized.startsWith(':')) {
    throw new Error('Expression attribute value placeholders must start with :');
  }

  // Validate the format
  if (!/^:[a-zA-Z0-9_]+$/.test(sanitized)) {
    throw new Error('Invalid expression attribute value placeholder format');
  }

  return sanitized;
}

/**
 * Safe query parameter builder for DynamoDB
 * Prevents injection by ensuring all values are properly typed and formatted
 */
export function buildSafeQuery(params: {
  tableName: string;
  key?: Record<string, string | number>;
  filterExpression?: string;
  expressionAttributeValues?: Record<string, any>;
  expressionAttributeNames?: Record<string, string>;
}): any {
  const safeParams: any = {
    TableName: sanitizeString(params.tableName),
  };

  if (params.key) {
    safeParams.Key = {};
    for (const [k, v] of Object.entries(params.key)) {
      const sanitizedKey = sanitizeString(k);

      // Validate key name format
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(sanitizedKey)) {
        throw new Error(`Invalid key name format: ${sanitizedKey}`);
      }

      if (typeof v === 'string') {
        safeParams.Key[sanitizedKey] = sanitizeString(v);
      } else if (typeof v === 'number') {
        safeParams.Key[sanitizedKey] = v;
      } else {
        throw new Error(`Invalid key value type for ${sanitizedKey}`);
      }
    }
  }

  if (params.filterExpression) {
    // Validate that filter expression doesn't contain obvious injection attempts
    const sanitized = sanitizeString(params.filterExpression);

    // Basic validation - expressions should only contain allowed characters
    if (!/^[a-zA-Z0-9_#:.,\s()=<>]+$/.test(sanitized)) {
      throw new Error('Invalid characters in filter expression');
    }

    safeParams.FilterExpression = sanitized;
  }

  if (params.expressionAttributeValues) {
    safeParams.ExpressionAttributeValues = {};
    for (const [k, v] of Object.entries(params.expressionAttributeValues)) {
      // Validate placeholder format
      const sanitizedKey = sanitizeExpressionAttributeValue(k);

      if (typeof v === 'string') {
        safeParams.ExpressionAttributeValues[sanitizedKey] = sanitizeString(v);
      } else if (typeof v === 'number') {
        safeParams.ExpressionAttributeValues[sanitizedKey] = v;
      } else if (typeof v === 'boolean') {
        safeParams.ExpressionAttributeValues[sanitizedKey] = v;
      } else {
        throw new Error(`Invalid attribute value type for ${sanitizedKey}`);
      }
    }
  }

  if (params.expressionAttributeNames) {
    safeParams.ExpressionAttributeNames = {};
    for (const [k, v] of Object.entries(params.expressionAttributeNames)) {
      const sanitizedPlaceholder = sanitizeExpressionAttributeName(k);
      const sanitizedName = sanitizeString(v);

      // Validate attribute name format
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(sanitizedName)) {
        throw new Error(`Invalid attribute name format: ${sanitizedName}`);
      }

      safeParams.ExpressionAttributeNames[sanitizedPlaceholder] = sanitizedName;
    }
  }

  return safeParams;
}
