/**
 * In-memory rate limiter for API endpoints
 * Stores request counts per IP address with expiration
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // max 5 requests per minute per IP

export function getRateLimitKey(ip: string | null): string {
  return ip || "unknown";
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const record = requestCounts.get(key);

  // Clean up expired records
  if (record && now > record.resetTime) {
    requestCounts.delete(key);
  }

  const current = requestCounts.get(key) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  current.count += 1;
  requestCounts.set(key, current);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - current.count,
    resetTime: current.resetTime,
  };
}
