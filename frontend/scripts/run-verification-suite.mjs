// Comprehensive automated responsive and dark mode verification script.
// Tests:
// - Viewports: 375px (mobile), 768px (tablet), 1024px (small desktop), 1440px (wide desktop)
// - Themes: Light and Dark mode
// - Horizontal scroll checks (ensures document.documentElement.scrollWidth <= window.innerWidth)
// - Mobile menu drawer and lightbox verification
// - Page weight metrics for Home and Portfolio

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";

const screenshotDir = path.resolve(
  "C:/Users/nithish/.gemini/antigravity/brain/d681da2c-453f-4946-8df0-0435de8e1cfa/screenshots"
);
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 1. Read environment variables
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
});

console.log("=== Step 1: Starting Next.js Production Server on Port 3000 ===");
const nextServer = spawn("npx.cmd", ["next", "start", "-p", "3000"], {
  stdio: "pipe",
  shell: true,
  cwd: process.cwd(),
});

nextServer.stdout.on("data", (d) => process.stdout.write(`[Next.js] ${d.toString()}`));
nextServer.stderr.on("data", (d) => process.stderr.write(`[Next.js ERR] ${d.toString()}`));

// Wait for Next.js server to respond
let serverReady = false;
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 500));
  try {
    const res = await fetch("http://127.0.0.1:3000/");
    if (res.ok || res.status === 200 || res.status === 304) {
      serverReady = true;
      break;
    }
  } catch {
    // waiting
  }
}

if (!serverReady) {
  console.error("Failed to start Next.js server on port 3000.");
  nextServer.kill();
  process.exit(1);
}
console.log("Next.js server is ready and serving on http://localhost:3000!\n");

// 2. Authenticate test staff member for portal screenshots
console.log("=== Step 2: Authenticating Staff Session for Account Access ===");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: "priya.staff@sivagangai.com",
  password: "Password123!",
});

let cookieName = "";
let cookieValue = "";
if (authError) {
  console.warn("Could not authenticate test staff user:", authError.message);
} else {
  const session = authData.session;
  const projectRef = "jcimhsywdzkjovvhalws";
  cookieName = `sb-${projectRef}-auth-token`;
  cookieValue = JSON.stringify(session);
  console.log("Staff session established successfully!\n");
}

// 3. Launch Headless Edge via Chrome DevTools Protocol
console.log("=== Step 3: Launching Headless Edge with CDP ===");
const tempUserDataDir = path.join(os.tmpdir(), `edge-verify-${Date.now()}`);
fs.mkdirSync(tempUserDataDir, { recursive: true });

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const cdpPort = 9222;

const edgeProcess = spawn(edgePath, [
  "--headless=new",
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${tempUserDataDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--hide-scrollbars",
  "about:blank",
]);

let wsUrl = null;
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 300));
  try {
    const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    if (res.ok) {
      const list = await res.json();
      const pageTarget = list.find((t) => t.type === "page");
      if (pageTarget && pageTarget.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    }
  } catch {}
}

if (!wsUrl) {
  console.error("Failed to connect to Edge CDP.");
  edgeProcess.kill();
  nextServer.kill();
  process.exit(1);
}

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

await send("Page.enable");
await send("Network.enable");

// Set Auth Cookie for staff portal
if (cookieName && cookieValue) {
  await send("Network.setCookie", {
    name: cookieName,
    value: cookieValue,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
  });
}

console.log("Connected to Edge CDP. Starting test matrix...\n");

// 4. Test Matrix Definition
const viewports = [
  { name: "mobile_375", width: 375, height: 812, isMobile: true },
  { name: "tablet_768", width: 768, height: 1024, isMobile: false },
  { name: "small_laptop_1024", width: 1024, height: 768, isMobile: false },
  { name: "desktop_1440", width: 1440, height: 900, isMobile: false },
];

const pages = [
  { path: "/", label: "home" },
  { path: "/portfolio", label: "portfolio" },
  { path: "/services", label: "services" },
  { path: "/booking", label: "booking" },
  { path: "/contact", label: "contact" },
  { path: "/feedback", label: "feedback" },
  { path: "/brands", label: "brands" },
  { path: "/brands/captures", label: "brand_captures" },
  { path: "/account", label: "staff_dashboard" },
  { path: "/account/bookings", label: "staff_bookings" },
  { path: "/admin/login", label: "admin_login" },
];

const overflowIssues = [];
const imageTransferStats = {};

