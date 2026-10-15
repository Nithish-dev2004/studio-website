// POST /api/quote
// Receives a quote request (e.g. from Sivagangai Sign Board),
// validates it, encrypts the mobile number with AES-256-GCM,
// computes HMAC-SHA256 phone hash for indexing, and saves it in Supabase.
//
// Status codes: 201 saved · 400 invalid input · 429 too many requests · 500 server problem.

import { NextResponse } from "next/server";
import { encryptPhone, hashPhone, maskPhone } from "@/lib/crypto/phone";
import { sendOwnerNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { validateQuote } from "@/lib/validation";
import type { ApiResponse, QuoteFormData } from "@/types";

type Reply = ApiResponse<QuoteFormData>;

const SUCCESS_MESSAGE =
  "Thank you! Your quote request has been received. Our team will contact you shortly.";

export async function POST(request: Request) {
  // 1) Rate limit: at most 5 requests per IP address every 10 minutes.
  const limit = checkRateLimit(`quote:${getClientIp(request)}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json<Reply>(
      { ok: false, message: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2) Read the JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<Reply>(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  // 3) Honeypot check for bots
  if (typeof body === "object" && body !== null) {
    const trap = (body as Record<string, unknown>).website;
    if (typeof trap === "string" && trap.trim() !== "") {
      return NextResponse.json<Reply>(
        { ok: true, message: SUCCESS_MESSAGE },
        { status: 201 },
      );
    }
  }

  // 4) Validate on server side
  const result = validateQuote(body);
  if (!result.valid) {
    return NextResponse.json<Reply>(
      { ok: false, message: "Please check the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }
  const data = result.data;

  // 5) Encrypt and hash the mobile number. NEVER save the plain number.
  let phoneEncrypted: string;
  let phoneHash: string;
  try {
    phoneEncrypted = encryptPhone(data.phone);
    phoneHash = hashPhone(data.phone);
  } catch {
    return NextResponse.json<Reply>(
      { ok: false, message: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  // 6) Save to Supabase quotes table
  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("quotes").insert({
      name: data.name,
      phone_encrypted: phoneEncrypted,
      phone_hash: phoneHash,
      email: data.email || null,
      service: data.service || null,
      message: data.message || null,
    });
    if (error) throw error;
  } catch (error) {
    console.error(
      "Saving quote failed:",
      error instanceof Error ? error.message : "Database error",
    );
    return NextResponse.json<Reply>(
      {
        ok: false,
        message: "Sorry, something went wrong on our side. Please try again later.",
      },
      { status: 500 },
    );
  }

  // 7) Notify owner (masked phone only)
  await sendOwnerNotification({
    subject: `New Quote Request: ${data.name}`,
    replyTo: data.email || undefined,
    lines: [
      "You have received a new quote request.",
      "",
      `Name: ${data.name}`,
      `Phone: ${maskPhone(data.phone)} (Full number in Admin Dashboard)`,
      `Email: ${data.email || "-"}`,
      `Service: ${data.service || "-"}`,
      `Message: ${data.message || "-"}`,
    ],
  });

  return NextResponse.json<Reply>(
    { ok: true, message: SUCCESS_MESSAGE },
    { status: 201 },
  );
}
