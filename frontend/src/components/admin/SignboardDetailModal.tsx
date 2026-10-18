"use client";

import React from "react";
import {
  Building2,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  X,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

export interface SignboardBookingItem {
  id: string;
  business_name: string;
  phone: string;
  city: string;
  sign_type: string;
  dimensions: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const signboardStatuses = [
  { value: "new", label: "New Request" },
  { value: "site_visit_scheduled", label: "Site Visit Scheduled" },
  { value: "measurement_done", label: "Measurement Done" },
  { value: "render_sent", label: "3D Render Sent" },
  { value: "approved", label: "Approved" },
  { value: "installed", label: "Installed" },
  { value: "closed", label: "Closed" },
];

interface SignboardDetailModalProps {
  booking: SignboardBookingItem | null;
  onClose: () => void;
  onStatusChangeClick: (booking: SignboardBookingItem, newStatus: string) => void;
  onDeleteClick: (booking: SignboardBookingItem) => void;
}

export default function SignboardDetailModal({
  booking,
  onClose,
  onStatusChangeClick,
  onDeleteClick,
}: SignboardDetailModalProps) {
  if (!booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signboard-detail-title"
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
              <h2 id="signboard-detail-title" className="text-xl font-bold text-card-foreground">
                Sign Board Order
              </h2>
              <StatusBadge status={booking.status} />
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

        {/* Client & Specs Info */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Business & Contact */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Client & Location
            </h3>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{booking.business_name}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              <span>{booking.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              <span>{booking.phone}</span>
            </div>

            {/* Quick Contact Buttons */}
            {booking.phone && booking.phone !== "[Encrypted]" && (
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={formatTelLink(booking.phone)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
                <a
                  href={formatWhatsAppLink(
                    booking.phone,
                    `Hello ${booking.business_name}, contacting you regarding your Sign Board inquiry (${booking.sign_type}) with Sivagangai Sign Board.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-whatsapp hover:text-whatsapp"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            )}
          </div>

          {/* Signboard Specifications */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              Signboard Specifications
            </h3>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Sign Type</span>
              <p className="text-sm font-semibold text-card-foreground">{booking.sign_type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5 text-accent" />
                Dimensions
              </span>
              <p className="text-sm font-semibold text-card-foreground">{booking.dimensions || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Submitted At
              </span>
              <p className="text-xs text-muted-foreground">
                {new Date(booking.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Client Notes / Requirements */}
        {booking.notes && (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Client Notes & Requirements
            </h3>
            <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Status Changer & Footer Actions */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="modal-signboard-status" className="text-xs font-semibold text-muted-foreground">
              Update Status:
            </label>
            <select
              id="modal-signboard-status"
              value={booking.status}
              onChange={(e) => onStatusChangeClick(booking, e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors focus:border-accent focus:outline-hidden"
            >
              {signboardStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onDeleteClick(booking)}
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              Delete Order
            </button>
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 px-4">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
