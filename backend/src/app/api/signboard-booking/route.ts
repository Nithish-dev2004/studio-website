// POST /api/signboard-booking
// Receives a signboard site measurement & estimate request from Sivagangai Sign Board,
// validates it, encrypts the customer phone number with AES-256-GCM,
// stores it in Supabase signboard_bookings table,
// notifies the studio owner by email, and returns a safe JSON response.
//
// Status codes: 201 saved · 400 invalid input · 429 too many requests · 500 server problem.

import { NextResponse } from "next/server";
import { z } from "zod";
import { encryptPhone, hashPhone, maskPhone } from "@/lib/crypto/phone";
import { sendOwnerNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { ApiResponse, SignboardBookingFormData, FieldErrors } from "@/types";

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

const signboardBookingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Please enter your store or business name.")
    .max(150, "Please keep business name under 150 characters."),
  phone: requiredPhoneField,
  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("Sivagangai"),
  signType: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("3D LED Acrylic Letters"),
  dimensions: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("10 ft x 3 ft"),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default(""),
  website: z.string().trim().max(100).optional().default(""),
});

type Reply = ApiResponse<SignboardBookingFormData>;

const SUCCESS_MESSAGE =
  "Thank you! We have received your signboard request. Our signage engineer will call you within 2 hours to confirm your free on-site measurement.";

export async function POST(request: Request) {
  try {
    // 1) Rate limit: at most 5 requests per IP address every 10 minutes (relaxed in dev).
    const limit = checkRateLimit(`signboard-booking:${getClientIp(request)}`, {
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
    const validation = signboardBookingSchema.safeParse(body);
    if (!validation.success) {
      const errors: FieldErrors<SignboardBookingFormData> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field as keyof SignboardBookingFormData]) {
          errors[field as keyof SignboardBookingFormData] = issue.message;
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

    // 6) Save to Supabase signboard_bookings table
    try {
      const supabase = createSupabaseAdmin();
      const { error } = await supabase.from("signboard_bookings").insert({
        business_name: data.businessName,
        phone: null, // plain number is never stored
        phone_encrypted: phoneEncrypted,
        phone_hash: phoneHash,
        city: data.city || "Sivagangai",
        sign_type: data.signType || "3D LED Acrylic Letters",
        dimensions: data.dimensions || "10 ft x 3 ft",
        notes: data.notes || null,
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
          "⚠️ Supabase table 'signboard_bookings' does not exist yet. Please execute migration_signboard_bookings.sql in the Supabase Dashboard SQL Editor.",
        );
        return NextResponse.json<Reply>(
          {
            ok: false,
            message:
              "Database table 'signboard_bookings' does not exist yet. Please run migration_signboard_bookings.sql in your Supabase SQL Editor.",
          },
          { status: 503 },
        );
      }

      console.error("Saving signboard booking failed:", errorMsg);

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
      subject: `New Signboard Estimate Request: ${data.businessName} (${data.signType})`,
      lines: [
        "You have received a new site measurement and estimate request from Sivagangai Sign Board.",
        "",
        `Store / Business: ${data.businessName}`,
        `Contact Phone: ${maskPhone(data.phone)} (Full decrypted number available in Admin Dashboard)`,
        `Location / City: ${data.city || "Sivagangai"}`,
        `Signboard Type: ${data.signType || "3D LED Acrylic Letters"}`,
        `Approx. Dimensions: ${data.dimensions || "10 ft x 3 ft"}`,
        `Specific Notes: ${data.notes || "-"}`,
      ],
    });

    // 8) Return success to client (never returns phone number)
    return NextResponse.json<Reply>(
      { ok: true, message: SUCCESS_MESSAGE },
      { status: 201 },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Unhandled error in /api/signboard-booking:", errorMsg);
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
