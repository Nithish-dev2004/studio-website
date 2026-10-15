// Reusable customer mobile number encryption, hashing, and masking module.
//
// Security specs:
// - AES-256-GCM authenticated encryption (confidentiality + integrity).
// - Unique 12-byte cryptographically secure random IV for every encryption (never reused).
// - Stored in a single string: `${ivHex}:${authTagHex}:${ciphertextHex}`.
// - HMAC-SHA256 blind index (HASH_KEY) for equality searches and duplicate detection.
// - Safe decryption handling that never leaks plaintext, keys, or crashes the server.
// - Masked display (e.g. 98XXXXX210) for list views.

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128 bits authentication tag

export class DecryptionError extends Error {
  constructor(message = "Decryption failed: data may be corrupted or tampered.") {
    super(message);
    this.name = "DecryptionError";
  }
}

export class PhoneValidationError extends Error {
  constructor(message = "Invalid phone number format.") {
    super(message);
    this.name = "PhoneValidationError";
  }
}

/**
 * Validates and retrieves the 32-byte AES-256 encryption key from ENCRYPTION_KEY.
 * Accepts a 64-character hex string (e.g. from `openssl rand -hex 32`) or a 32-byte raw string.
 * Fails fast with a clear error message if missing or invalid length.
 */
export function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.trim() === "") {
    throw new Error(
      "CRITICAL: ENCRYPTION_KEY environment variable is missing. Generate a 32-byte key with: openssl rand -hex 32",
    );
  }

  const trimmed = raw.trim();

  // 1) 64 hex characters = 32 bytes (Standard)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  // 2) Exact 32-byte utf-8 string
  if (Buffer.byteLength(trimmed, "utf8") === 32) {
    return Buffer.from(trimmed, "utf8");
  }

  // 3) 44-character base64 string = 32 bytes
  try {
    const b64 = Buffer.from(trimmed, "base64");
    if (b64.length === 32) {
      return b64;
    }
  } catch {
    // Ignore and proceed to error
  }

  throw new Error(
    `CRITICAL: ENCRYPTION_KEY has invalid length. Expected a 32-byte key (64 hex characters), received ${trimmed.length} characters. Generate with: openssl rand -hex 32`,
  );
}

/**
 * Validates and retrieves the HMAC secret key from HASH_KEY.
 * Accepts a 64-character hex string or 32+ byte string.
 */
export function getHashKey(): Buffer {
  const raw = process.env.HASH_KEY;
  if (!raw || raw.trim() === "") {
    throw new Error(
      "CRITICAL: HASH_KEY environment variable is missing. Generate a key with: openssl rand -hex 32",
    );
  }

  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  if (Buffer.byteLength(trimmed, "utf8") >= 16) {
    return Buffer.from(trimmed, "utf8");
  }

  throw new Error(
    "CRITICAL: HASH_KEY is too short. It must be at least 16 bytes (recommended: 64 hex characters). Generate with: openssl rand -hex 32",
  );
}

/**
 * Validates environment keys at application startup.
 * Calling this guarantees keys are present and correctly formatted.
 */
export function assertEncryptionConfigured(): void {
  getEncryptionKey();
  getHashKey();
}

/**
 * Normalizes a raw phone number to digits only and validates its length (7-15 digits).
 * Strips formatting like spaces, dashes, parentheses, and leading plus sign.
 * E.g. "+91 98765-43210" -> "919876543210"
 * Throws PhoneValidationError if invalid.
 */
export function normalizePhone(raw: string): string {
  if (typeof raw !== "string") {
    throw new PhoneValidationError("Phone number must be a string.");
  }

  const digits = raw.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    throw new PhoneValidationError(
      `Phone number must contain between 7 and 15 digits (received ${digits.length}).`,
    );
  }

  return digits;
}

/**
 * Encrypts a customer mobile number using AES-256-GCM.
 *
 * 1. Validates and normalizes the number (digits only, correct length).
 * 2. Generates a new cryptographically random 12-byte IV for this record.
 * 3. Produces a 16-byte GCM authentication tag.
 * 4. Combines into one string format: `${ivHex}:${authTagHex}:${ciphertextHex}`.
 */
export function encryptPhone(plain: string): string {
  const normalized = normalizePhone(plain);
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a previously encrypted phone string (`${ivHex}:${authTagHex}:${ciphertextHex}`).
 * Uses AES-256-GCM and verifies the authentication tag.
 *
 * Throws DecryptionError if the ciphertext was tampered with, the key is wrong,
 * or the format is corrupt. Never leaks plain number or key in errors.
 */
export function decryptPhone(cipherTextCombined: string): string {
  if (!cipherTextCombined || typeof cipherTextCombined !== "string") {
    throw new DecryptionError("Ciphertext must be a non-empty string.");
  }

  const parts = cipherTextCombined.split(":");
  if (parts.length !== 3) {
    throw new DecryptionError("Invalid encrypted phone format. Expected iv:authTag:ciphertext.");
  }

  const [ivHex, authTagHex, cipherHex] = parts;

  // Validate hex lengths
  if (ivHex.length !== IV_LENGTH_BYTES * 2) {
    throw new DecryptionError("Invalid IV length in ciphertext.");
  }

  if (authTagHex.length !== AUTH_TAG_LENGTH_BYTES * 2) {
    throw new DecryptionError("Invalid authentication tag length in ciphertext.");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(cipherHex, "hex");

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    // Intentionally generic: never leak key or plaintext, never crash server.
    throw new DecryptionError("Failed to decrypt phone number: data corrupted or authentication failed.");
  }
}

/**
 * Safe version of decryptPhone that returns a result object instead of throwing.
 * Use in batch operations or admin lists so one corrupted record never breaks the entire page.
 */
export function tryDecryptPhone(
  cipherTextCombined: string,
): { success: true; phone: string } | { success: false; error: string } {
  try {
    const phone = decryptPhone(cipherTextCombined);
    return { success: true, phone };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Decryption failed.",
    };
  }
}

/**
 * Generates an HMAC-SHA256 hash (blind index) of a normalized phone number using HASH_KEY.
 * Because AES-256-GCM produces different outputs every time (due to random IVs),
 * this deterministic hash is stored in `phone_hash` to allow exact-match searching
 * and duplicate detection without decrypting all database rows.
 */
export function hashPhone(plainOrNormalized: string): string {
  const normalized = normalizePhone(plainOrNormalized);
  const key = getHashKey();
  return crypto.createHmac("sha256", key).update(normalized).digest("hex");
}

/**
 * Masks a phone number for safe display in list views (e.g. 98XXXXX210).
 * Preserves the first 2 digits and last 3 digits, replacing middle digits with 'X'.
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";

  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) {
    return "X".repeat(digits.length);
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 1)}${"X".repeat(digits.length - 2)}${digits.slice(-1)}`;
  }

  // Standard (e.g. 10 digits): keep first 2 and last 3 -> 98XXXXX210
  const prefix = digits.slice(0, 2);
  const suffix = digits.slice(-3);
  const maskedMiddle = "X".repeat(digits.length - 5);

  return `${prefix}${maskedMiddle}${suffix}`;
}
