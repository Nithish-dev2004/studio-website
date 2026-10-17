// Sign Board Orders Management Page (/admin/signboard).
// Server Component that loads signboard bookings securely via service role key,
// decrypts phone numbers, and renders the interactive management table.

import React from "react";
import SignboardTable from "@/components/admin/SignboardTable";
import { SignboardBookingItem } from "@/components/admin/SignboardDetailModal";
import { resolvePhoneNumber } from "@/lib/admin/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminSignboardPage() {
  const supabase = createSupabaseAdmin();

  // Load all signboard bookings
  const { data: rawBookings, error } = await supabase
    .from("signboard_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load signboard bookings:", error.message);
  }

  // Decrypt phone numbers securely on the server
  const formattedBookings: SignboardBookingItem[] = (rawBookings || []).map((b) => ({
    id: b.id,
    business_name: b.business_name,
    phone: resolvePhoneNumber(b.phone_encrypted, b.phone),
    city: b.city || "Sivagangai",
    sign_type: b.sign_type || "3D LED Acrylic Letters",
    dimensions: b.dimensions || "10 ft x 3 ft",
    notes: b.notes || null,
    status: b.status || "new",
    created_at: b.created_at,
    updated_at: b.updated_at || b.created_at,
  }));

  return <SignboardTable initialBookings={formattedBookings} />;
}
