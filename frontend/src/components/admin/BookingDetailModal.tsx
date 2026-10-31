"use client";

import React from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

export interface AdminBookingItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  serviceTitle: string;
  event_date: string;
  location: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BookingDetailModalProps {
  booking: AdminBookingItem | null;
  hasConflict?: boolean;
  onClose: () => void;
  onStatusChangeClick: (booking: AdminBookingItem, newStatus: string) => void;
  onDeleteClick: (booking: AdminBookingItem) => void;
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatModalDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getRelativeDays(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return "";
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return "";
  } catch {
    return "";
  }
}

export default function BookingDetailModal({
  booking,
  hasConflict = false,
  onClose,
  onStatusChangeClick,
  onDeleteClick,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const relativeText = getRelativeDays(booking.event_date);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl text-card-foreground transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="booking-detail-title"
                className="text-lg sm:text-xl font-bold font-heading text-foreground"
              >
                Booking Details
              </h2>

              {/* Status pill */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${
                  booking.status === "confirmed"
                    ? "bg-success/15 border border-success/30 text-success"
                    : booking.status === "completed"
                    ? "bg-blue-500/15 border border-blue-500/30 text-blue-500"
                    : booking.status === "cancelled"
                    ? "bg-destructive/15 border border-destructive/30 text-destructive"
                    : "bg-accent/15 border border-accent/30 text-accent"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-success"
                      : booking.status === "completed"
                      ? "bg-blue-500"
                      : booking.status === "cancelled"
                      ? "bg-destructive"
                      : "bg-accent"
                  }`}
                />
                <span>{booking.status}</span>
              </span>

              {hasConflict && (
                <span className="rounded-full bg-destructive/15 border border-destructive/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Double Confirmed!
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              ID: {booking.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Client & Service Info */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Client Information */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-accent" />
              Client Information
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                {getInitial(booking.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{booking.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{booking.phone}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent" />
                <a href={`mailto:${booking.email}`} className="text-foreground hover:underline break-all">
                  {booking.email}
                </a>
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              Session Information
            </h3>
            <div>
              <p className="text-sm font-bold text-foreground">{booking.serviceTitle}</p>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">
                    {formatModalDate(booking.event_date)}
                  </span>
                  {relativeText && (
                    <span className="block text-[11px] font-semibold text-accent">
                      {relativeText}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-foreground">
                  {booking.location || "Studio / TBA"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message / Notes */}
        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-accent" />
            Client Message / Request Notes
          </h3>
          <p className="mt-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {booking.message || "No special requests or message provided by client."}
          </p>
        </div>

        {/* Timestamps */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>Submitted: {new Date(booking.created_at).toLocaleString()}</span>
          <span>Last Updated: {new Date(booking.updated_at).toLocaleString()}</span>
        </div>

        {/* Quick Action Buttons & Status Selector */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border pt-4">
          {/* Contact Links */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.phone !== "Not provided" && (
              <>
                <a
                  href={formatTelLink(booking.phone)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  <span>Call</span>
                </a>
                <a
                  href={formatWhatsAppLink(
                    booking.phone,
                    `Hello ${booking.name}, reaching out from Sivagangai Stories regarding your ${booking.serviceTitle} booking scheduled for ${booking.event_date}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-success/30 bg-success/15 px-3 py-2 text-xs font-bold text-success hover:bg-success/25 transition-colors cursor-pointer"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}
            <a
              href={`mailto:${booking.email}?subject=${encodeURIComponent(
                `Your ${booking.serviceTitle} session with Sivagangai Stories`,
              )}`}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>Email</span>
            </a>
          </div>

          {/* Change Status & Delete */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex items-center">
              <select
                value={booking.status}
                onChange={(e) => onStatusChangeClick(booking, e.target.value)}
                className="appearance-none rounded-xl border border-border bg-card px-3 py-2 pr-7 text-xs font-semibold capitalize text-foreground cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-accent transition-all min-h-[40px]"
              >
                <option value="pending" className="bg-card text-foreground">Pending</option>
                <option value="confirmed" className="bg-card text-foreground">Confirmed</option>
                <option value="completed" className="bg-card text-foreground">Completed</option>
                <option value="cancelled" className="bg-card text-foreground">Cancelled</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => onDeleteClick(booking)}
              className="flex min-h-[40px] items-center gap-1.5 text-xs text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
