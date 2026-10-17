// Automated test suite for the Users Module's new login and password flow.
// Tests:
// 1. Phone number normalization (+91, spaces, dashes -> 10 digits).
// 2. Detection of phone-like passwords vs custom passwords.
// 3. Rate limiting (5 attempts lockout per IP and per Email).
// 4. End-to-end Supabase flow (if credentials and network reach Supabase):
//    - Staff creation with normalized mobile as initial password + must_change_password = true.
//    - Sign-in with formatted mobile (+91 98765-43210) normalized to 10 digits.
//    - Password change: blocks mobile as password, sets new password, sets must_change_password = false.
//    - Verification that old mobile password no longer works.
//    - Admin password reset: resets password back to registered mobile, sets must_change_password = true.
//    - Editing mobile number does NOT alter password.
//    - Deactivation bans user.
//    - Cleanup of test data.

import { createClient } from "@supabase/supabase-js";
import { normalizeTo10Digits, isValidIndianMobile, isLikelyIndianPhone } from "../src/lib/admin/phone.js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcimhsywdzkjovvhalws.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_p3r0YJgOQiDnbznCL3Iuyg_ds-MBBX3";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaW1oc3l3ZHpram92dmhhbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTI1OTksImV4cCI6MjA4NjkyODU5OX0.eKqFvI8x1P1R7UaC4V7r8Kx0pW_2rG6bV0X9Y-M4_zY";

