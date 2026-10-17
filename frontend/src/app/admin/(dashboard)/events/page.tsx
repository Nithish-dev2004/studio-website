// Event Consultations Management Page (/admin/events).
// Server Component that loads event consultations securely via service role key,
// decrypts phone numbers, and renders the interactive management table.

import React from "react";
import EventConsultationsTable from "@/components/admin/EventConsultationsTable";
import { EventConsultationItem } from "@/components/admin/EventConsultationDetailModal";
import { resolvePhoneNumber } from "@/lib/admin/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminEventsPage() {
  const supabase = createSupabaseAdmin();

  // Load all event consultations
  const { data: rawConsultations, error } = await supabase
    .from("event_consultations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load event consultations:", error.message);
  }

  // Format and safely decrypt phone numbers on the server
  const formattedConsultations: EventConsultationItem[] = (rawConsultations || []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: resolvePhoneNumber(c.phone_encrypted, c.phone),
    email: c.email || null,
    event_type: c.event_type,
    event_date: c.event_date || null,
    guest_count: c.guest_count || null,
    notes: c.notes || null,
    status: c.status || "pending",
    created_at: c.created_at,
    updated_at: c.updated_at || c.created_at,
  }));

  return <EventConsultationsTable initialConsultations={formattedConsultations} />;
}
