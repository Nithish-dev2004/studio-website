// GET /api/admin/digital-bookings
// Admin-only route: returns list of digital marketing audit & booking requests.
//
// Security & Privacy Rules:
// 1. Protected by admin authentication (Bearer ADMIN_SECRET).
// 2. Returns MASKED phone numbers (e.g. 98XXXXX210) for list views.
//    Never exposes full decrypted phone numbers in list views.
// 3. Supports exact-match searching and duplicate detection by phone:
//    ?phone=9876543210 -> searches database using HMAC-SHA256 phone_hash.
// 4. Safe decryption: if any record has corrupted ciphertext, it returns
//    a safe placeholder without crashing or breaking the rest of the list.

import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth/admin";
import { hashPhone, maskPhone, tryDecryptPhone } from "@/lib/crypto/phone";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // 1) Verify Admin authorization
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Valid Admin Bearer token required." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const searchPhone = searchParams.get("phone");

  try {
    const supabase = createSupabaseAdmin();
    let query = supabase
      .from("digital_marketing_bookings")
      .select("id, business_name, email, service_interested, budget, website_url, plan, status, created_at, phone, phone_encrypted, phone_hash")
      .order("created_at", { ascending: false })
      .limit(100);

    // If searching by phone, use the HMAC-SHA256 blind index hash
    if (searchPhone && searchPhone.trim() !== "") {
      try {
        const targetHash = hashPhone(searchPhone);
        query = query.eq("phone_hash", targetHash);
      } catch {
        return NextResponse.json(
          { ok: false, message: "Invalid search phone number format." },
          { status: 400 },
        );
      }
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    // Map rows to safe list view with masked phone numbers
    const sanitizedBookings = (rows || []).map(
      (row: {
        id?: string;
        business_name?: string;
        email?: string | null;
        phone?: string | null;
        phone_encrypted?: string | null;
        service_interested?: string;
        budget?: string | null;
        website_url?: string | null;
        plan?: string | null;
        status?: string;
        created_at?: string;
      }) => {
        let phoneMasked = "[No phone recorded]";

        if (row.phone_encrypted) {
        const decrypted = tryDecryptPhone(row.phone_encrypted);
        if (decrypted.success) {
          phoneMasked = maskPhone(decrypted.phone);
        } else {
          phoneMasked = "[Encrypted - Decryption Failed]";
        }
      } else if (row.phone) {
        phoneMasked = maskPhone(row.phone);
      }

      return {
        id: row.id,
        business_name: row.business_name,
        email: row.email,
        phone_masked: phoneMasked,
        has_phone: Boolean(row.phone_encrypted || row.phone),
        service_interested: row.service_interested,
        budget: row.budget,
        website_url: row.website_url,
        plan: row.plan,
        status: row.status,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({
      ok: true,
      count: sanitizedBookings.length,
      bookings: sanitizedBookings,
    });
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Database query error";
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
      return NextResponse.json(
        {
          ok: false,
          message:
            "Database table 'digital_marketing_bookings' does not exist yet. Please run migration_digital_marketing_bookings.sql in your Supabase SQL Editor.",
        },
        { status: 503 },
      );
    }

    console.error("Admin list digital bookings failed:", errorMsg);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch digital marketing bookings." },
      { status: 500 },
    );
  }
}
