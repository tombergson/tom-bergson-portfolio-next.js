/**
 * In-memory rate limiter (okno stałe) dla endpointów API.
 * Działa per proces i resetuje się po restarcie, więc główną warstwą
 * powinna być reguła rate limiting w Cloudflare WAF.
 */
type Entry = { count: number; resetTime: number };

const requestCounts = new Map<string, Entry>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX_REQUESTS = 5; // max 5 żądań na minutę per IP
const MAX_TRACKED_KEYS = 10_000; // twardy limit rozmiaru mapy

let lastSweep = Date.now();

function sweep(now: number): void {
  for (const [key, entry] of requestCounts) {
    if (now > entry.resetTime) requestCounts.delete(key);
  }
  lastSweep = now;
}

export function getRateLimitKey(ip: string | null): string {
  return ip || "unknown";
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const key = getRateLimitKey(ip);
  const now = Date.now();

  if (now - lastSweep > RATE_LIMIT_WINDOW_MS || requestCounts.size >= MAX_TRACKED_KEYS) {
    sweep(now);
  }

  let entry = requestCounts.get(key);
  if (entry && now > entry.resetTime) entry = undefined;

  if (!entry) {
    // Po sprzątaniu mapa nadal pełna: odrzucamy nowe klucze (fail closed)
    if (requestCounts.size >= MAX_TRACKED_KEYS) {
      return { allowed: false, remaining: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    }
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  requestCounts.set(key, entry);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}