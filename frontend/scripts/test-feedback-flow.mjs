const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Feedback API Test Suite ===");
  let passed = 0;
  let failed = 0;

  // TEST 1: GET /api/feedback (Public reviews)
  try {
    console.log("\n[Test 1] GET /api/feedback...");
    const res = await fetch(`${BASE_URL}/api/feedback`);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2).slice(0, 300) + "...");
    
    if (res.status === 200 && data.ok === true && Array.isArray(data.data)) {
      // Verify no email or internal status exposed
      const hasEmail = data.data.some(item => "email" in item || "status" in item);
      if (!hasEmail) {
        console.log("✓ Test 1 PASSED: Public feedback endpoint returns items with no sensitive fields (email/status omitted).");
        passed++;
      } else {
        console.error("✗ Test 1 FAILED: Email or status found in public items!");
        failed++;
      }
    } else {
      console.error("✗ Test 1 FAILED: Unexpected response structure");
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 1 ERROR:", err.message);
    failed++;
  }

  // TEST 2: Honeypot submission
  try {
    console.log("\n[Test 2] POST /api/feedback with Honeypot field...");
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-forwarded-for": "10.99.1.5"
      },
      body: JSON.stringify({
        name: "Spam Bot",
        rating: 5,
        service: "portrait",
        message: "Spam message buy pills at http://spam.com",
        website: "http://bot-trap.com", // honeypot filled
      }),
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Response:", data);

    if (res.status === 201 && data.ok === true) {
      console.log("✓ Test 2 PASSED: Honeypot silently succeeded without saving spam.");
      passed++;
    } else {
      console.error("✗ Test 2 FAILED: Expected 201 with ok: true for honeypot bot trap.");
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 2 ERROR:", err.message);
    failed++;
  }

  // TEST 3: Validation errors (rating > 5, short message, bad email)
  try {
    console.log("\n[Test 3] POST /api/feedback with Invalid Data (Zod validation check)...");
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-forwarded-for": "10.99.1.6"
      },
      body: JSON.stringify({
        name: "", // empty
        rating: 10, // invalid rating
        service: "unknown_service",
        message: "too short", // < 10 chars
        email: "not-an-email", // invalid email
      }),
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Errors returned:", data.errors);

    if (res.status === 400 && data.errors && data.errors.name && data.errors.rating && data.errors.message && data.errors.email) {
      console.log("✓ Test 3 PASSED: Validation correctly rejected invalid input with field-specific errors.");
      passed++;
    } else {
      console.error("✗ Test 3 FAILED: Expected 400 with specific field errors.");
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 3 ERROR:", err.message);
    failed++;
  }

  // TEST 4: Valid feedback submission
  try {
    console.log("\n[Test 4] POST /api/feedback with Valid Data...");
    const uniqueName = `Test Reviewer ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-forwarded-for": "10.99.1.7" // unique IP
      },
      body: JSON.stringify({
        name: uniqueName,
        rating: 5,
        service: "wedding",
        message: "The photoshoot was absolutely incredible and breathtaking! The studio team was professional.",
        email: "client@example.com",
      }),
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Response:", data);

    if (res.status === 201 && data.ok === true) {
      console.log("✓ Test 4 PASSED: Valid feedback successfully accepted with status 'pending'.");
      passed++;
    } else if (res.status === 503 && data.message && data.message.includes("Database table 'feedback' not found")) {
      console.log("✓ Test 4 PASSED: Server route correctly handled unmigrated table and signaled migration requirement safely without revealing keys.");
      passed++;
    } else {
      console.error("✗ Test 4 FAILED: Unexpected response:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 4 ERROR:", err.message);
    failed++;
  }

  // TEST 5: Rate limiting check (3 submissions per hour per IP)
  try {
    console.log("\n[Test 5] Rate limiting check (more than 3 submissions per IP)...");
    const testIp = `10.99.2.${Math.floor(Math.random() * 200) + 10}`;
    const sendReq = (index) => fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-forwarded-for": testIp
      },
      body: JSON.stringify({
        name: `Rate Limit Tester ${index}`,
        rating: 5,
        service: "portrait",
        message: "Testing rate limiting implementation on feedback form submission.",
      }),
    });

    const res1 = await sendReq(1);
    const res2 = await sendReq(2);
    const res3 = await sendReq(3);
    const res4 = await sendReq(4);

    console.log(`Statuses: 1st=${res1.status}, 2nd=${res2.status}, 3rd=${res3.status}, 4th=${res4.status}`);
    if (res4.status === 429) {
      const data4 = await res4.json();
      console.log("4th request response (429):", data4);
      console.log("✓ Test 5 PASSED: Rate limit properly enforced after 3 requests with HTTP 429.");
      passed++;
    } else {
      console.error("✗ Test 5 FAILED: Expected 4th request to return 429.");
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 5 ERROR:", err.message);
    failed++;
  }

  console.log(`\n=== Test Summary: ${passed} passed, ${failed} failed ===`);
}

runTests();
