// POST /api/digital-booking
// Receives a growth audit / booking request from Sivagangai Digital Marketing,
// validates it, encrypts the customer phone number with AES-256-GCM,
// stores it in Supabase digital_marketing_bookings table,
// notifies the studio owner by email, and returns a safe JSON response.
//
// Status codes: 201 saved · 400 invalid input · 429 too many requests · 500 server problem.

import { NextResponse } from "next/server";
import { z } from "zod";
import { encryptPhone, hashPhone, maskPhone } from "@/lib/crypto/phone";
import { sendOwnerNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { ApiResponse, DigitalBookingFormData, FieldErrors } from "@/types";

const requiredPhoneField = z
  .string()
  .trim()
  .max(30, "Please enter a valid phone number.")
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    },
    "Please enter a valid phone number.",
  );

const digitalBookingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Please enter your company or business name.")
    .max(150, "Please keep company name under 150 characters."),
  phone: requiredPhoneField,
  email: z
    .string()
    .trim()
    .max(254, "Please enter a valid email address.")
    .pipe(z.email("Please enter a valid email address."))
    .or(z.literal(""))
    .optional()
    .default(""),
  serviceInterested: z
    .string()
    .trim()
    .max(150, "Please keep service selection under 150 characters.")
    .optional()
    .default("Meta & Google Paid Ads"),
  budget: z
    .string()
    .trim()
    .max(100, "Please keep budget under 100 characters.")
    .optional()
    .default("₹15,000 - ₹30,000 / mo"),
  websiteUrl: z
    .string()
    .trim()
    .max(300, "Please keep URL under 300 characters.")
    .optional()
    .default(""),
  plan: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("Free Marketing Audit"),
  website: z.string().trim().max(100).optional().default(""),
});

type Reply = ApiResponse<DigitalBookingFormData>;

const SUCCESS_MESSAGE =
  "Thank you! We have received your audit request. Our Senior Growth Strategist will contact you within 2 business hours.";

export async function POST(request: Request) {
  try {
    // 1) Rate limit: at most 5 requests per IP address every 10 minutes (relaxed in dev).
    const limit = checkRateLimit(`digital-booking:${getClientIp(request)}`, {
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
        { ok: false, message: "Invalid request payload." },
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
    const validation = digitalBookingSchema.safeParse(body);
    if (!validation.success) {
      const errors: FieldErrors<DigitalBookingFormData> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field as keyof DigitalBookingFormData]) {
          errors[field as keyof DigitalBookingFormData] = issue.message;
        }
      }
      return NextResponse.json<Reply>(
        { ok: false, message: "Please check the highlighted fields.", errors },
        { status: 400 },
      );
    }
    const data = validation.data;

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

    // 6) Save to Supabase digital_marketing_bookings table
    try {
      const supabase = createSupabaseAdmin();
      const { error } = await supabase.from("digital_marketing_bookings").insert({
        business_name: data.businessName,
        phone: null, // plain number is never stored
        phone_encrypted: phoneEncrypted,
        phone_hash: phoneHash,
        email: data.email || null,
        service_interested: data.serviceInterested || "Meta & Google Paid Ads",
        budget: data.budget || "₹15,000 - ₹30,000 / mo",
        website_url: data.websiteUrl || null,
        plan: data.plan || "Free Marketing Audit",
        status: "new",
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

      const isMissingTable =
        errorCode === "PGRST205" ||
        errorCode === "42P01" ||
        errorMsg.includes("schema cache") ||
        errorMsg.includes("does not exist") ||
        errorMsg.includes("relation");

      if (isMissingTable) {
        console.error(
          "⚠️ Supabase table 'digital_marketing_bookings' does not exist yet. Please execute migration_digital_marketing_bookings.sql in the Supabase Dashboard SQL Editor.",
        );
        return NextResponse.json<Reply>(
          {
            ok: false,
            message:
              "Database table 'digital_marketing_bookings' does not exist yet. Please run migration_digital_marketing_bookings.sql in your Supabase SQL Editor.",
          },
          { status: 503 },
        );
      }

      console.error("Saving digital marketing booking failed:", errorMsg);

      return NextResponse.json<Reply>(
        {
          ok: false,
          message: "Sorry, something went wrong on our side. Please try again later.",
        },
        { status: 500 },
      );
    }

    // 7) Send owner notification email with masked phone number
    await sendOwnerNotification({
      subject: `New Digital Marketing Audit Request: ${data.businessName}`,
      replyTo: data.email || undefined,
      lines: [
        "You have received a new growth audit request from Sivagangai Digital Marketing.",
        "",
        `Company / Business: ${data.businessName}`,
        `Contact Phone: ${maskPhone(data.phone)} (Full decrypted number available in Admin Dashboard)`,
        `Email: ${data.email || "-"}`,
        `Service of Interest: ${data.serviceInterested || "-"}`,
        `Monthly Budget: ${data.budget || "-"}`,
        `Website / Social URL: ${data.websiteUrl || "-"}`,
        `Plan Badge: ${data.plan || "-"}`,
      ],
    });

    // 8) Return success to client (never returns phone number)
    return NextResponse.json<Reply>(
      { ok: true, message: SUCCESS_MESSAGE },
      { status: 201 },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Unhandled error in /api/digital-booking:", errorMsg);
    return NextResponse.json<Reply>(
      {
        ok: false,
        message:
          process.env.NODE_ENV !== "production"
            ? `Server Error: ${errorMsg}`
            : "Sorry, something went wrong on our side. Please try again later.",
      },
      { status: 500 },
    );
  }
}
