// POST /api/booking
// Receives a booking request, checks it, saves it in Supabase and answers with JSON.
// The mobile app can call this same endpoint later.
//
// Status codes: 201 saved · 400 invalid input · 429 too many requests · 500 server problem.
// Visitors only ever see short, safe messages. Technical details stay in the server log.

import { NextResponse } from "next/server";
import { sendOwnerNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { validateBooking } from "@/lib/validation";
import type { ApiResponse, BookingFormData } from "@/types";

type Reply = ApiResponse<BookingFormData>;

const SUCCESS_MESSAGE =
  "Thank you! We have received your request and will confirm within one working day.";

export async function POST(request: Request) {
  // 1) Rate limit: at most 5 requests per IP address every 10 minutes.
  const limit = checkRateLimit(`booking:${getClientIp(request)}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json<Reply>(
      { ok: false, message: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2) Read the JSON body (it can be broken or empty, so we catch errors).
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
  //    We pretend it worked so the bot doesn't learn anything, but save nothing.
  if (typeof body === "object" && body !== null) {
    const trap = (body as Record<string, unknown>).website;
    if (typeof trap === "string" && trap.trim() !== "") {
      return NextResponse.json<Reply>(
        { ok: true, message: SUCCESS_MESSAGE },
        { status: 201 },
      );
    }
  }

  // 4) Validate on the server too, because the browser check can be skipped.
  const result = validateBooking(body);
  if (!result.valid) {
    return NextResponse.json<Reply>(
      { ok: false, message: "Please fix the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }
  const data = result.data;

  // 5) Save to Supabase. Column names match supabase/schema.sql.
  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("bookings").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      event_date: data.date,
      location: data.location || null, // empty text becomes "no value"
      message: data.message || null,
      // "status" is not sent: the database sets it to 'pending' by itself.
    });
    if (error) throw error;
  } catch (error) {
    // Log for you (the developer) but send the visitor a generic message.
    console.error(
      "Saving booking failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json<Reply>(
      {
        ok: false,
        message: "Sorry, something went wrong on our side. Please try again later.",
      },
      { status: 500 },
    );
  }

  // 6) Tell the studio owner by email (does nothing unless Resend is set up).
  await sendOwnerNotification({
    subject: `New booking request: ${data.name}`,
    replyTo: data.email,
    lines: [
      "You have a new booking request.",
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `Service: ${data.service}`,
      `Date: ${data.date}`,
      `Location: ${data.location || "-"}`,
      `Message: ${data.message || "-"}`,
    ],
  });

  // 7) Answer with success.
  return NextResponse.json<Reply>(
    { ok: true, message: SUCCESS_MESSAGE },
    { status: 201 },
  );
}
