/**
 * Minimal in-memory sliding-window rate limiter for the public inquiry form.
 *
 * State lives in the process, so on serverless each instance counts separately
 * and counters reset on cold start. That is deliberate: this exists to blunt
 * casual form spam alongside the honeypot field, not to be an accurate quota.
 * Move to Upstash/Redis if abuse becomes a real problem.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const MAX_KEYS = 10_000;

const hits = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the caller may retry; 0 when allowed. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  max: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    const oldest = recent[0];
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bound memory: drop entries whose window has fully expired.
  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return { allowed: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
