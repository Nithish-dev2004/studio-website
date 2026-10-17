// Basic in-memory rate limiting and lockout for admin authentication.
// Protects /admin/login from brute force password guessing.

type RateLimitRecord = {
  attempts: number;
  resetAt: number;
  lockedUntil?: number;
};

const store = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt < now && (!record.lockedUntil || record.lockedUntil < now)) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Checks and increments the attempt counter for a given key (e.g. login IP or email).
 * Limit: 5 failed attempts per 15 minutes.
 * If exceeded, locks out for 15 minutes.
 */
export function checkLoginRateLimit(
  key: string,
  options: { maxAttempts?: number; windowMs?: number } = {},
): RateLimitResult {
  const maxAttempts = options.maxAttempts ?? 5;
  const windowMs = options.windowMs ?? 15 * 60 * 1000; // 15 minutes
  const now = Date.now();

  const record = store.get(key) || { attempts: 0, resetAt: now + windowMs };

  // Check if actively locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Reset if window expired
  if (record.resetAt < now) {
    record.attempts = 0;
    record.resetAt = now + windowMs;
    record.lockedUntil = undefined;
  }

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + windowMs;
    store.set(key, record);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Records a failed attempt for the key.
 */
export function recordFailedLogin(key: string, windowMs = 15 * 60 * 1000): void {
  const now = Date.now();
  const record = store.get(key) || { attempts: 0, resetAt: now + windowMs };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockedUntil = now + windowMs;
  }
  store.set(key, record);
}

/**
 * Resets the attempt counter on a successful login.
 */
export function clearLoginRateLimit(key: string): void {
  store.delete(key);
}
