"use client";

import React from "react";
import {
  Building2,
  ChevronDown,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  Trash2,
  X,
} from "lucide-react";
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

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
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

      {/* Modal Dialog Card */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#ede5d8] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f2ece2] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="signboard-detail-title"
                className="text-xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Sign Board Order
              </h2>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${
                  booking.status === "approved" || booking.status === "installed"
                    ? "bg-[#e8f5ec] border border-[#c4e5ce] text-[#1e7e45]"
                    : booking.status === "site_visit_scheduled" || booking.status === "measurement_done" || booking.status === "render_sent"
                    ? "bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8]"
                    : booking.status === "closed"
                    ? "bg-[#f5f5f5] border border-[#e0e0e0] text-[#616161]"
                    : "bg-[#faeed6] border border-[#f5d9a8] text-[#b45309]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    booking.status === "approved" || booking.status === "installed"
                      ? "bg-[#1e7e45]"
                      : booking.status === "site_visit_scheduled" || booking.status === "measurement_done" || booking.status === "render_sent"
                      ? "bg-[#1a73e8]"
                      : booking.status === "closed"
                      ? "bg-[#616161]"
                      : "bg-[#b45309]"
                  }`}
                />
                <span>{booking.status.replace(/_/g, " ")}</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-[#7c756c] font-mono">ID: {booking.id}</p>
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

        {/* Client & Specs Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Business & Location */}
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#a87f32]" />
              Business &amp; Location
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                {getInitial(booking.business_name)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1f1b16] leading-tight">{booking.business_name}</p>
                <p className="text-xs text-[#8c8478] mt-0.5 font-mono">{booking.phone}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-[#5c5449] pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#8c734b]" />
                <span className="text-[#1f1b16] font-semibold">{booking.city}</span>
              </div>
            </div>
          </div>

          {/* Signboard Specifications */}
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#a87f32]" />
              Signboard Specifications
            </h3>
            <div>
              <p className="text-sm font-bold text-[#1f1b16]">{booking.sign_type}</p>
            </div>
            <div className="space-y-1.5 text-xs text-[#5c5449]">
              <div className="flex items-center gap-2">
                <Ruler className="h-3.5 w-3.5 text-[#8c734b]" />
                <span>
                  Dimensions: <strong className="font-mono text-[#1f1b16]">{booking.dimensions || "Not specified"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#8c734b]" />
                <span>Submitted: {new Date(booking.created_at).toLocaleString("en-IN", { dateStyle: "medium" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Notes */}
        {booking.notes && (
          <div className="mt-5 rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5 text-[#a87f32]" />
              Client Notes &amp; Requirements
            </h3>
            <p className="text-sm text-[#2d271f] whitespace-pre-wrap leading-relaxed">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#8c8478]">
          <span>Ordered: {new Date(booking.created_at).toLocaleString()}</span>
          <span>Last Updated: {new Date(booking.updated_at).toLocaleString()}</span>
        </div>

        {/* Quick Action Buttons & Status Selector */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2ece2] pt-4">
          {/* Contact Links */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.phone && (
              <>
                <a
                  href={formatTelLink(booking.phone)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3 py-2 text-xs font-medium text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                  <span>Call</span>
                </a>
                <a
                  href={formatWhatsAppLink(
                    booking.phone,
                    `Hello ${booking.business_name}, contacting you regarding your Sign Board inquiry (${booking.sign_type}) with Sivagangai Sign Board.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#c4e5ce] bg-[#e8f5ec] px-3 py-2 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}
          </div>

          {/* Change Status & Delete */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex items-center">
              <select
                value={booking.status}
                onChange={(e) => onStatusChangeClick(booking, e.target.value)}
                className={`appearance-none rounded-xl border px-3 py-1.5 pr-7 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden transition-all ${
                  booking.status === "approved" || booking.status === "installed"
                    ? "bg-[#e8f5ec] border-[#c4e5ce] text-[#1e7e45]"
                    : booking.status === "site_visit_scheduled" || booking.status === "measurement_done" || booking.status === "render_sent"
                    ? "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8]"
                    : booking.status === "closed"
                    ? "bg-[#f5f5f5] border-[#e0e0e0] text-[#616161]"
                    : "bg-[#faeed6] border-[#f5d9a8] text-[#b45309]"
                }`}
              >
                {signboardStatuses.map((s) => (
                  <option key={s.value} value={s.value} className="bg-white text-[#1a1714]">
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 h-3.5 w-3.5 shrink-0 ${
                  booking.status === "approved" || booking.status === "installed"
                    ? "text-[#1e7e45]"
                    : booking.status === "site_visit_scheduled" || booking.status === "measurement_done" || booking.status === "render_sent"
                    ? "text-[#1a73e8]"
                    : booking.status === "closed"
                    ? "text-[#616161]"
                    : "text-[#b45309]"
                }`}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => onDeleteClick(booking)}
              className="flex items-center gap-1.5 text-xs text-[#dc2626] border-[#fcd8d8] bg-white hover:bg-[#fdeeee] hover:border-[#fca5a5] cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
