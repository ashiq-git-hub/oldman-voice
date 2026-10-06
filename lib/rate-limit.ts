import crypto from "crypto";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory ephemeral map: key is a temporary hashed token, never an unhashed IP or identifier.
// Data is never written to disk or database.
const tracker = new Map<string, RateLimitRecord>();
const MAX_TRACKER_ENTRIES = 5000;

// Hourly rotating salt ensures hashes cannot be reversed or correlated across hours
let currentSalt = crypto.randomBytes(16).toString("hex");
let lastSaltRotation = Date.now();

function getActiveSalt(): string {
  const now = Date.now();
  if (now - lastSaltRotation > 3600000) {
    currentSalt = crypto.randomBytes(16).toString("hex");
    lastSaltRotation = now;
  }
  return currentSalt;
}

// Purge expired records
function purgeExpired(now: number): void {
  tracker.forEach((value, key) => {
    if (now > value.resetTime) {
      tracker.delete(key);
    }
  });
}

// Background cleanup with unref so it does not block process exit or serverless runtimes
const cleanupInterval = setInterval(() => {
  purgeExpired(Date.now());
}, 300000);

if (cleanupInterval && typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}

/**
 * Privacy-preserving rate limiter:
 * Uses a one-way hashed token with rotating salt to count requests within a sliding window.
 * No IP or identifier is ever logged, stored in DB, or retrievable.
 */
export function checkRateLimit(
  rawIdentifier: string,
  maxRequests: number = 8,
  windowMs: number = 60000 // 1 minute window
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();

  // Lazy purge if cache grows large
  if (tracker.size > MAX_TRACKER_ENTRIES) {
    purgeExpired(now);
  }

  const salt = getActiveSalt();
  // One-way ephemeral hash
  const blindKey = crypto
    .createHash("sha256")
    .update(`${salt}:${rawIdentifier}`)
    .digest("hex")
    .substring(0, 16);

  const existing = tracker.get(blindKey);

  if (!existing || now > existing.resetTime) {
    tracker.set(blindKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, existing.resetTime - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInMs: Math.max(0, existing.resetTime - now),
  };
}
