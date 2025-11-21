interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
  firstAttempt: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const RESET_WINDOW = 15 * 60 * 1000; // Reset counter after 15 minutes of no attempts

class RateLimiter {
  private attempts: Map<string, LoginAttempt>;

  constructor() {
    this.attempts = new Map();
  }

  /**
   * Check if a user is currently locked out
   */
  isLockedOut(identifier: string): { locked: boolean; remainingTime?: number } {
    const attempt = this.attempts.get(identifier);

    if (!attempt || !attempt.lockedUntil) {
      return { locked: false };
    }

    const now = Date.now();

    // Check if lockout period has expired
    if (now >= attempt.lockedUntil) {
      // Reset the attempt record
      this.attempts.delete(identifier);
      return { locked: false };
    }

    const remainingTime = Math.ceil((attempt.lockedUntil - now) / 1000); // in seconds
    return { locked: true, remainingTime };
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(identifier: string): {
    attemptsLeft: number;
    locked: boolean;
    lockoutTime?: number;
  } {
    const now = Date.now();
    let attempt = this.attempts.get(identifier);

    if (!attempt) {
      // First failed attempt
      attempt = {
        count: 1,
        lockedUntil: null,
        firstAttempt: now,
      };
      this.attempts.set(identifier, attempt);
      return { attemptsLeft: MAX_ATTEMPTS - 1, locked: false };
    }

    // Check if we should reset the counter (15 minutes since first attempt)
    if (now - attempt.firstAttempt > RESET_WINDOW && !attempt.lockedUntil) {
      attempt.count = 1;
      attempt.firstAttempt = now;
      this.attempts.set(identifier, attempt);
      return { attemptsLeft: MAX_ATTEMPTS - 1, locked: false };
    }

    // Increment failed attempts
    attempt.count++;

    // Check if max attempts reached
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = now + LOCKOUT_DURATION;
      this.attempts.set(identifier, attempt);
      return {
        attemptsLeft: 0,
        locked: true,
        lockoutTime: LOCKOUT_DURATION / 1000, // in seconds
      };
    }

    this.attempts.set(identifier, attempt);
    return { attemptsLeft: MAX_ATTEMPTS - attempt.count, locked: false };
  }

  /**
   * Reset attempts for a user (call this on successful login)
   */
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Get current attempt status
   */
  getAttemptStatus(identifier: string): {
    attempts: number;
    attemptsLeft: number;
  } {
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      return { attempts: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    return {
      attempts: attempt.count,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempt.count),
    };
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
