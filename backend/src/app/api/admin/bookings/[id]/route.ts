// GET /api/admin/bookings/[id]
// Admin-only route: returns single booking details with full decrypted phone number.
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
      .from("bookings")
      .select("id, name, email, service, event_date, location, message, status, created_at, updated_at, phone, phone_encrypted, phone_hash")
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { ok: false, message: "Booking not found." },
        { status: 404 },
      );
    }

    const b = booking as { phone_encrypted?: string | null; phone?: string | null };
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
      // Legacy unmigrated record fallback
      decryptedPhone = b.phone;
      maskedPhone = maskPhone(b.phone);
    }

    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: decryptedPhone, // Decrypted full number for details page
        phone_masked: maskedPhone,
        service: booking.service,
        event_date: booking.event_date,
        location: booking.location,
        message: booking.message,
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Admin get booking details failed:",
      error instanceof Error ? error.message : "Database query error",
    );
    return NextResponse.json(
      { ok: false, message: "Failed to fetch booking details." },
      { status: 500 },
    );
  }
}
