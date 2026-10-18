// Automated screenshot capture using system Edge via Chrome DevTools Protocol (CDP).
// Captures responsive views at:
// - 1280px Desktop
// - 768px Tablet
// - 375px Mobile

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
});

// Authenticate as staff user
console.log("Authenticating staff session for screenshots...");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: "priya.staff@sivagangai.com",
  password: "Password123!",
});

if (authError) {
  console.error("Failed to authenticate test staff user:", authError.message);
  process.exit(1);
}

const session = authData.session;
const projectRef = "jcimhsywdzkjovvhalws";
const cookieName = `sb-${projectRef}-auth-token`;
const cookieValue = JSON.stringify(session);

const outputDir = path.resolve(
  "C:/Users/nithish/.gemini/antigravity-ide/brain/8ffeef76-aa5f-4833-80f3-6f13713d3072",
);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const tempUserDataDir = path.join(os.tmpdir(), `edge-cdp-${Date.now()}`);
fs.mkdirSync(tempUserDataDir, { recursive: true });

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9222;

console.log("Starting headless Edge on port 9222...");
const edgeProcess = spawn(edgePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tempUserDataDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--hide-scrollbars",
  "about:blank",
]);

// Wait for CDP endpoint and page target to become ready
let wsUrl = null;
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 300));
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (res.ok) {
      const list = await res.json();
      const pageTarget = list.find((t) => t.type === "page");
      if (pageTarget && pageTarget.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    }
  } catch {
    // waiting
  }
}

if (!wsUrl) {
  console.error("Failed to connect to Edge DevTools Protocol.");
  edgeProcess.kill();
  process.exit(1);
}

console.log("Connected to Edge CDP:", wsUrl);

const ws = new WebSocket(wsUrl);

let msgId = 1;
const pendingPromises = new Map();

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pendingPromises.has(msg.id)) {
    const { resolve, reject } = pendingPromises.get(msg.id);
    pendingPromises.delete(msg.id);
    if (msg.error) {
      reject(new Error(msg.error.message));
    } else {
      resolve(msg.result);
    }
  }
};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pendingPromises.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await new Promise((resolve) => (ws.onopen = resolve));

// Initialize domains
await send("Page.enable");
await send("Network.enable");

// Set Auth Cookie
console.log("Setting staff authentication cookie...");
await send("Network.setCookie", {
  name: cookieName,
  value: cookieValue,
  domain: "localhost",
  path: "/",
  httpOnly: false,
  secure: false,
});

async function capture(url, width, height, filename, options = {}) {
  console.log(`Capturing ${filename} (${width}x${height}) at ${url}...`);

  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });

  await send("Page.navigate", { url });
  // Wait for network and render settle
  await new Promise((r) => setTimeout(r, 1200));

  if (options.clickSelector) {
    const evalRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector('${options.clickSelector}');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `,
    });
    if (evalRes?.result?.value) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  const { data } = await send("Page.captureScreenshot", {
    format: "png",
  });

  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, Buffer.from(data, "base64"));
  console.log(`Saved screenshot: ${filePath}`);
}

// 1. Desktop 1280px: Staff Dashboard
await capture("http://localhost:3000/account", 1280, 800, "staff_dashboard_1280.png");

// 2. Desktop 1280px: Staff Bookings Table
await capture("http://localhost:3000/account/bookings", 1280, 800, "staff_bookings_1280.png");

// 3. Desktop 1280px: Staff Profile / Details
await capture("http://localhost:3000/account/profile", 1280, 800, "staff_profile_1280.png");

// 4. Tablet 768px: Staff Dashboard
await capture("http://localhost:3000/account", 768, 1024, "staff_dashboard_768.png");

// 5. Tablet 768px: Staff Bookings Table
await capture("http://localhost:3000/account/bookings", 768, 1024, "staff_bookings_768.png");

// 6. Mobile 375px: Staff Dashboard
await capture("http://localhost:3000/account", 375, 812, "staff_dashboard_375.png");

// 7. Mobile 375px: Staff Bookings Stacked Cards
await capture("http://localhost:3000/account/bookings", 375, 812, "staff_bookings_375.png");

// 8. Mobile 375px: Mobile Navigation Drawer (click hamburger button)
await capture("http://localhost:3000/account", 375, 812, "staff_mobile_menu_375.png", {
  clickSelector: "button[aria-label='Open navigation menu']",
});

// Close WebSocket and terminate Edge process
ws.close();
edgeProcess.kill();
try {
  fs.rmSync(tempUserDataDir, { recursive: true, force: true });
} catch {
  // ignore
}

console.log("\nAll screenshots captured successfully!");
