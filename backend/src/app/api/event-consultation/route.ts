// POST /api/event-consultation
// Receives an event consultation request from Sivagangai Events,
// validates it, saves it in the Supabase event_consultations table,
// sends an email notification to the studio owner, and returns JSON.
//
// Status codes: 201 saved · 400 invalid input · 429 too many requests · 500 server problem.

import { NextResponse } from "next/server";
import { encryptPhone, hashPhone, maskPhone } from "@/lib/crypto/phone";
import { sendOwnerNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { validateEventConsultation } from "@/lib/validation";
import type { ApiResponse, EventConsultationFormData } from "@/types";

type Reply = ApiResponse<EventConsultationFormData>;

const SUCCESS_MESSAGE =
  "Thank you! We have received your consultation request and will call you within 24 hours.";

export async function POST(request: Request) {
  try {
    // 1) Rate limit: at most 5 requests per IP address every 10 minutes.
    const limit = checkRateLimit(`event-consultation:${getClientIp(request)}`, {
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

  // 3) Honeypot: real visitors never fill the hidden "website" field, bots often do.
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
  const result = validateEventConsultation(body);
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

  // 6) Save to Supabase event_consultations table
  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("event_consultations").insert({
      name: data.name,
      phone: null, // plain number is never stored
      phone_encrypted: phoneEncrypted,
      phone_hash: phoneHash,
      email: data.email || null,
      event_type: data.eventType,
      event_date: data.eventDate || null,
      guest_count: data.guestCount || null,
      notes: data.notes || null,
    });
    if (error) throw error;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error);
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : "";
    if (errorCode === "PGRST205" || errorMsg.includes("schema cache")) {
      console.error(
        "⚠️ Supabase table 'event_consultations' does not exist yet. Please execute the migration in the Supabase Dashboard SQL Editor.",
      );
    } else {
      console.error("Saving event consultation failed:", errorMsg);
    }
    return NextResponse.json<Reply>(
      {
        ok: false,
        message: "Sorry, something went wrong on our side. Please try again later.",
      },
      { status: 500 },
    );
  }

  // 7) Send owner notification email
  await sendOwnerNotification({
    subject: `New Event Consultation Request: ${data.name} (${data.eventType})`,
    replyTo: data.email || undefined,
    lines: [
      "You have received a new consultation request from Sivagangai Events.",
      "",
      `Name: ${data.name}`,
      `Phone: ${maskPhone(data.phone)} (Full number in Admin Dashboard)`,
      `Email: ${data.email || "-"}`,
      `Event Type: ${data.eventType}`,
      `Target Date: ${data.eventDate || "-"}`,
      `Estimated Guests: ${data.guestCount || "-"}`,
      `Notes: ${data.notes || "-"}`,
    ],
  });

  // 7) Answer with success
  return NextResponse.json<Reply>(
    { ok: true, message: SUCCESS_MESSAGE },
    { status: 201 },
  );
  } catch (error) {
    console.error("Unhandled error in /api/event-consultation:", error);
    return NextResponse.json<Reply>(
      {
        ok: false,
        message: "Sorry, something went wrong on our side. Please try again later.",
      },
      { status: 500 },
    );
  }
}
