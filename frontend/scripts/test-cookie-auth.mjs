import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await client.auth.signInWithPassword({
  email: "priya.staff@sivagangai.com",
  password: "Password123!",
});

if (error) {
  console.error("Auth sign-in failed:", error.message);
  process.exit(1);
}

const session = data.session;
const projectRef = "jcimhsywdzkjovvhalws";

// Format Supabase SSR cookies
const cookieName = `sb-${projectRef}-auth-token`;
const cookieValue = encodeURIComponent(JSON.stringify(session));
const cookies = `${cookieName}=${cookieValue}; path=/;`;

console.log("Successfully authenticated as staff user priya.staff@sivagangai.com");

async function checkUrl(url, expectedRedirect = null) {
  const res = await fetch(url, {
    headers: {
      Cookie: cookies,
    },
    redirect: "manual",
  });

  const location = res.headers.get("location");
  console.log(`GET ${url} -> Status: ${res.status}${location ? ` (Redirect: ${location})` : ""}`);

  if (res.status === 200) {
    const text = await res.text();
    return { ok: true, html: text };
  }
  return { ok: res.status < 400, redirect: location };
}

// 1. Staff accessing /account (Dashboard)
const accRes = await checkUrl("http://localhost:3000/account");
if (accRes.ok) {
  console.log("✅ /account rendered successfully!");
  console.log("   Contains 'Workspace Dashboard':", accRes.html.includes("Workspace Dashboard"));
  console.log("   Contains 'Confirmed Bookings':", accRes.html.includes("Confirmed Bookings"));
  console.log("   Contains 'Upcoming (7 Days)':", accRes.html.includes("Upcoming (7 Days)"));
  console.log("   Contains 'My Bookings' tab:", accRes.html.includes("My Bookings"));
}

// 2. Staff accessing /account/bookings
const bookRes = await checkUrl("http://localhost:3000/account/bookings");
if (bookRes.ok) {
  console.log("✅ /account/bookings rendered successfully!");
  console.log("   Contains 'My Bookings':", bookRes.html.includes("My Bookings"));
  console.log("   Contains search input:", bookRes.html.includes("Search by client name"));
  console.log("   Contains 'All Services':", bookRes.html.includes("All Services"));
}

// 3. Staff accessing /account/profile
const profRes = await checkUrl("http://localhost:3000/account/profile");
if (profRes.ok) {
  console.log("✅ /account/profile rendered successfully!");
  console.log("   Contains 'My Details & Credentials':", profRes.html.includes("My Details & Credentials"));
  console.log("   Contains 'Change Password':", profRes.html.includes("Change Password"));
  console.log("   Contains 'Monthly Salary':", profRes.html.includes("Monthly Salary"));
}

// 4. Staff attempting to access /admin -> MUST redirect back to /account
console.log("\nTesting Staff attempt to open /admin:");
const adminRes = await checkUrl("http://localhost:3000/admin");
if (adminRes.redirect === "/account" || adminRes.redirect?.endsWith("/account")) {
  console.log("✅ Staff cannot open /admin! Correctly redirected to /account");
} else {
  console.log("❌ Unexpected admin response:", adminRes);
}
