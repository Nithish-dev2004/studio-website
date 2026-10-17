// Indian mobile number utilities for staff authentication and profiles.
// Normalizes phone numbers to plain 10 digits starting with 6, 7, 8, or 9.
// Supports inputs with +91, 91, leading 0, spaces, parentheses, and dashes.

/**
 * Extracts and validates a 10-digit Indian mobile number.
 * Returns the plain 10-digit string (e.g. "9876543210") if valid, or null otherwise.
 */
export function normalizeTo10Digits(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();

  // Indian mobile numbers must not contain alphabetic characters
  if (/[a-zA-Z]/.test(trimmed)) {
    return null;
  }

  // Strip non-digit characters (+, -, spaces, dots, parentheses)
  const digits = trimmed.replace(/\D/g, "");

  // Standard 10-digit Indian mobile starting with 6, 7, 8, or 9
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return digits;
  }

  // 11 digits with leading 0 (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]/.test(digits.slice(1))) {
    return digits.slice(1);
  }

  // 12 digits with country code 91 (e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) {
    return digits.slice(2);
  }

  return null;
}

/**
 * Checks whether an input string is a valid Indian mobile number.
 */
export function isValidIndianMobile(raw?: string | null): boolean {
  return normalizeTo10Digits(raw) !== null;
}

/**
 * Detects whether an input password string looks like an Indian mobile number.
 * Used during login to normalize phone-like initial passwords without altering
 * custom passwords that users may set later.
 */
export function isLikelyIndianPhone(raw?: string | null): boolean {
  if (!raw || typeof raw !== "string") return false;
  const trimmed = raw.trim();

  // If it contains non-phone characters like @, $, !, %, ^, &, *, ~, `, <, >, etc., it's not a plain phone
  if (/[^\d\s\-+().]/i.test(trimmed)) {
    return false;
  }

  // Must normalize to a valid 10-digit Indian mobile
  return normalizeTo10Digits(trimmed) !== null;
}

/**
 * Formats a 10-digit mobile number for readable display (e.g. "+91 98765 43210").
 */
export function formatIndianMobile(raw?: string | null): string {
  const normalized = normalizeTo10Digits(raw);
  if (!normalized) return raw?.trim() || "";
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}
