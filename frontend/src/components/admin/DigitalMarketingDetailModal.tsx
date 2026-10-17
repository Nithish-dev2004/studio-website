"use client";

import React from "react";
import {
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

export interface DigitalMarketingBookingItem {
  id: string;
  business_name: string;
  phone: string;
  email: string | null;
  service_interested: string;
  budget: string | null;
  website_url: string | null;
  plan: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const digitalStatuses = [
  { value: "new", label: "New Request" },
  { value: "contacted", label: "Contacted" },
  { value: "audit_sent", label: "Audit Sent" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted Client" },
  { value: "closed", label: "Closed" },
];

interface DigitalMarketingDetailModalProps {
  booking: DigitalMarketingBookingItem | null;
  onClose: () => void;
  onStatusChangeClick: (booking: DigitalMarketingBookingItem, newStatus: string) => void;
  onDeleteClick: (booking: DigitalMarketingBookingItem) => void;
}

export default function DigitalMarketingDetailModal({
  booking,
  onClose,
  onStatusChangeClick,
  onDeleteClick,
}: DigitalMarketingDetailModalProps) {
  if (!booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="digital-detail-title"
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
              <h2 id="digital-detail-title" className="text-xl font-bold text-card-foreground">
                Digital Marketing Audit
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

        {/* Client & Marketing Info */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Client & Contact */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Business & Contact
            </h3>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{booking.business_name}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              <span>{booking.phone}</span>
            </div>
            {booking.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${booking.email}`} className="hover:text-accent underline">
                  {booking.email}
                </a>
              </div>
            )}

            {/* Quick Contact Buttons */}
            <div className="pt-2 flex flex-wrap gap-2">
              {booking.phone && booking.phone !== "[Encrypted]" && (
                <>
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
                      `Hello ${booking.business_name}, contacting you regarding your Marketing Audit request with Sivagangai Digital Marketing.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-whatsapp hover:text-whatsapp"
                  >
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
              {booking.email && (
                <a
                  href={`mailto:${booking.email}?subject=Regarding your digital marketing audit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              )}
            </div>
          </div>

          {/* Strategy & Budget */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Campaign Details
            </h3>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Service Focus</span>
              <p className="text-sm font-semibold text-card-foreground">{booking.service_interested}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-accent" />
                Plan
              </span>
              <p className="text-xs font-semibold text-card-foreground">{booking.plan || "Free Marketing Audit"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                Budget
              </span>
              <p className="text-xs font-semibold text-card-foreground">{booking.budget || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Submitted On
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

        {/* Website URL */}
        {booking.website_url && (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <Globe className="h-3.5 w-3.5" />
              Website to Audit
            </h3>
            <a
              href={booking.website_url.startsWith("http") ? booking.website_url : `https://${booking.website_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent underline hover:opacity-80"
            >
              <span>{booking.website_url}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Status Changer & Footer Actions */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="modal-digital-status" className="text-xs font-semibold text-muted-foreground">
              Update Status:
            </label>
            <select
              id="modal-digital-status"
              value={booking.status}
              onChange={(e) => onStatusChangeClick(booking, e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors focus:border-accent focus:outline-hidden"
            >
              {digitalStatuses.map((s) => (
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
              Delete Request
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
