// Automated test suite for Admin authentication, authorization, and Supabase data mutations.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcimhsywdzkjovvhalws.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PqSFEsctUPP9YpNopQE22Q_gIQno6Mc";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_p3r0YJgOQiDnbznCL3Iuyg_ds-MBBX3";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@sivagangai.com,nithishpantiya@gmail.com")
  .split(",")
  .map(e => e.trim().toLowerCase());

console.log("=== STARTING ADMIN INTEGRATION TEST SUITE ===");

const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
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

  // TEST 1: Login with Wrong Password
  console.log("\n--- TEST 1: Wrong Password Authentication ---");
  {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: "admin@sivagangai.com",
      password: "WrongPassword123!",
    });
    assert(error !== null, "Authentication rejected invalid password");
    assert(!data.session, "No session returned for invalid password");
  }

  // TEST 2: Login with Non-Admin Account (must be refused by admin access check)
  console.log("\n--- TEST 2: Non-Admin Account Authorization ---");
  {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: "visitor@example.com",
      password: "VisitorPass2026!",
    });
    assert(!error && data.user, "Non-admin authenticated with Supabase Auth");
    const isAllowed = ADMIN_EMAILS.includes(data.user.email.toLowerCase());
    assert(isAllowed === false, "Non-admin email correctly identified as unauthorized");
    
    // Simulate signout
    await anonClient.auth.signOut();
  }

  // TEST 3: Login with Authorized Admin Account
  console.log("\n--- TEST 3: Authorized Admin Authentication ---");
  {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: "admin@sivagangai.com",
      password: "StudioAdmin2026!",
    });
    assert(!error && data.user, "Admin authenticated with Supabase Auth");
    const isAllowed = ADMIN_EMAILS.includes(data.user.email.toLowerCase());
    assert(isAllowed === true, "Admin email recognized as authorized in ADMIN_EMAILS");
  }

  // TEST 4: Supabase Data Mutation (Update Booking Status)
  console.log("\n--- TEST 4: Booking Status Mutation in Supabase ---");
  {
    // Fetch a booking to mutate
    const { data: bookings, error: fetchErr } = await adminClient
      .from("bookings")
      .select("id, status, updated_at")
      .limit(1);

    assert(!fetchErr && bookings.length > 0, "Fetched existing booking from Supabase");
    const targetBooking = bookings[0];
    const initialStatus = targetBooking.status;
    const newStatus = initialStatus === "confirmed" ? "pending" : "confirmed";

    // Update status
    const updateTime = new Date().toISOString();
    const { error: updateErr } = await adminClient
      .from("bookings")
      .update({ status: newStatus, updated_at: updateTime })
      .eq("id", targetBooking.id);

    assert(!updateErr, `Updated booking status from '${initialStatus}' to '${newStatus}'`);

    // Verify in database
    const { data: refreshed, error: verifyErr } = await adminClient
      .from("bookings")
      .select("id, status, updated_at")
      .eq("id", targetBooking.id)
      .single();

    assert(!verifyErr, "Queried updated booking from Supabase");
    assert(refreshed.status === newStatus, `Database confirmed new status is '${refreshed.status}'`);
    assert(refreshed.updated_at >= updateTime, "Database confirmed updated_at timestamp updated");

    // Revert status back
    await adminClient
      .from("bookings")
      .update({ status: initialStatus })
      .eq("id", targetBooking.id);
    console.log(`Reverted booking status back to '${initialStatus}'.`);
  }

  // TEST 5: Contact Messages Management
  console.log("\n--- TEST 5: Contact Messages Operations ---");
  {
    const { data: contacts, error: contactErr } = await adminClient
      .from("contacts")
      .select("id, is_read")
      .limit(1);

    if (contacts && contacts.length > 0) {
      const targetContact = contacts[0];
      const initialRead = targetContact.is_read;
      const newRead = !initialRead;

      const { error: toggleErr } = await adminClient
        .from("contacts")
        .update({ is_read: newRead })
        .eq("id", targetContact.id);

      assert(!toggleErr, `Toggled contact is_read from ${initialRead} to ${newRead}`);

      const { data: verifiedContact } = await adminClient
        .from("contacts")
        .select("id, is_read")
        .eq("id", targetContact.id)
        .single();

      assert(verifiedContact.is_read === newRead, `Confirmed is_read updated in Supabase`);

      // Revert back
      await adminClient
        .from("contacts")
        .update({ is_read: initialRead })
        .eq("id", targetContact.id);
    } else {
      console.log("No contacts in database to test, skipping contact toggle.");
    }
  }

  // TEST 6: Sign Board Bookings Management
  console.log("\n--- TEST 6: Sign Board Bookings Operations ---");
  {
    const { data: signboards } = await adminClient
      .from("signboard_bookings")
      .select("id, status")
      .limit(1);

    if (signboards && signboards.length > 0) {
      const target = signboards[0];
      const initialStatus = target.status;
      const newStatus = initialStatus === "installed" ? "site_visit_scheduled" : "installed";

      const { error: updateErr } = await adminClient
        .from("signboard_bookings")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", target.id);

      assert(!updateErr, `Updated signboard order status to '${newStatus}'`);

      const { data: verified } = await adminClient
        .from("signboard_bookings")
        .select("id, status")
        .eq("id", target.id)
        .single();

      assert(verified.status === newStatus, `Database confirmed signboard status is '${newStatus}'`);

      // Revert
      await adminClient
        .from("signboard_bookings")
        .update({ status: initialStatus })
        .eq("id", target.id);
    } else {
      console.log("No signboard orders in database to test.");
    }
  }

  // TEST 7: Event Consultations Management
  console.log("\n--- TEST 7: Event Consultations Operations ---");
  {
    const { data: events } = await adminClient
      .from("event_consultations")
      .select("id, status")
      .limit(1);

    if (events && events.length > 0) {
      const target = events[0];
      const initialStatus = target.status;
      const newStatus = initialStatus === "confirmed" ? "contacted" : "confirmed";

      const { error: updateErr } = await adminClient
        .from("event_consultations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", target.id);

      assert(!updateErr, `Updated event consultation status to '${newStatus}'`);

      const { data: verified } = await adminClient
        .from("event_consultations")
        .select("id, status")
        .eq("id", target.id)
        .single();

      assert(verified.status === newStatus, `Database confirmed event consultation status is '${newStatus}'`);

      // Revert
      await adminClient
        .from("event_consultations")
        .update({ status: initialStatus })
        .eq("id", target.id);
    } else {
      console.log("No event consultations in database to test.");
    }
  }

  // TEST 8: Digital Marketing Bookings Management
  console.log("\n--- TEST 8: Digital Marketing Bookings Operations ---");
  {
    const { data: digitals } = await adminClient
      .from("digital_marketing_bookings")
      .select("id, status")
      .limit(1);

    if (digitals && digitals.length > 0) {
      const target = digitals[0];
      const initialStatus = target.status;
      const newStatus = initialStatus === "converted" ? "audit_sent" : "converted";

      const { error: updateErr } = await adminClient
        .from("digital_marketing_bookings")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", target.id);

      assert(!updateErr, `Updated digital marketing request status to '${newStatus}'`);

      const { data: verified } = await adminClient
        .from("digital_marketing_bookings")
        .select("id, status")
        .eq("id", target.id)
        .single();

      assert(verified.status === newStatus, `Database confirmed digital marketing status is '${newStatus}'`);

      // Revert
      await adminClient
        .from("digital_marketing_bookings")
        .update({ status: initialStatus })
        .eq("id", target.id);
    } else {
      console.log("No digital marketing requests in database to test.");
    }
  }

  // Summary
  console.log("\n=== TEST RESULTS SUMMARY ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
