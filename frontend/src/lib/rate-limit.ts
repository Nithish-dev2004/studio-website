// In-memory IP rate limiter for public submissions on frontend.

type Entry = { count: number; resetAt: number };
const hits = new Map<string, Entry>();

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

export function checkRateLimit(key: string, { max, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const effectiveMax = max;

  if (hits.size > 5000) {
    for (const [storedKey, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(storedKey);
    }
  }

  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= effectiveMax) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}
