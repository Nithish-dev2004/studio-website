"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

export interface EventConsultationItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string;
  event_date: string | null;
  guest_count: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const eventStatuses = [
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

interface EventConsultationDetailModalProps {
  consultation: EventConsultationItem | null;
  hasConflict?: boolean;
  onClose: () => void;
  onStatusChangeClick: (consultation: EventConsultationItem, newStatus: string) => void;
  onDeleteClick: (consultation: EventConsultationItem) => void;
}

export default function EventConsultationDetailModal({
  consultation,
  hasConflict = false,
  onClose,
  onStatusChangeClick,
  onDeleteClick,
}: EventConsultationDetailModalProps) {
  if (!consultation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
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
              <h2 id="event-detail-title" className="text-xl font-bold text-card-foreground">
                Event Consultation
              </h2>
              <StatusBadge status={consultation.status} />
              {hasConflict && (
                <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Conflict Date
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">ID: {consultation.id}</p>
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

        {/* Client & Event Info */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Client Information */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Client Information
            </h3>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{consultation.name}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              <span>{consultation.phone}</span>
            </div>
            {consultation.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${consultation.email}`} className="hover:text-accent underline">
                  {consultation.email}
                </a>
              </div>
            )}

            {/* Quick Contact Buttons */}
            <div className="pt-2 flex flex-wrap gap-2">
              {consultation.phone && consultation.phone !== "[Encrypted]" && (
                <>
                  <a
                    href={formatTelLink(consultation.phone)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                  <a
                    href={formatWhatsAppLink(
                      consultation.phone,
                      `Hello ${consultation.name}, contacting you regarding your Event consultation inquiry for ${consultation.event_type} with Sivagangai Events.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-whatsapp hover:text-whatsapp"
                  >
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
              {consultation.email && (
                <a
                  href={`mailto:${consultation.email}?subject=Regarding your event inquiry with Sivagangai Events`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Event Details
            </h3>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Event Type</span>
              <p className="text-sm font-semibold text-card-foreground">{consultation.event_type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                Target Date
              </span>
              <p className="text-sm font-semibold text-card-foreground">
                {consultation.event_date
                  ? new Date(consultation.event_date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "Not decided yet"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Guest Count
              </span>
              <p className="text-xs font-semibold text-card-foreground">{consultation.guest_count || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Inquired On
              </span>
              <p className="text-xs text-muted-foreground">
                {new Date(consultation.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Client Notes */}
        {consultation.notes && (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Client Notes
            </h3>
            <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
              {consultation.notes}
            </p>
          </div>
        )}

        {/* Status Changer & Footer Actions */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="modal-event-status" className="text-xs font-semibold text-muted-foreground">
              Update Status:
            </label>
            <select
              id="modal-event-status"
              value={consultation.status}
              onChange={(e) => onStatusChangeClick(consultation, e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors focus:border-accent focus:outline-hidden"
            >
              {eventStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onDeleteClick(consultation)}
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              Delete Inquiry
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
