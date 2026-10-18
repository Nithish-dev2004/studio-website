// Staff Dashboard Overview (/account).
// Server Component that verifies active staff identity and loads
// only confirmed/completed bookings for the workspace overview.

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { requireStaffAccount } from "@/lib/admin/auth";
import { getStaffDashboardData } from "@/lib/account/queries";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

export const revalidate = 0;

export const metadata = {
  title: "Staff Dashboard | Sivagangai Stories",
  robots: { index: false, follow: false },
};

function formatDateHuman(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function StaffDashboardPage() {
  const profile = await requireStaffAccount({ allowChangePasswordPage: false });
  const dashboardData = await getStaffDashboardData();

  const todayHuman = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const staffName = profile.staffUser?.name || profile.user.email?.split("@")[0] || "Staff Member";

  return (
    <div className="space-y-6">
      {/* 1. Welcome Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Workspace Dashboard
              </span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {staffName}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Today is <strong className="font-medium text-foreground">{todayHuman}</strong>. Here is your confirmed studio schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span>Active Account</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards (Identical style to admin cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Confirmed Bookings */}
        <Link
          href="/account/bookings?status=confirmed"
          className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-accent/40"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Confirmed Bookings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-card-foreground">
              {dashboardData.confirmedCount}
            </span>
            <span className="text-xs text-success font-medium">Ready for shoot</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Total active confirmed sessions
          </p>
        </Link>

        {/* Upcoming in 7 Days */}
        <Link
          href="/account/bookings?status=confirmed"
          className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-accent/40"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Upcoming (7 Days)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-card-foreground">
              {dashboardData.upcoming7DaysCount}
            </span>
            <span className="text-xs text-accent font-medium">This week</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Scheduled in the next 7 days
          </p>
        </Link>

        {/* Completed Bookings */}
        <Link
          href="/account/bookings?status=completed"
          className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-accent/40"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed Bookings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-card-foreground">
              {dashboardData.completedCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">Delivered</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Finished & archived shoots
          </p>
        </Link>
      </div>

      {/* 3. Next 5 Upcoming Confirmed Bookings */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Upcoming Confirmed Bookings
            </h2>
            <p className="text-xs text-muted-foreground">
              Next scheduled shoots on the studio calendar
            </p>
          </div>

          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <span>View all bookings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {dashboardData.next5Upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 px-4 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No confirmed bookings yet
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              When the administrator approves and confirms a studio booking, it will appear here in your schedule.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dashboardData.next5Upcoming.map((b) => (
              <div
                key={b.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors hover:bg-muted/30 px-3 -mx-3 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {b.name}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {b.serviceTitle}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      <span>{formatDateHuman(b.event_date)}</span>
                    </span>
                    {b.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <span className="truncate max-w-[200px]">{b.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions for staff */}
                <div className="flex items-center gap-2 shrink-0">
                  {b.phone && b.phone !== "Not provided" && (
                    <>
                      <a
                        href={formatTelLink(b.phone)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        title={`Call ${b.phone}`}
                      >
                        <Phone className="h-3.5 w-3.5 text-accent" />
                        <span>Call</span>
                      </a>
                      <a
                        href={formatWhatsAppLink(
                          b.phone,
                          `Hi ${b.name}, Sivagangai Stories reaching out regarding your ${b.serviceTitle} on ${b.event_date}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-3 py-1.5 text-xs font-semibold text-whatsapp hover:bg-whatsapp/20"
                        title="Chat on WhatsApp"
                      >
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                  <Link
                    href={`/account/bookings`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span>Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
