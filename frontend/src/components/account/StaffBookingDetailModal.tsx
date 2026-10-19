"use client";

// Detail modal for a confirmed booking in the staff portal.
// Read-only: Displays client name, contact, service, event date, location, and message.
// Features quick action buttons: Call, WhatsApp, and Google Maps.
// Warm luxury aesthetic matching studio staff portal.

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
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";
import type { StaffBookingItem } from "@/lib/account/queries";

interface StaffBookingDetailModalProps {
  booking: StaffBookingItem | null;
  onClose: () => void;
}

function formatModalDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#ede5d8] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f2ece2] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="staff-booking-detail-title"
                className="text-xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Booking Information
              </h2>
              {booking.status === "confirmed" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-0.5 text-xs font-semibold text-[#1e7e45]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                  <span>Confirmed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5f0] bg-[#f0edf7] px-2.5 py-0.5 text-xs font-semibold text-[#6b4da8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6b4da8]" />
                  <span>Completed</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#7c756c]">
              Studio Assignment &bull; ID: {booking.id.slice(0, 8)}...
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[#8c8478] hover:bg-[#f5ede0] hover:text-[#1a1714] cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Client & Session Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Client Information */}
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#a87f32]" />
              Client Details
            </h3>
            <div>
              <p className="text-sm font-bold text-[#1a1714]">{booking.name}</p>
            </div>
            <div className="space-y-1.5 text-xs text-[#7c756c]">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#a87f32]" />
                <span className="font-mono text-[#1a1714] font-semibold">{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#a87f32]" />
              Session Details
            </h3>
            <div>
              <p className="text-sm font-bold text-[#1a1714]">{booking.serviceTitle}</p>
            </div>
            <div className="space-y-1.5 text-xs text-[#7c756c]">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#a87f32]" />
                <span>Event Date: <strong className="text-[#1a1714] font-semibold">{formatModalDate(booking.event_date)}</strong></span>
              </div>
              {booking.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#a87f32]" />
                  <span className="text-[#1a1714]">{booking.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Message / Notes */}
        <div className="mt-5 rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#a87f32]" />
            Client Message &amp; Shoot Notes
          </h3>
          <p className="mt-2 text-sm text-[#2d271f] whitespace-pre-wrap leading-relaxed">
            {booking.message || "No special shoot instructions or notes recorded."}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2ece2] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {booking.phone && booking.phone !== "Not provided" && (
              <>
                <a
                  href={formatTelLink(booking.phone)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfcf] bg-white px-3.5 py-2 text-xs font-semibold text-[#1a1714] hover:bg-[#f5ede0] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#a87f32]" />
                  <span>Call Client</span>
                </a>
                <a
                  href={formatWhatsAppLink(
                    booking.phone,
                    `Hello ${booking.name}, reaching out from Sivagangai Stories regarding your ${booking.serviceTitle} session on ${booking.event_date}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-3.5 py-2 text-xs font-semibold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfcf] bg-white px-3.5 py-2 text-xs font-semibold text-[#1a1714] hover:bg-[#f5ede0] transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-[#a87f32]" />
                <span>Open in Maps</span>
                <ExternalLink className="h-3 w-3 text-[#8c8478]" />
              </a>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs cursor-pointer border-[#e8dfcf] hover:bg-[#f5ede0]"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
