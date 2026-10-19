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
                id="booking-detail-title"
                className="text-xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Booking Details
              </h2>

              {/* Status pill */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${
                  booking.status === "confirmed"
                    ? "bg-[#e8f5ec] border border-[#c4e5ce] text-[#1e7e45]"
                    : booking.status === "completed"
                    ? "bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8]"
                    : booking.status === "cancelled"
                    ? "bg-[#fdeeee] border border-[#f0c8c8] text-[#c53030]"
                    : "bg-[#faeed6] border border-[#f5d9a8] text-[#b45309]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-[#1e7e45]"
                      : booking.status === "completed"
                      ? "bg-[#1a73e8]"
                      : booking.status === "cancelled"
                      ? "bg-[#c53030]"
                      : "bg-[#b45309]"
                  }`}
                />
                <span>{booking.status}</span>
              </span>

              {hasConflict && (
                <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                  Double Confirmed!
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#7c756c] font-mono">
              ID: {booking.id}
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

        {/* Client & Service Info */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Client Information */}
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#a87f32]" />
              Client Information
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                {getInitial(booking.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1f1b16] leading-tight">{booking.name}</p>
                <p className="text-xs text-[#8c8478] mt-0.5 font-mono">{booking.phone}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-[#5c5449] pt-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
                <a href={`mailto:${booking.email}`} className="text-[#1f1b16] hover:underline">
                  {booking.email}
                </a>
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#a87f32]" />
              Session Information
            </h3>
            <div>
              <p className="text-sm font-bold text-[#1f1b16]">{booking.serviceTitle}</p>
            </div>
            <div className="space-y-1.5 text-xs text-[#5c5449]">
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-[#8c734b] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1f1b16]">
                    {formatModalDate(booking.event_date)}
                  </span>
                  {relativeText && (
                    <span className="block text-[11px] font-semibold text-[#b45309]">
                      {relativeText}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#8c734b] shrink-0" />
                <span className="text-[#1f1b16]">
                  {booking.location || "Studio / TBA"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message / Notes */}
        <div className="mt-5 rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#a87f32]" />
            Client Message / Request Notes
          </h3>
          <p className="mt-2 text-sm text-[#2d271f] whitespace-pre-wrap leading-relaxed">
            {booking.message || "No special requests or message provided by client."}
          </p>
        </div>

        {/* Timestamps */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#8c8478]">
          <span>Submitted: {new Date(booking.created_at).toLocaleString()}</span>
          <span>Last Updated: {new Date(booking.updated_at).toLocaleString()}</span>
        </div>

        {/* Quick Action Buttons & Status Selector */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2ece2] pt-4">
          {/* Contact Links */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.phone !== "Not provided" && (
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
                    `Hello ${booking.name}, reaching out from Sivagangai Stories regarding your ${booking.serviceTitle} booking scheduled for ${booking.event_date}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#c4e5ce] bg-[#e8f5ec] px-3 py-2 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}
            <a
              href={`mailto:${booking.email}?subject=${encodeURIComponent(
                `Your ${booking.serviceTitle} session with Sivagangai Stories`,
              )}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3 py-2 text-xs font-medium text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
              <span>Email</span>
            </a>
          </div>

          {/* Change Status & Delete */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex items-center">
              <select
                value={booking.status}
                onChange={(e) => onStatusChangeClick(booking, e.target.value)}
                className={`appearance-none rounded-xl border px-3 py-1.5 pr-7 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden transition-all ${
                  booking.status === "confirmed"
                    ? "bg-[#e8f5ec] border-[#c4e5ce] text-[#1e7e45]"
                    : booking.status === "completed"
                    ? "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8]"
                    : booking.status === "cancelled"
                    ? "bg-[#fdeeee] border-[#f0c8c8] text-[#c53030]"
                    : "bg-[#faeed6] border-[#f5d9a8] text-[#b45309]"
                }`}
              >
                <option value="pending" className="bg-white text-[#a0521e]">Pending</option>
                <option value="confirmed" className="bg-white text-[#1e7e45]">Confirmed</option>
                <option value="completed" className="bg-white text-[#1a73e8]">Completed</option>
                <option value="cancelled" className="bg-white text-[#c53030]">Cancelled</option>
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 h-3.5 w-3.5 shrink-0 ${
                  booking.status === "confirmed"
                    ? "text-[#1e7e45]"
                    : booking.status === "completed"
                    ? "text-[#1a73e8]"
                    : booking.status === "cancelled"
                    ? "text-[#c53030]"
                    : "text-[#a0521e]"
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