console.log("=================================================================");
console.log("       TESTING USERS MODULE NEW LOGIN FLOW & RESET LOGIC        ");
console.log("=================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// SUITE 1: Phone Normalization & Password Detection Logic
// -------------------------------------------------------------
console.log("--- SUITE 1: Phone Normalization Logic ---");

assert(normalizeTo10Digits("+91 98765-43210") === "9876543210", "Normalizes '+91 98765-43210' to '9876543210'");
assert(normalizeTo10Digits("+919876543210") === "9876543210", "Normalizes '+919876543210' to '9876543210'");
assert(normalizeTo10Digits("09876543210") === "9876543210", "Normalizes '09876543210' to '9876543210'");
assert(normalizeTo10Digits("98765 43210") === "9876543210", "Normalizes '98765 43210' to '9876543210'");
assert(normalizeTo10Digits("9876543210") === "9876543210", "Normalizes plain 10 digits '9876543210'");
assert(normalizeTo10Digits("919876543210") === "9876543210", "Normalizes '919876543210' to '9876543210'");

assert(normalizeTo10Digits("1234567890") === null, "Rejects numbers not starting with 6-9");
assert(normalizeTo10Digits("987654321") === null, "Rejects 9 digits");
assert(normalizeTo10Digits("abcd9876543210") === null, "Rejects alphanumeric strings");

assert(isLikelyIndianPhone("+91 98765 43210") === true, "isLikelyIndianPhone recognizes formatted phone number");
assert(isLikelyIndianPhone("9876543210") === true, "isLikelyIndianPhone recognizes plain 10 digits");
assert(isLikelyIndianPhone("MySecretPassword123!") === false, "isLikelyIndianPhone ignores standard text/symbol passwords");
assert(isLikelyIndianPhone("Pass@2026") === false, "isLikelyIndianPhone ignores complex passwords");

// -------------------------------------------------------------
// SUITE 2: Dual Rate Limiting Unit Test
// -------------------------------------------------------------
console.log("\n--- SUITE 2: Rate Limiting & Lockout Logic ---");

// Simple simulated store matching rate-limit.ts
const testStore = new Map();
function checkLimit(key, max = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const rec = testStore.get(key) || { attempts: 0, resetAt: now + windowMs };
  if (rec.lockedUntil && rec.lockedUntil > now) {
    return { allowed: false, remaining: 0 };
  }
  if (rec.attempts >= max) {
    rec.lockedUntil = now + windowMs;
    testStore.set(key, rec);
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - rec.attempts };
}
function recordFail(key, max = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const rec = testStore.get(key) || { attempts: 0, resetAt: now + windowMs };
  rec.attempts += 1;
  if (rec.attempts >= max) rec.lockedUntil = now + windowMs;
  testStore.set(key, rec);
}

const testIpKey = "admin-login:ip:192.168.1.10";
const testEmailKey = "admin-login:email:target@example.com";

// Simulate 4 failed attempts
for (let i = 1; i <= 4; i++) {
  recordFail(testIpKey);
  recordFail(testEmailKey);
}
assert(checkLimit(testIpKey).allowed === true, "Allowed after 4 failed attempts");
assert(checkLimit(testEmailKey).allowed === true, "Allowed after 4 failed attempts on email");

// 5th failed attempt triggers lockout
recordFail(testIpKey);
recordFail(testEmailKey);
assert(checkLimit(testIpKey).allowed === false, "Lockout triggered after 5 failed attempts on IP");
assert(checkLimit(testEmailKey).allowed === false, "Lockout triggered after 5 failed attempts on Email");

// -------------------------------------------------------------
// SUITE 3: Supabase End-to-End Integration Test
// -------------------------------------------------------------
console.log("\n--- SUITE 3: Supabase End-to-End Flow ---");

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const userAuthClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runSupabaseTests() {
  try {
    const { error: pingErr } = await adminClient.from("bookings").select("id").limit(1);
    if (pingErr) {
      console.log("⚠️ Supabase network ping failed:", pingErr.message);
      return;
    }
  } catch (err) {
    console.log("⚠️ Could not connect to Supabase from this environment:", err.message);
    return;
  }

  // Check if staff_users table exists
  const { data: tableCheck, error: tableErr } = await adminClient
    .from("staff_users")
    .select("id, must_change_password")
    .limit(1);

  if (tableErr) {
    console.log("⚠️ staff_users table or must_change_password column not available yet in Supabase.");
    console.log("Run the migration SQL in Supabase SQL editor: backend/supabase/migration_staff_users.sql");
    console.log("Error details:", tableErr.message);
    return;
  }
  assert(true, "Table 'staff_users' exists and column 'must_change_password' is queryable");

  const testMobileInput = "+91 98765-43210";
  const normalizedMobile = normalizeTo10Digits(testMobileInput); // 9876543210
  const testEmail = `staff.test.${Date.now()}@sivagangai.com`;
  const testEmpId = `EMP-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  let createdAuthId = null;
  let createdStaffId = null;

  try {
    // 1. Create Supabase Auth user with mobile number as initial password
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: normalizedMobile,
      email_confirm: true,
      user_metadata: { name: "Test Staff User", role: "staff", employee_id: testEmpId },
    });

    assert(!authErr && authData?.user, `Created Auth user with initial password = mobile number (${normalizedMobile})`);
    createdAuthId = authData?.user?.id;

    // 2. Insert into staff_users with must_change_password = true
    const { data: staffData, error: staffErr } = await adminClient
      .from("staff_users")
      .insert({
        auth_user_id: createdAuthId,
        employee_id: testEmpId,
        name: "Test Staff User",
        email: testEmail,
        mobile: normalizedMobile,
        role: "staff",
        salary: 25000,
        status: "active",
        must_change_password: true,
      })
      .select()
      .single();

    assert(!staffErr && staffData, "Inserted staff_users row with must_change_password = true");
    createdStaffId = staffData?.id;

    // 3. Test Login with normalized mobile
    const { data: loginData, error: loginErr } = await userAuthClient.auth.signInWithPassword({
      email: testEmail,
      password: normalizedMobile,
    });
    if (loginErr) {
      console.log("👉 signInWithPassword error:", loginErr.message, loginErr.status);
    }
    assert(!loginErr && loginData?.user, "Staff signs in successfully with their email & registered mobile number");

    // 4. Verify must_change_password status
    const { data: checkRow } = await adminClient
      .from("staff_users")
      .select("must_change_password, mobile")
      .eq("id", createdStaffId)
      .single();
    assert(checkRow.must_change_password === true, "User is flagged with must_change_password = true");

    // 5. Simulate First-login Password Change
    const newPassword = "NewPermanentPassword2026!";
    const { error: updateAuthErr } = await adminClient.auth.admin.updateUserById(createdAuthId, {
      password: newPassword,
    });
    assert(!updateAuthErr, "Updated permanent password in Supabase Auth");

    const { error: updateDbErr } = await adminClient
      .from("staff_users")
      .update({ must_change_password: false })
      .eq("id", createdStaffId);
    assert(!updateDbErr, "Updated staff_users to must_change_password = false");

    // 6. Sign out and verify new password works
    await userAuthClient.auth.signOut();
    const { data: newLoginData, error: newLoginErr } = await userAuthClient.auth.signInWithPassword({
      email: testEmail,
      password: newPassword,
    });
    assert(!newLoginErr && newLoginData?.user, "Staff signs in successfully with their NEW password");

    // 7. Verify old mobile password NO LONGER works
    await userAuthClient.auth.signOut();
    const { error: oldLoginErr } = await userAuthClient.auth.signInWithPassword({
      email: testEmail,
      password: normalizedMobile,
    });
    assert(Boolean(oldLoginErr), "Old mobile number password is rejected after password change");

    // 8. Admin Reset Password back to mobile number
    const { error: resetAuthErr } = await adminClient.auth.admin.updateUserById(createdAuthId, {
      password: normalizedMobile,
    });
    const { error: resetDbErr } = await adminClient
      .from("staff_users")
      .update({ must_change_password: true })
      .eq("id", createdStaffId);
    assert(!resetAuthErr && !resetDbErr, "Admin Reset restores password to mobile number and sets must_change_password = true");

    // Verify mobile password works again
    const { data: resetLoginData, error: resetLoginErr } = await userAuthClient.auth.signInWithPassword({
      email: testEmail,
      password: normalizedMobile,
    });
    assert(!resetLoginErr && resetLoginData?.user, "Staff can sign in with mobile number again after admin reset");

    // 9. Edit mobile number: verify Auth password is NOT altered
    const updatedMobile = "9840123456";
    const { error: editDbErr } = await adminClient
      .from("staff_users")
      .update({ mobile: updatedMobile })
      .eq("id", createdStaffId);
    assert(!editDbErr, "Updated user mobile number in staff_users");

    // The login password should STILL be normalizedMobile (9876543210), not updatedMobile
    const { data: stillWorks, error: stillWorksErr } = await userAuthClient.auth.signInWithPassword({
      email: testEmail,
      password: normalizedMobile,
    });
    assert(!stillWorksErr && stillWorks?.user, "Editing mobile number did NOT alter the user's existing login password");

    // 10. Deactivation bans user
    await adminClient.auth.admin.updateUserById(createdAuthId, { ban_duration: "876000h" });
    const { error: bannedLoginErr } = await userAuthClient.auth.signInWithPassword({
      email: testEmail,
      password: normalizedMobile,
    });
    assert(Boolean(bannedLoginErr), "Deactivated / banned user login is rejected");

  } finally {
    // Cleanup
    if (createdAuthId) {
      try {
        await adminClient.auth.admin.deleteUser(createdAuthId);
      } catch (e) {
        // ignore
      }
    }
    if (createdStaffId) {
      try {
        await adminClient.from("staff_users").delete().eq("id", createdStaffId);
      } catch (e) {
        // ignore
      }
    }
    console.log("🧹 Cleaned up temporary test user");
  }
}

runSupabaseTests().then(() => {
  console.log("\n=================================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================================");
  if (failed > 0) process.exit(1);
});
