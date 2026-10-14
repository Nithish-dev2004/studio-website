// CORS for the whole API.
//
// Browsers only let a website call an API on a DIFFERENT address (here: the frontend on
// port 3000 calling the backend on port 4000) if the API says "this website is allowed".
// This file does that for every /api/... route in one place, so the routes stay simple.
//
// Which websites are allowed is set with ALLOWED_ORIGINS in backend/.env.local
// (comma-separated, no trailing slash). The default is the local frontend.
//
// Mobile apps and tools like curl send no "Origin" header and are not affected by CORS.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function allowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS ?? "http://localhost:3000";
  return raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Requests without an Origin header (curl, mobile apps, server to server) are fine.
  if (origin === null) return NextResponse.next();

  // A browser on a website we do not know: refuse.
  if (!allowedOrigins().includes(origin)) {
    console.warn(
      `Blocked request from origin ${origin}. Add it to ALLOWED_ORIGINS to allow it.`,
    );
    return NextResponse.json(
      { ok: false, message: "Origin not allowed." },
      { status: 403 },
    );
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400", // the browser may remember this answer for a day
    // Tells caches that the answer depends on who is asking.
    Vary: "Origin",
  };

  // "Preflight": before a POST with JSON, the browser first asks OPTIONS "is this allowed?".
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Normal request: let the route run, then add the CORS headers to its answer.
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(corsHeaders))
    response.headers.set(name, value);
  return response;
}

// Only run for the API.
export const config = {
  matcher: "/api/:path*",
};
