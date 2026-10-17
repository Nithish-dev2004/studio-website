// Administrator Overview Dashboard (/admin).
// Fetches records across all 5 tables from Supabase and passes to DashboardOverview.

import React from "react";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { createSupabaseAdmin } from "@/lib/supabase/server";

// Revalidate dashboard data on action or reload
export const revalidate = 0;

function formatTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default async function AdminDashboardPage() {
  const supabase = createSupabaseAdmin();

  // Fetch records from all tables in parallel
  const [bookingsRes, contactsRes, eventsRes, signboardRes, digitalRes] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("contacts").select("*").order("created_at", { ascending: false }),
    supabase.from("event_consultations").select("*").order("created_at", { ascending: false }),
    supabase.from("signboard_bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("digital_marketing_bookings").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardOverview
      bookings={bookingsRes.data || []}
      contacts={contactsRes.data || []}
      eventConsultations={eventsRes.data || []}
      signboardBookings={signboardRes.data || []}
      digitalBookings={digitalRes.data || []}
      initialTimestamp={formatTime(new Date())}
    />
  );
}
