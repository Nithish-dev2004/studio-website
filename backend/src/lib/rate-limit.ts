// A very simple rate limiter: "each IP address may send at most N requests per time window".
// It keeps its counters in memory, which is fine for one server and for getting started.
//
// LIMITATIONS (good to know):
//  - On serverless hosting (e.g. Vercel) each server instance has its own memory, so the limit
//    is "best effort". It still stops simple spam bursts.
//  - TODO: for strict limits, switch to a shared store such as Upstash Redis or a Supabase table.

type Entry = { count: number; resetAt: number };

const hits = new Map<string, Entry>();

type RateLimitOptions = {
  /** Maximum requests allowed per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export function checkRateLimit(key: string, { max, windowMs }: RateLimitOptions) {
  const now = Date.now();

  // Forget expired entries so the Map can't grow forever.
  if (hits.size > 5000) {
    for (const [storedKey, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(storedKey);
    }
  }

  const entry = hits.get(key);

  // First request, or the previous window has ended: start a new window.
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best guess of the visitor's IP address from the headers added by the hosting proxy. */
export function getClientIp(request: Request) {
  // "x-forwarded-for" looks like "client, proxy1, proxy2": the first value is the client.
  // NOTE: hosts like Vercel set this header for you. Behind your own server, make sure your
  // proxy sets it, otherwise visitors could fake it.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
