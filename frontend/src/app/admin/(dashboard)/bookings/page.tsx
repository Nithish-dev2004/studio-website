// Bookings Management Page (/admin/bookings).
// Server Component that loads bookings securely via the service role key,
// decrypts phone numbers, and renders the interactive management table.

import React from "react";
import BookingsTable from "@/components/admin/BookingsTable";
import { AdminBookingItem } from "@/components/admin/BookingDetailModal";
import { resolvePhoneNumber } from "@/lib/admin/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { services } from "@/data/services";

export const revalidate = 0;

export default async function AdminBookingsPage() {
  const supabase = createSupabaseAdmin();

  // Load all bookings
  const { data: rawBookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load bookings in admin:", error.message);
  }

  // Pre-index service titles
  const serviceMap = new Map<string, string>();
  services.forEach((s) => serviceMap.set(s.slug, s.title));

  // Format and safely decrypt phone numbers on the server
  const formattedBookings: AdminBookingItem[] = (rawBookings || []).map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    phone: resolvePhoneNumber(b.phone_encrypted, b.phone),
    service: b.service,
    serviceTitle: serviceMap.get(b.service) || b.service,
    event_date: b.event_date || "",
    location: b.location || null,
    message: b.message || null,
    status: b.status || "pending",
    created_at: b.created_at,
    updated_at: b.updated_at || b.created_at,
  }));

  const availableServices = services.map((s) => ({
    slug: s.slug,
    title: s.title,
  }));

  return (
    <BookingsTable
      initialBookings={formattedBookings}
      availableServices={availableServices}
    />
  );
}
