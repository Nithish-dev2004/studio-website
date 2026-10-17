import React from "react";
import { cn } from "@/lib/utils";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "new"
  | "contacted"
  | "closed"
  | "site_visit_scheduled"
  | "measurement_done"
  | "render_sent"
  | "approved"
  | "installed"
  | "audit_sent"
  | "in_progress"
  | "converted"
  | "active"
  | "inactive";

const statusStyles: Record<string, { bg: string; dot: string; label: string }> = {
  // Staff & User statuses
  active: {
    bg: "bg-success/15 border-success/30 text-success",
    dot: "bg-success",
    label: "Active",
  },
  inactive: {
    bg: "bg-muted border-border text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Inactive",
  },

  // Studio & Event statuses
  pending: {
    bg: "bg-accent/15 border-accent/30 text-accent",
    dot: "bg-accent",
    label: "Pending",
  },
  confirmed: {
    bg: "bg-success/15 border-success/30 text-success",
    dot: "bg-success",
    label: "Confirmed",
  },
  completed: {
    bg: "bg-muted border-border text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-destructive/15 border-destructive/30 text-destructive",
    dot: "bg-destructive",
    label: "Cancelled",
  },

  // General / Initial
  new: {
    bg: "bg-accent/15 border-accent/30 text-accent",
    dot: "bg-accent",
    label: "New",
  },
  contacted: {
    bg: "bg-blue-500/15 border-blue-500/30 text-blue-500",
    dot: "bg-blue-500",
    label: "Contacted",
  },
  closed: {
    bg: "bg-muted border-border text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Closed",
  },

  // Sign Board specific statuses
  site_visit_scheduled: {
    bg: "bg-purple-500/15 border-purple-500/30 text-purple-500",
    dot: "bg-purple-500",
    label: "Site Visit Scheduled",
  },
  measurement_done: {
    bg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
    label: "Measurement Done",
  },
  render_sent: {
    bg: "bg-amber-500/15 border-amber-500/30 text-amber-500",
    dot: "bg-amber-500",
    label: "3D Render Sent",
  },
  approved: {
    bg: "bg-success/15 border-success/30 text-success",
    dot: "bg-success",
    label: "Approved",
  },
  installed: {
    bg: "bg-success/15 border-success/30 text-success",
    dot: "bg-success",
    label: "Installed",
  },

  // Digital Marketing specific statuses
  audit_sent: {
    bg: "bg-amber-500/15 border-amber-500/30 text-amber-500",
    dot: "bg-amber-500",
    label: "Audit Sent",
  },
  in_progress: {
    bg: "bg-blue-500/15 border-blue-500/30 text-blue-500",
    dot: "bg-blue-500",
    label: "In Progress",
  },
  converted: {
    bg: "bg-success/15 border-success/30 text-success",
    dot: "bg-success",
    label: "Converted",
  },
};

export default function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status ? status.toLowerCase() : "pending";
  const config = statusStyles[key] || {
    bg: "bg-muted border-border text-muted-foreground",
    dot: "bg-muted-foreground",
    label: status ? status.replace(/_/g, " ") : "Unknown",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide capitalize whitespace-nowrap",
        config.bg,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}
