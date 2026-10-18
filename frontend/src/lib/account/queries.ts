// Server-side data fetching for the Staff Portal (/account).
// Security Guarantees:
// 1. Strictly server-only: service role key never exposed to client.
// 2. Data boundary: ONLY confirmed and completed bookings are retrieved.
// 3. Pending and cancelled bookings, client messages, audit logs, and other staff
//    members' salaries/details are strictly excluded from all queries.

import "server-only";
import { services } from "@/data/services";
import { resolvePhoneNumber } from "@/lib/admin/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export interface StaffBookingItem {
  id: string;
  name: string;
  phone: string;
  service: string;
  serviceTitle: string;
  event_date: string;
  location: string | null;
  message: string | null;
  status: "confirmed" | "completed";
  created_at: string;
}

export interface StaffDashboardData {
  confirmedCount: number;
  upcoming7DaysCount: number;
  completedCount: number;
  next5Upcoming: StaffBookingItem[];
}

// Pre-index service titles
const serviceMap = new Map<string, string>();
services.forEach((s) => serviceMap.set(s.slug, s.title));

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getIn7DaysString(): string {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Fetches dashboard summary counts and the next 5 upcoming confirmed bookings.
 * Server filters strictly for status IN ('confirmed', 'completed').
 */
export async function getStaffDashboardData(): Promise<StaffDashboardData> {
  const supabase = createSupabaseAdmin();
  const today = getTodayString();
  const in7Days = getIn7DaysString();

  // Query only confirmed and completed bookings
  const { data: rawBookings, error } = await supabase
    .from("bookings")
    .select("id, name, phone, phone_encrypted, service, event_date, location, message, status, created_at")
    .in("status", ["confirmed", "completed"])
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch bookings for staff dashboard:", error.message);
    return {
      confirmedCount: 0,
      upcoming7DaysCount: 0,
      completedCount: 0,
      next5Upcoming: [],
    };
  }

  const items = (rawBookings || []).map((b) => ({
    id: b.id,
    name: b.name,
    phone: resolvePhoneNumber(b.phone_encrypted, b.phone),
    service: b.service,
    serviceTitle: serviceMap.get(b.service) || b.service,
    event_date: b.event_date || "",
    location: b.location || null,
    message: b.message || null,
    status: (b.status === "completed" ? "completed" : "confirmed") as "confirmed" | "completed",
    created_at: b.created_at,
  }));

  const confirmedBookings = items.filter((b) => b.status === "confirmed");
  const completedCount = items.filter((b) => b.status === "completed").length;
  const confirmedCount = confirmedBookings.length;

  const upcoming7DaysCount = confirmedBookings.filter(
    (b) => b.event_date >= today && b.event_date <= in7Days,
  ).length;

  // Next 5 upcoming confirmed bookings starting from today (or upcoming dates)
  const upcomingConfirmed = confirmedBookings.filter((b) => b.event_date >= today);
  // If fewer than 5 upcoming from today, take next ones or fallback to most recent confirmed
  const next5Upcoming = (
    upcomingConfirmed.length > 0 ? upcomingConfirmed : confirmedBookings
  ).slice(0, 5);

  return {
    confirmedCount,
    upcoming7DaysCount,
    completedCount,
    next5Upcoming,
  };
}

/**
 * Fetches all confirmed and completed bookings for the staff My Bookings table.
 * Read-only, no pending or cancelled bookings are ever returned.
 */
export async function getStaffBookings(): Promise<StaffBookingItem[]> {
  const supabase = createSupabaseAdmin();

  const { data: rawBookings, error } = await supabase
    .from("bookings")
    .select("id, name, phone, phone_encrypted, service, event_date, location, message, status, created_at")
    .in("status", ["confirmed", "completed"])
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Failed to load staff bookings:", error.message);
    return [];
  }

  return (rawBookings || []).map((b) => ({
    id: b.id,
    name: b.name,
    phone: resolvePhoneNumber(b.phone_encrypted, b.phone),
    service: b.service,
    serviceTitle: serviceMap.get(b.service) || b.service,
    event_date: b.event_date || "",
    location: b.location || null,
    message: b.message || null,
    status: (b.status === "completed" ? "completed" : "confirmed") as "confirmed" | "completed",
    created_at: b.created_at,
  }));
}
