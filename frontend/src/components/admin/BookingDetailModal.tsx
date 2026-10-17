"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  X,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
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

export default function BookingDetailModal({
  booking,
  hasConflict = false,
  onClose,
  onStatusChangeClick,
  onDeleteClick,
}: BookingDetailModalProps) {
  if (!booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
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
              <h2 id="booking-detail-title" className="text-xl font-bold text-card-foreground">
                Booking Details
              </h2>
              <StatusBadge status={booking.status} />
              {hasConflict && (
                <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Conflict Date
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">ID: {booking.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Client & Service Info */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Client Information */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Client Information
            </h3>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{booking.name}</p>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent" />
                <a href={`mailto:${booking.email}`} className="text-foreground hover:underline">
                  {booking.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-accent" />
                <span>{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Session Information
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
                  <span>{booking.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message / Notes */}
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
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

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {/* Contact Links */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.phone !== "Not provided" && (
              <>
                <a
                  href={formatTelLink(booking.phone)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-3 py-2 text-xs font-medium text-whatsapp hover:bg-whatsapp/20"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}
            <a
              href={`mailto:${booking.email}?subject=${encodeURIComponent(
                `Your ${booking.serviceTitle} session with Sivagangai Stories`,
              )}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>Email</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium">Change Status:</label>
            <select
              value={booking.status}
              onChange={(e) => onStatusChangeClick(booking, e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold capitalize text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDeleteClick(booking)}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              Delete Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
