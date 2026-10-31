"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Layers,
  Mail,
  MessageSquareHeart,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminToast } from "@/components/admin/AdminToastContext";
import { services } from "@/data/services";
import type { AdminFeedbackItem } from "@/types";


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
  feedback?: AdminFeedbackItem[];
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
  feedback = [],
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

  const filteredFeedback = useMemo(
    () => feedback.filter((f) => new Date(f.created_at).getTime() >= rangeThreshold),
    [feedback, rangeThreshold],
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
  const pendingFeedbackCount = feedback.filter((f) => f.status === "pending").length;
  const approvedFeedbackCount = feedback.filter((f) => f.status === "approved").length;



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

      {/* Date Conflict Warning Banner - optional */}


      {/* KPI Cards Grid - 5 stat cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span style={{ color: "var(--muted-foreground)" }}>
            Activity for{" "}
            <strong style={{ color: "var(--foreground)" }}>{rangeLabel}</strong>
          </span>
          <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Click a card to open its table
          </span>
        </div>

        {/* 5 main KPI cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Studio Bookings */}
          <Link
            href="/admin/bookings"
            className="group rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
              <span className="text-xs font-medium">Studio Bookings</span>
              <CalendarDays className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-bold" style={{ color: "var(--card-foreground)" }}>
                {filteredBookings.length}
              </span>
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              in {rangeLabel}
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {bookings.length} total
              </span>
              {pendingCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(184,146,58,0.15)", color: "var(--accent)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                  {pendingCount} pending
                </span>
              )}
            </div>
          </Link>

          {/* Event Inquiries */}
          <Link
            href="/admin/events"
            className="group rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
              <span className="text-xs font-medium">Event Inquiries</span>
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-bold" style={{ color: "var(--card-foreground)" }}>
                {filteredEvents.length}
              </span>
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              in {rangeLabel}
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {eventConsultations.length} total
              </span>
              {pendingEventsCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(184,146,58,0.15)", color: "var(--accent)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                  {pendingEventsCount} new
                </span>
              )}
            </div>
          </Link>

          {/* Sign Board Orders */}
          <Link
            href="/admin/signboard"
            className="group rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
              <span className="text-xs font-medium">Sign Board Orders</span>
              <Layers className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-bold" style={{ color: "var(--card-foreground)" }}>
                {filteredSignboards.length}
              </span>
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              in {rangeLabel}
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {signboardBookings.length} total
              </span>
              {activeSignboardCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(59,130,170,0.12)", color: "#3b82f6" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                  {activeSignboardCount} active
                </span>
              )}
            </div>
          </Link>

          {/* Marketing Audits */}
          <Link
            href="/admin/digital-marketing"
            className="group rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
              <span className="text-xs font-medium">Marketing Audits</span>
              <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-bold" style={{ color: "var(--card-foreground)" }}>
                {filteredDigital.length}
              </span>
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              in {rangeLabel}
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {digitalBookings.length} total
              </span>
              {newAuditsCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(184,146,58,0.15)", color: "var(--accent)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                  {newAuditsCount} audits
                </span>
              )}
            </div>
          </Link>

          {/* Messages Inbox */}
          <Link
            href="/admin/messages"
            className="group rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
              <span className="text-xs font-medium">Messages Inbox</span>
              <Mail className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-bold" style={{ color: "var(--card-foreground)" }}>
                {filteredContacts.length}
              </span>
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              in {rangeLabel}
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {contacts.length} total
              </span>
              {unreadMessagesCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                  {unreadMessagesCount} unread
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Client Reviews - standalone full-width card */}
        <Link
          href="/admin/feedback"
          className="group flex items-center justify-between rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
              <MessageSquareHeart className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              <span className="text-xs font-medium">Client Reviews</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: "var(--card-foreground)" }}>
                {filteredFeedback.length}
              </span>
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                in {rangeLabel}
              </span>
            </div>
            <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {feedback.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            {pendingFeedbackCount > 0 ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(184,146,58,0.15)", color: "var(--accent)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                {pendingFeedbackCount} pending
              </span>
            ) : (
              <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {approvedFeedbackCount} approved
              </span>
            )}
          </div>
        </Link>
      </div>


      {/* Latest by brand - 3 column grid */}
      <div>
        <h2
          className="mb-4 text-lg font-bold"
          style={{ color: "var(--card-foreground)", fontFamily: "var(--font-heading)" }}
        >
          Latest by brand
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Sign Board Orders Card */}
          <div
            className="rounded-2xl border p-5 shadow-xs"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ background: "rgba(184,146,58,0.15)" }}
                >
                  <Layers className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "var(--card-foreground)" }}>Sivagangai Sign Board</h3>
              </div>
              <Link
                href="/admin/signboard"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                <span>View all ({signboardBookings.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-4 divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              {filteredSignboards.length === 0 ? (
                signboardBookings.length === 0 ? (
                  <p className="py-6 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>No signboard orders yet.</p>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No orders in {rangeLabel.toLowerCase()}.</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>Showing latest all-time below:</p>
                    <div className="mt-3 divide-y text-left" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                      {signboardBookings.slice(0, 3).map((s) => (
                        <div key={s.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: "var(--foreground)" }}>{s.business_name}</span>
                            <StatusBadge status={s.status} />
                          </div>
                          <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
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
                      <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: "var(--foreground)" }}>{s.business_name}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <span>{s.sign_type}</span>
                      <span>{s.city}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event Consultations Card */}
          <div
            className="rounded-2xl border p-5 shadow-xs"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ background: "rgba(184,146,58,0.15)" }}
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "var(--card-foreground)" }}>Sivagangai Events</h3>
              </div>
              <Link
                href="/admin/events"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                <span>View all ({eventConsultations.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              {filteredEvents.length === 0 ? (
                eventConsultations.length === 0 ? (
                  <p className="py-6 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>No event consultations yet.</p>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No inquiries in {rangeLabel.toLowerCase()}.</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>Showing latest all-time below:</p>
                    <div className="mt-3 divide-y text-left" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                      {eventConsultations.slice(0, 3).map((e) => (
                        <div key={e.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: "var(--foreground)" }}>{e.name}</span>
                            <StatusBadge status={e.status} />
                          </div>
                          <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                            <span>{e.event_type}</span>
                            <span>{e.event_date ? new Date(e.event_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBD"}</span>
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
                      <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: "var(--foreground)" }}>{e.name}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <span>{e.event_type}</span>
                      <span>{e.event_date ? new Date(e.event_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBD"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Digital Marketing Audits Card */}
          <div
            className="rounded-2xl border p-5 shadow-xs"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ background: "rgba(184,146,58,0.15)" }}
                >
                  <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "var(--card-foreground)" }}>Sivagangai Marketing</h3>
              </div>
              <Link
                href="/admin/digital-marketing"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                <span>View all ({digitalBookings.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              {filteredDigital.length === 0 ? (
                digitalBookings.length === 0 ? (
                  <p className="py-6 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>No marketing requests yet.</p>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No requests in {rangeLabel.toLowerCase()}.</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>Showing latest all-time below:</p>
                    <div className="mt-3 divide-y text-left" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                      {digitalBookings.slice(0, 3).map((d) => (
                        <div key={d.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: "var(--foreground)" }}>{d.business_name}</span>
                            <StatusBadge status={d.status} />
                          </div>
                          <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                            <span className="truncate max-w-[130px]">{d.service_interested}</span>
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
                      <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: "var(--foreground)" }}>{d.business_name}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <span className="truncate max-w-[130px]">{d.service_interested}</span>
                      <span>{d.plan || "Free Audit"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
