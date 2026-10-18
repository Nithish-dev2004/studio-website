// Automated responsive screenshots for Feedback page and Admin Feedback moderation

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

console.log("Authenticating admin session for screenshots...");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: "admin@sivagangai.com",
  password: "StudioAdmin2026!",
});

if (authError) {
  console.error("Admin authentication note:", authError.message);
}

const session = authData?.session;
const projectRef = "jcimhsywdzkjovvhalws";
const cookieName = `sb-${projectRef}-auth-token`;
const cookieValue = session ? JSON.stringify(session) : "";

const outputDir = path.resolve(
  "C:/Users/nithish/.gemini/antigravity-ide/brain/8ffeef76-aa5f-4833-80f3-6f13713d3072",
);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const tempUserDataDir = path.join(os.tmpdir(), `edge-feedback-cdp-${Date.now()}`);
fs.mkdirSync(tempUserDataDir, { recursive: true });

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9223;

console.log(`Starting headless Edge on port ${port}...`);
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
  } catch {}
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

await send("Page.enable");
await send("Network.enable");

if (cookieValue) {
  console.log("Setting admin authentication cookie...");
  await send("Network.setCookie", {
    name: cookieName,
    value: cookieValue,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
  });
}

async function capture(url, width, height, filename) {
  console.log(`Capturing ${filename} (${width}x${height}) at ${url}...`);

  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });

  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 3500));

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });

  const buffer = Buffer.from(screenshot.data, "base64");
  const savePath = path.join(outputDir, filename);
  fs.writeFileSync(savePath, buffer);
  console.log(`Saved screenshot: ${savePath} (${buffer.length} bytes)`);
}

try {
  // 1. Desktop Feedback Page (1280px)
  await capture("http://localhost:3000/feedback", 1280, 950, "feedback_desktop_1280.png");

  // 2. Tablet Feedback Page (768px)
  await capture("http://localhost:3000/feedback", 768, 1024, "feedback_tablet_768.png");

  // 3. Mobile Feedback Page (375px)
  await capture("http://localhost:3000/feedback", 375, 812, "feedback_mobile_375.png");

  // 4. Admin Feedback Moderation Page (1280px)
  await capture("http://localhost:3000/admin/feedback", 1280, 950, "admin_feedback_1280.png");

  // 5. Admin Dashboard with Feedback KPI card (1280px)
  await capture("http://localhost:3000/admin", 1280, 950, "admin_dashboard_feedback_kpi_1280.png");

  console.log("All screenshots captured successfully!");
} catch (err) {
  console.error("Screenshot capture error:", err);
} finally {
  try {
    ws.close();
  } catch {}
  edgeProcess.kill();
  try {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  } catch {}
}
