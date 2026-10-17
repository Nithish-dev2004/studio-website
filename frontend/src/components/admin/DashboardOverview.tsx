"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarClock,
  CalendarDays,
  Layers,
  Mail,
  MapPin,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminToast } from "@/components/admin/AdminToastContext";
import { services } from "@/data/services";

export type TimeRange = "today" | "7d" | "30d";

export interface DashboardBookingItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  event_date: string;
  location?: string | null;
  message?: string | null;
  status: string;
  created_at: string;
}

export interface DashboardContactItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardEventConsultationItem {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  event_type: string;
  event_date?: string | null;
  status: string;
  created_at: string;
}

export interface DashboardSignboardBookingItem {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  sign_type: string;
  city: string;
  status: string;
  created_at: string;
}

export interface DashboardDigitalMarketingBookingItem {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  service_interested: string;
  plan?: string | null;
  status: string;
  created_at: string;
}

interface DashboardOverviewProps {
  bookings: DashboardBookingItem[];
  contacts: DashboardContactItem[];
  eventConsultations: DashboardEventConsultationItem[];
  signboardBookings: DashboardSignboardBookingItem[];
  digitalBookings: DashboardDigitalMarketingBookingItem[];
  initialTimestamp?: string;
}

function formatTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function DashboardOverview({
  bookings,
  contacts,
  eventConsultations,
  signboardBookings,
  digitalBookings,
  initialTimestamp = "",
}: DashboardOverviewProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();

  // Time Range Filter: "today" | "7d" | "30d" (default: "7d" matching reference)
  const [range, setRange] = useState<TimeRange>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    () => initialTimestamp || formatTime(new Date()),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setLastUpdated(formatTime(new Date()));
    showToast("Dashboard metrics refreshed.", "success");
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Helper map for friendly service names
  const serviceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    services.forEach((s) => map.set(s.slug, s.title));
    return map;
  }, []);

  // Compute timestamp boundary based on selected range
  const rangeThreshold = useMemo(() => {
    const now = new Date();
    if (range === "today") {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }
    if (range === "7d") {
      return now.getTime() - 7 * 24 * 60 * 60 * 1000;
    }
    // "30d"
    return now.getTime() - 30 * 24 * 60 * 60 * 1000;
  }, [range]);

  const rangeLabel = useMemo(() => {
    if (range === "today") return "Today";
    if (range === "7d") return "Last 7 days";
    return "Last 30 days";
  }, [range]);

  // Filter records created within selected range
  const filteredBookings = useMemo(
    () => bookings.filter((b) => new Date(b.created_at).getTime() >= rangeThreshold),
    [bookings, rangeThreshold],
  );

  const filteredContacts = useMemo(
    () => contacts.filter((c) => new Date(c.created_at).getTime() >= rangeThreshold),
    [contacts, rangeThreshold],
  );

  const filteredEvents = useMemo(
    () => eventConsultations.filter((e) => new Date(e.created_at).getTime() >= rangeThreshold),
    [eventConsultations, rangeThreshold],
  );

  const filteredSignboards = useMemo(
    () => signboardBookings.filter((s) => new Date(s.created_at).getTime() >= rangeThreshold),
    [signboardBookings, rangeThreshold],
  );

  const filteredDigital = useMemo(
    () => digitalBookings.filter((d) => new Date(d.created_at).getTime() >= rangeThreshold),
    [digitalBookings, rangeThreshold],
  );

  // Statistics
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const unreadMessagesCount = contacts.filter((c) => !c.is_read).length;
  const pendingEventsCount = eventConsultations.filter((e) => e.status === "pending").length;
  const activeSignboardCount = signboardBookings.filter(
    (s) => s.status !== "closed" && s.status !== "installed",
  ).length;
  const newAuditsCount = digitalBookings.filter(
    (d) => d.status === "new" || d.status === "audit_sent",
  ).length;

  // Upcoming studio bookings in the next 7 days
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next7DaysStr = next7Days.toISOString().slice(0, 10);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => b.event_date && b.event_date >= todayStr && b.event_date <= next7DaysStr)
      .sort((a, b) => (a.event_date > b.event_date ? 1 : -1));
  }, [bookings, todayStr, next7DaysStr]);

  // Confirmed date collisions on studio bookings
  const conflictingDates = useMemo(() => {
    const counts = new Map<string, number>();
    bookings
      .filter((b) => b.status === "confirmed" && b.event_date)
      .forEach((b) => {
        counts.set(b.event_date, (counts.get(b.event_date) || 0) + 1);
      });
    const conflicts = new Set<string>();
    counts.forEach((count, date) => {
      if (count > 1) conflicts.add(date);
    });
    return conflicts;
  }, [bookings]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Console Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-brand dashboard for Studio, Events, Sign Board, and Digital Marketing.
          </p>
        </div>

        {/* TOP RIGHT: Filter Section + Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Filter Pills */}
          <div
            role="group"
            aria-label="Filter by timeframe"
            className="inline-flex items-center rounded-2xl border border-border/60 bg-muted/50 p-1 shadow-xs"
          >
            <button
              type="button"
              onClick={() => setRange("today")}
              aria-pressed={range === "today"}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                range === "today"
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setRange("7d")}
              aria-pressed={range === "7d"}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                range === "7d"
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setRange("30d")}
              aria-pressed={range === "30d"}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                range === "30d"
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 30 days
            </button>
          </div>

          {/* Refresh Button with dynamic local timestamp */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh dashboard metrics"
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2 text-xs font-medium text-foreground shadow-xs transition-all hover:bg-muted/40 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                isRefreshing ? "animate-spin text-accent" : ""
              }`}
            />
            <span>{lastUpdated ? `Updated ${lastUpdated}` : "Updated just now"}</span>
          </button>
        </div>
      </div>

      {/* Date Conflict Warning Banner */}
      {conflictingDates.size > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold">Schedule Notice: Multiple Confirmed Studio Bookings</h3>
            <p className="mt-0.5 text-xs text-destructive/90">
              The following dates have more than one confirmed booking:{" "}
              <span className="font-bold underline">{Array.from(conflictingDates).join(", ")}</span>.
              Please verify photographer assignment.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Activity for <strong className="text-foreground">{rangeLabel}</strong>
          </span>
          <span className="text-[11px]">Click card to open table</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {/* Studio Bookings */}
          <Link
            href="/admin/bookings"
            className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-accent/40"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Studio Bookings</span>
              <CalendarDays className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-card-foreground">
                {filteredBookings.length}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {bookings.length} total
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">in {rangeLabel}</span>
              {pendingCount > 0 && (
                <span className="font-semibold text-accent">{pendingCount} pending</span>
              )}
            </div>
          </Link>

          {/* Event Consultations */}
          <Link
            href="/admin/events"
            className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-accent/40"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Event Inquiries</span>
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-card-foreground">
                {filteredEvents.length}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {eventConsultations.length} total
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">in {rangeLabel}</span>
              {pendingEventsCount > 0 && (
                <span className="font-semibold text-accent">{pendingEventsCount} new</span>
              )}
            </div>
          </Link>

          {/* Sign Board Orders */}
          <Link
            href="/admin/signboard"
            className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-accent/40"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Sign Board Orders</span>
              <Layers className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-card-foreground">
                {filteredSignboards.length}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {signboardBookings.length} total
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">in {rangeLabel}</span>
              <span className="text-muted-foreground">{activeSignboardCount} active</span>
            </div>
          </Link>

          {/* Digital Marketing */}
          <Link
            href="/admin/digital-marketing"
            className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-accent/40"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Marketing Audits</span>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-card-foreground">
                {filteredDigital.length}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {digitalBookings.length} total
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">in {rangeLabel}</span>
              {newAuditsCount > 0 && (
                <span className="font-semibold text-accent">{newAuditsCount} audits</span>
              )}
            </div>
          </Link>

          {/* Unread Inquiries */}
          <Link
            href="/admin/messages"
            className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-accent/40"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Messages Inbox</span>
              <Mail className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-card-foreground">
                {filteredContacts.length}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {contacts.length} total
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">in {rangeLabel}</span>
              {unreadMessagesCount > 0 && (
                <span className="rounded-full bg-accent/15 px-1.5 py-0.2 text-[10px] font-semibold text-accent">
                  {unreadMessagesCount} unread
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Brand Activity Sections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sign Board Orders Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold text-card-foreground">Sivagangai Sign Board</h2>
            </div>
            <Link
              href="/admin/signboard"
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View all ({signboardBookings.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/60">
            {filteredSignboards.length === 0 ? (
              signboardBookings.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No signboard orders yet.</p>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">No orders in {rangeLabel.toLowerCase()}.</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Showing latest all-time below:</p>
                  <div className="mt-3 divide-y divide-border/60 text-left">
                    {signboardBookings.slice(0, 3).map((s) => (
                      <div key={s.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                            {s.business_name}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{s.sign_type}</span>
                          <span>{s.city}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              filteredSignboards.slice(0, 4).map((s) => (
                <div key={s.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                      {s.business_name}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{s.sign_type}</span>
                    <span>{s.city}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Event Consultations Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold text-card-foreground">Sivagangai Events</h2>
            </div>
            <Link
              href="/admin/events"
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View all ({eventConsultations.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/60">
            {filteredEvents.length === 0 ? (
              eventConsultations.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No event consultations yet.</p>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">No inquiries in {rangeLabel.toLowerCase()}.</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Showing latest all-time below:</p>
                  <div className="mt-3 divide-y divide-border/60 text-left">
                    {eventConsultations.slice(0, 3).map((e) => (
                      <div key={e.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                            {e.name}
                          </span>
                          <StatusBadge status={e.status} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{e.event_type}</span>
                          <span>
                            {e.event_date
                              ? new Date(e.event_date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBD"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              filteredEvents.slice(0, 4).map((e) => (
                <div key={e.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                      {e.name}
                    </span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{e.event_type}</span>
                    <span>
                      {e.event_date
                        ? new Date(e.event_date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "TBD"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Digital Marketing Audits Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold text-card-foreground">Sivagangai Marketing</h2>
            </div>
            <Link
              href="/admin/digital-marketing"
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View all ({digitalBookings.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/60">
            {filteredDigital.length === 0 ? (
              digitalBookings.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No marketing requests yet.</p>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">No requests in {rangeLabel.toLowerCase()}.</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Showing latest all-time below:</p>
                  <div className="mt-3 divide-y divide-border/60 text-left">
                    {digitalBookings.slice(0, 3).map((d) => (
                      <div key={d.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                            {d.business_name}
                          </span>
                          <StatusBadge status={d.status} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="truncate max-w-[140px]">{d.service_interested}</span>
                          <span>{d.plan || "Free Audit"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              filteredDigital.slice(0, 4).map((d) => (
                <div key={d.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                      {d.business_name}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate max-w-[140px]">{d.service_interested}</span>
                    <span>{d.plan || "Free Audit"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Studio Bookings Section (Next 7 Days) */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-card-foreground sm:text-lg">
                Upcoming Studio Sessions (Next 7 Days)
              </h2>
              <p className="text-xs text-muted-foreground">
                Sessions scheduled between {todayStr} and {next7DaysStr}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {upcomingBookings.length} scheduled
          </span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium text-foreground">
              No studio bookings scheduled in the next 7 days
            </p>
            <p className="text-xs text-muted-foreground">
              New bookings will appear here automatically when clients submit the booking form.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-card-foreground text-sm">{b.name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{serviceNameMap.get(b.service) || b.service}</span>
                    {b.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {b.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="font-medium text-foreground">
                    {new Date(b.event_date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  <Link
                    href={`/admin/bookings?search=${encodeURIComponent(b.name)}`}
                    className="rounded-lg border border-border px-2.5 py-1 font-medium text-accent hover:border-accent"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Studio Bookings & Messages Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Studio Bookings */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-card-foreground">Recent Studio Bookings</h2>
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View all ({bookings.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/60">
            {filteredBookings.length === 0 ? (
              bookings.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No bookings recorded yet.</p>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">No bookings in {rangeLabel.toLowerCase()}.</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Showing latest all-time below:</p>
                  <div className="mt-3 divide-y divide-border/60 text-left">
                    {bookings.slice(0, 4).map((b) => (
                      <div key={b.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {serviceNameMap.get(b.service) || b.service} • {b.event_date}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              filteredBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {serviceNameMap.get(b.service) || b.service} • {b.event_date}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages Inbox */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-card-foreground">Recent Contact Inquiries</h2>
            <Link
              href="/admin/messages"
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View all ({contacts.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/60">
            {filteredContacts.length === 0 ? (
              contacts.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No messages received yet.</p>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">No messages in {rangeLabel.toLowerCase()}.</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Showing latest all-time below:</p>
                  <div className="mt-3 divide-y divide-border/60 text-left">
                    {contacts.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-start justify-between py-3">
                        <div className="space-y-0.5 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                            {!c.is_read && (
                              <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{c.message}</p>
                          <p className="text-[11px] text-muted-foreground/70">
                            {new Date(c.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Link
                          href={`/admin/messages?search=${encodeURIComponent(c.name)}`}
                          className="text-xs text-accent hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              filteredContacts.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-start justify-between py-3">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                      {!c.is_read && (
                        <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.message}</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/messages?search=${encodeURIComponent(c.name)}`}
                    className="text-xs text-accent hover:underline"
                  >
                    Open
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
