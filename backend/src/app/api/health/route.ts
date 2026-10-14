// GET /api/health
// A tiny "is the backend running?" check. Open http://localhost:4000/api/health in a browser.

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "studio-backend" });
}
