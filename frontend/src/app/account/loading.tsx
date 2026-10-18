// Loading skeleton for Staff Dashboard (/account).

import React from "react";

export default function StaffDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Card Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="h-4 w-32 rounded-md bg-muted" />
        <div className="h-8 w-64 rounded-md bg-muted" />
        <div className="h-4 w-96 rounded-md bg-muted" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 rounded-md bg-muted" />
              <div className="h-7 w-7 rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-16 rounded-md bg-muted" />
            <div className="h-3 w-36 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Upcoming Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="h-6 w-56 rounded-md bg-muted" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 w-full rounded-xl border border-border/50 bg-muted/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
