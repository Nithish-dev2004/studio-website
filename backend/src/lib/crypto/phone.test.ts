import test from "node:test";
import assert from "node:assert/strict";
import {
  encryptPhone,
  decryptPhone,
  tryDecryptPhone,
  hashPhone,
  maskPhone,
  normalizePhone,
  DecryptionError,
  PhoneValidationError,
} from "./phone";
} from "./phone.ts";

// Set test environment keys if not already present
process.env.ENCRYPTION_KEY ||=
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.HASH_KEY ||=
  "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

test("normalizePhone extracts digits and validates length", () => {
  assert.equal(normalizePhone("+91 98765 43210"), "919876543210");
  assert.equal(normalizePhone("98765-43210"), "9876543210");
  assert.equal(normalizePhone("(987) 654-3210"), "9876543210");

  assert.throws(() => normalizePhone("123"), PhoneValidationError);
  assert.throws(() => normalizePhone("12345678901234567890"), PhoneValidationError);
  assert.throws(() => normalizePhone("no-digits-here"), PhoneValidationError);
});

test("encryptPhone then decryptPhone returns original normalized number", () => {
  const original = "+91 98765 43210";
  const encrypted = encryptPhone(original);

  assert.notEqual(encrypted, original);
  assert.equal(encrypted.includes("98765"), false, "Plaintext must not be visible in ciphertext");

  const decrypted = decryptPhone(encrypted);
  assert.equal(decrypted, "919876543210");
});

test("encrypting the same number twice produces distinct ciphertexts (unique IV)", () => {
  const phone = "9876543210";
  const enc1 = encryptPhone(phone);
  const enc2 = encryptPhone(phone);

  assert.notEqual(enc1, enc2, "Each encryption must use a new random 12-byte IV");

  // But both decrypt back to the exact same number
  assert.equal(decryptPhone(enc1), phone);
  assert.equal(decryptPhone(enc2), phone);
});

test("tampered ciphertext fails decryption safely without crashing", () => {
  const original = "9876543210";
  const encrypted = encryptPhone(original);
  const parts = encrypted.split(":");
  assert.equal(parts.length, 3);

  // Tamper with ciphertext by flipping characters in the ciphertext section
  const tamperedCipher =
    parts[0] + ":" + parts[1] + ":" + (parts[2].startsWith("aa") ? "bb" : "aa") + parts[2].slice(2);

  assert.throws(
    () => decryptPhone(tamperedCipher),
    DecryptionError,
    "Tampered ciphertext must fail GCM auth check",
  );

  // Safe wrapper should return failure object rather than throwing
  const safeResult = tryDecryptPhone(tamperedCipher);
  assert.equal(safeResult.success, false);
});

test("tampered auth tag fails decryption safely", () => {
  const encrypted = encryptPhone("9876543210");
  const parts = encrypted.split(":");

  // Tamper with the authentication tag
  const tamperedTag =
    parts[0] + ":" + "00".repeat(16) + ":" + parts[2];

  assert.throws(() => decryptPhone(tamperedTag), DecryptionError);
  const safeResult = tryDecryptPhone(tamperedTag);
  assert.equal(safeResult.success, false);
});

test("malformed ciphertext format fails safely", () => {
  assert.throws(() => decryptPhone("not-a-valid-encrypted-string"), DecryptionError);
  assert.throws(() => decryptPhone(""), DecryptionError);
  assert.throws(() => decryptPhone("short:tag:data"), DecryptionError);
});

test("hashPhone creates deterministic HMAC-SHA256 for duplicate lookup", () => {
  const phone = "+91 98765 43210";
  const hash1 = hashPhone(phone);
  const hash2 = hashPhone("919876543210");

  assert.equal(hash1, hash2, "Same normalized number must produce identical hash");
  assert.equal(/^[0-9a-f]{64}$/.test(hash1), true, "Hash must be 64-character hex");

  const differentHash = hashPhone("919876543211");
  assert.notEqual(hash1, differentHash);
});

test("maskPhone formats phone number for safe list views", () => {
  assert.equal(maskPhone("9876543210"), "98XXXXX210");
  assert.equal(maskPhone("+91 98765 43210"), "91XXXXXXX210");
  assert.equal(maskPhone("1234567"), "12XX567");
});
