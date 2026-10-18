"use client";

// Detail modal for a confirmed booking in the staff portal.
// Read-only: Displays client name, contact, service, event date, location, and message.
// Features quick action buttons: Call, WhatsApp, and Google Maps.
// Admin-only controls (status change, reassign, delete, audit logs) are never rendered.

import React from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  User,
  X,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";
import type { StaffBookingItem } from "@/lib/account/queries";

interface StaffBookingDetailModalProps {
  booking: StaffBookingItem | null;
  onClose: () => void;
}

export default function StaffBookingDetailModal({
  booking,
  onClose,
}: StaffBookingDetailModalProps) {
  if (!booking) return null;

  const mapsUrl = booking.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-booking-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="staff-booking-detail-title" className="text-xl font-bold text-card-foreground">
                Booking Information
              </h2>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Confirmed Assignment &bull; ID: {booking.id.slice(0, 8)}...
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Client & Session Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Client Information */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Client Details
            </h3>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{booking.name}</p>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-accent" />
                <span className="font-mono text-foreground font-semibold">{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Session Details
            </h3>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{booking.serviceTitle}</p>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>Event Date: <strong className="text-foreground">{booking.event_date}</strong></span>
              </div>
              {booking.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span className="text-foreground">{booking.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Message / Notes */}
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Client Message & Shoot Notes
          </h3>
          <p className="mt-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {booking.message || "No special shoot instructions or notes recorded."}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {booking.phone && booking.phone !== "Not provided" && (
              <>
                <a
                  href={formatTelLink(booking.phone)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  <span>Call Client</span>
                </a>
                <a
                  href={formatWhatsAppLink(
                    booking.phone,
                    `Hello ${booking.name}, reaching out from Sivagangai Stories regarding your ${booking.serviceTitle} session on ${booking.event_date}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-3.5 py-2 text-xs font-semibold text-whatsapp hover:bg-whatsapp/20"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span>Open in Maps</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
