import crypto from "node:crypto";

/**
 * Checks the Authorization header against the server's ADMIN_SECRET using
 * constant-time string comparison to prevent timing attacks.
 */
export function verifyAdminAuth(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.trim() === "") {
    console.error("ADMIN_SECRET environment variable is not configured.");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  const token = match[1].trim();
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(secret);

  if (tokenBuf.length !== secretBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuf, secretBuf);
}