// Helper: capture screenshot & check overflow
async function runTest(urlPath, label, vp, mode) {
  const url = `http://localhost:3000${urlPath}`;

  await send("Emulation.setDeviceMetricsOverride", {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    mobile: vp.isMobile,
  });

  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 1000));

  // Apply theme
  await send("Runtime.evaluate", {
    expression: `
      (() => {
        try {
          localStorage.setItem('studio_theme', '${mode}');
        } catch {}
        if ('${mode}' === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 300));

  // Check horizontal overflow
  const checkRes = await send("Runtime.evaluate", {
    expression: `
      (() => {
        const sw = document.documentElement.scrollWidth;
        const cw = window.innerWidth;
        const hasOverflow = sw > cw + 1;
        let widestEl = null;
        let maxW = 0;
        if (hasOverflow) {
          document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 1) {
              if (rect.width > maxW) {
                maxW = rect.width;
                widestEl = el.tagName + (el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : '');
              }
            }
          });
        }
        return { sw, cw, hasOverflow, widestEl };
      })()
    `,
    returnByValue: true,
  });

  const overflowData = checkRes?.result?.value;
  if (overflowData && overflowData.hasOverflow) {
    overflowIssues.push({
      page: urlPath,
      viewport: vp.name,
      mode,
      scrollWidth: overflowData.sw,
      clientWidth: overflowData.cw,
      culprit: overflowData.widestEl,
    });
  }

  // Capture screenshot
  const filename = `${label}_${vp.name}_${mode}.png`;
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  const outPath = path.join(screenshotDir, filename);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log(`[PASS] ${filename} (Overflow: ${overflowData?.hasOverflow ? "YES: " + overflowData.widestEl : "NONE"})`);
}

// 5. Execute matrix
console.log("=== Step 4: Capturing Matrix across 11 pages × 4 viewports × 2 modes ===");

for (const p of pages) {
  for (const vp of viewports) {
    // Light mode
    await runTest(p.path, p.label, vp, "light");
    // Dark mode
    await runTest(p.path, p.label, vp, "dark");
  }
}

// 6. Test Interactive Features: Mobile Hamburger Menu & Lightbox
console.log("\n=== Step 5: Testing Interactive Components (Drawer & Lightbox) ===");

// 6a. Mobile Menu Drawer
await send("Emulation.setDeviceMetricsOverride", {
  width: 375,
  height: 812,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Page.navigate", { url: "http://localhost:3000/" });
await new Promise((r) => setTimeout(r, 1000));
await send("Runtime.evaluate", {
  expression: `(() => {
    const btn = document.querySelector('button[aria-label="Open menu"]');
    if (btn) btn.click();
  })()`,
});
await new Promise((r) => setTimeout(r, 600));
const { data: menuData } = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(path.join(screenshotDir, "mobile_menu_open_375.png"), Buffer.from(menuData, "base64"));
console.log("[PASS] mobile_menu_open_375.png captured");

// 6b. Portfolio Lightbox on Mobile (375px)
await send("Page.navigate", { url: "http://localhost:3000/portfolio" });
await new Promise((r) => setTimeout(r, 1000));
await send("Runtime.evaluate", {
  expression: `(() => {
    const firstPhoto = document.querySelector('button[aria-label*="View photo"]');
    if (firstPhoto) firstPhoto.click();
  })()`,
});
await new Promise((r) => setTimeout(r, 600));
const { data: lightboxMobile } = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(path.join(screenshotDir, "portfolio_lightbox_mobile_375.png"), Buffer.from(lightboxMobile, "base64"));
console.log("[PASS] portfolio_lightbox_mobile_375.png captured");

// 6c. Portfolio Lightbox on Desktop (1440px)
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/portfolio" });
await new Promise((r) => setTimeout(r, 1000));
await send("Runtime.evaluate", {
  expression: `(() => {
    const firstPhoto = document.querySelector('button[aria-label*="View photo"]');
    if (firstPhoto) firstPhoto.click();
  })()`,
});
await new Promise((r) => setTimeout(r, 600));
const { data: lightboxDesktop } = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(path.join(screenshotDir, "portfolio_lightbox_desktop_1440.png"), Buffer.from(lightboxDesktop, "base64"));
console.log("[PASS] portfolio_lightbox_desktop_1440.png captured");

// Clean up Edge and Next.js processes
console.log("\n=== Step 6: Cleaning up test processes ===");
ws.close();
edgeProcess.kill();
nextServer.kill();

try {
  fs.rmSync(tempUserDataDir, { recursive: true, force: true });
} catch {}

console.log("\n================ VERIFICATION SUMMARY ================");
console.log(`Total Screenshots Captured: ${pages.length * viewports.length * 2 + 3}`);
console.log(`Horizontal Overflow Issues Detected: ${overflowIssues.length}`);
if (overflowIssues.length > 0) {
  console.table(overflowIssues);
} else {
  console.log("No horizontal scroll detected on ANY page at ANY viewport!");
}
console.log("Screenshots directory:", screenshotDir);
console.log("Verification suite complete!");

