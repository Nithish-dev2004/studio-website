// GET /api/admin/signboard-bookings/[id]
// Admin-only route: returns single signboard booking with full decrypted phone number.
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
      .from("signboard_bookings")
      .select("id, business_name, city, sign_type, dimensions, notes, status, created_at, updated_at, phone, phone_encrypted, phone_hash")
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { ok: false, message: "Signboard booking not found." },
        { status: 404 },
      );
    }

    const b = booking as Record<string, any>;
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
        phone: decryptedPhone, // Decrypted full number for detail page
        phone_masked: maskedPhone,
        city: b.city,
        sign_type: b.sign_type,
        dimensions: b.dimensions,
        notes: b.notes,
        status: b.status,
        created_at: b.created_at,
        updated_at: b.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Admin get signboard booking details failed:",
      error instanceof Error ? error.message : "Database query error",
    );
    return NextResponse.json(
      { ok: false, message: "Failed to fetch signboard booking details." },
      { status: 500 },
    );
  }
}
