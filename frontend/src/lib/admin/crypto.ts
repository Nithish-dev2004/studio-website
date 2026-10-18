// Server-only phone decryption and link formatting for the admin dashboard.
// Uses AES-256-GCM to decrypt phone numbers stored by the API.
// Never exposes the encryption key or crashes if a single record has malformed ciphertext.

import "server-only";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // 96-bit IV
const AUTH_TAG_LENGTH_BYTES = 16; // 128-bit GCM authentication tag

/**
 * Retrieves the 32-byte encryption key from ENCRYPTION_KEY.
 * Accepts a 64-character hex string (standard) or a 32-byte string.
 */
function getEncryptionKey(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.trim() === "") return null;

  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  if (Buffer.byteLength(trimmed, "utf8") === 32) {
    return Buffer.from(trimmed, "utf8");
  }
  return null;
}

/**
 * Decrypts an AES-256-GCM phone string format: `${ivHex}:${authTagHex}:${ciphertextHex}`.
 * Returns null if decryption fails or key is missing.
 */
export function decryptPhone(encrypted: string | null | undefined): string | null {
  if (!encrypted || typeof encrypted !== "string") return null;

  const key = getEncryptionKey();
  if (!key) return null;

  const parts = encrypted.split(":");
  if (parts.length !== 3) return null;

  const [ivHex, authTagHex, cipherHex] = parts;
  if (ivHex.length !== IV_LENGTH_BYTES * 2 || authTagHex.length !== AUTH_TAG_LENGTH_BYTES * 2) {
    return null;
  }

  try {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(cipherHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Resolves the display phone number for an admin record.
 * Checks encrypted phone first, falls back to legacy plain phone.
 */
export function resolvePhoneNumber(
  encryptedPhone: string | null | undefined,
  plainPhone: string | null | undefined,
): string {
  if (encryptedPhone) {
    const decrypted = decryptPhone(encryptedPhone);
    if (decrypted) return decrypted;
  }
  if (plainPhone && plainPhone.trim() !== "") {
    return plainPhone.trim();
  }
  return "Not provided";
}

export { formatWhatsAppLink, formatTelLink } from "./links";
