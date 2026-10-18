// Loading skeleton for My Bookings (/account/bookings).

import React from "react";

export default function StaffBookingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="h-10 w-64 rounded-xl bg-muted" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="h-10 rounded-xl bg-muted sm:col-span-2" />
          <div className="h-10 rounded-xl bg-muted" />
          <div className="h-10 rounded-xl bg-muted" />
          <div className="h-10 rounded-xl bg-muted" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 w-full rounded-xl border border-border/50 bg-muted/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
