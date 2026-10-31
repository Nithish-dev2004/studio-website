// GET /api/admin/digital-bookings/[id]
// Admin-only route: returns single digital marketing booking with full decrypted phone number.
//
// Security & Privacy Rules:
// 1. Protected by admin authentication (Bearer ADMIN_SECRET).
// 2. This is the ONLY endpoint where the full decrypted phone number is returned.
// 3. Safe error handling: if decryption fails (tampered ciphertext or wrong key),
//    returns a safe error response without leaking keys or crashing.

import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth/admin";
import { decryptPhone, maskPhone } from "@/lib/crypto/phone";
import { createSupabaseAdmin } from "@/lib/supabase/server";

interface DigitalBookingRecord {
  id: string;
  business_name: string;
  email: string;
  phone?: string | null;
  phone_encrypted?: string | null;
  phone_hash?: string | null;
  service_interested?: string | null;
  budget?: string | null;
  website_url?: string | null;
  plan?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 1) Verify Admin authorization
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Valid Admin Bearer token required." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Missing booking ID." },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data: booking, error } = await supabase
      .from("digital_marketing_bookings")
      .select("id, business_name, email, service_interested, budget, website_url, plan, status, created_at, updated_at, phone, phone_encrypted, phone_hash")
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { ok: false, message: "Digital marketing booking not found." },
        { status: 404 },
      );
    }

    const b = booking as unknown as DigitalBookingRecord;
    let decryptedPhone: string | null = null;
    let maskedPhone: string | null = null;

    if (b.phone_encrypted) {
      try {
        decryptedPhone = decryptPhone(b.phone_encrypted);
        maskedPhone = maskPhone(decryptedPhone);
      } catch {
        // Safe error: do not crash server, return safe warning
        return NextResponse.json(
          {
            ok: false,
            message: "Decryption error: customer phone data could not be verified or decrypted.",
          },
          { status: 500 },
        );
      }
    } else if (b.phone) {
      decryptedPhone = b.phone;
      maskedPhone = maskPhone(b.phone);
    }

    return NextResponse.json({
      ok: true,
      booking: {
        id: b.id,
        business_name: b.business_name,
        email: b.email,
        phone: decryptedPhone, // Decrypted full number for detail page
        phone_masked: maskedPhone,
        service_interested: b.service_interested,
        budget: b.budget,
        website_url: b.website_url,
        plan: b.plan,
        status: b.status,
        created_at: b.created_at,
        updated_at: b.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Admin get digital booking details failed:",
      error instanceof Error ? error.message : "Database query error",
    );
    return NextResponse.json(
      { ok: false, message: "Failed to fetch digital booking details." },
      { status: 500 },
    );
  }
}
