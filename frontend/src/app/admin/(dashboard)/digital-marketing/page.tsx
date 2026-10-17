// Digital Marketing Audits Page (/admin/digital-marketing).
// Server Component that loads digital marketing requests securely via service role key,
// decrypts phone numbers, and renders the interactive management table.

import React from "react";
import DigitalMarketingTable from "@/components/admin/DigitalMarketingTable";
import { DigitalMarketingBookingItem } from "@/components/admin/DigitalMarketingDetailModal";
import { resolvePhoneNumber } from "@/lib/admin/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminDigitalMarketingPage() {
  const supabase = createSupabaseAdmin();

  // Load all digital marketing bookings
  const { data: rawBookings, error } = await supabase
    .from("digital_marketing_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load digital marketing bookings:", error.message);
  }

  // Format and safely decrypt phone numbers on the server
  const formattedBookings: DigitalMarketingBookingItem[] = (rawBookings || []).map((b) => ({
    id: b.id,
    business_name: b.business_name,
    phone: resolvePhoneNumber(b.phone_encrypted, b.phone),
    email: b.email || null,
    service_interested: b.service_interested || "Meta & Google Paid Ads",
    budget: b.budget || null,
    website_url: b.website_url || null,
    plan: b.plan || "Free Marketing Audit",
    status: b.status || "new",
    created_at: b.created_at,
    updated_at: b.updated_at || b.created_at,
  }));

  return <DigitalMarketingTable initialBookings={formattedBookings} />;
}
