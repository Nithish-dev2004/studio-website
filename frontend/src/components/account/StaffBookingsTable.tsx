"use client";

// StaffBookingsTable: Interactive, read-only table for staff to view confirmed bookings.
// Redesigned with warm luxury editorial aesthetic matching studio branding.
// Features search, filtering (status, service, date range), sorting, pagination,
// quick actions (Call, WA, Google Maps), and detail modal.

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Phone,
  Search,
  X,
} from "lucide-react";
import StaffBookingDetailModal from "./StaffBookingDetailModal";
import TablePagination from "@/components/admin/TablePagination";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";
import type { StaffBookingItem } from "@/lib/account/queries";

interface StaffBookingsTableProps {
  initialBookings: StaffBookingItem[];
  availableServices: { slug: string; title: string }[];
  roleLabel?: string;
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
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

export default function StaffBookingsTable({
  initialBookings,
  availableServices,
  roleLabel = "PHOTOGRAPHER",
}: StaffBookingsTableProps) {
  const [bookings] = useState<StaffBookingItem[]>(initialBookings);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"confirmed" | "completed" | "all">("confirmed");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"event_asc" | "event_desc" | "created_desc">("event_asc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal state
  const [selectedBooking, setSelectedBooking] = useState<StaffBookingItem | null>(null);

  // Filter and sort records
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((item) => {
        // Text search across name, phone, location, message, and service
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            item.name.toLowerCase().includes(q) ||
            item.phone.toLowerCase().includes(q) ||
            item.serviceTitle.toLowerCase().includes(q) ||
            (item.location && item.location.toLowerCase().includes(q)) ||
            (item.message && item.message.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Status filter (confirmed / completed / all)
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }

        // Service filter
        if (selectedService !== "all" && item.service !== selectedService) {
          return false;
        }

        // Date range filter
        if (startDate && item.event_date < startDate) {
          return false;
        }
        if (endDate && item.event_date > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "event_asc") return a.event_date.localeCompare(b.event_date);
        if (sortBy === "event_desc") return b.event_date.localeCompare(a.event_date);
        if (sortBy === "created_desc") return b.created_at.localeCompare(a.created_at);
        return 0;
      });
  }, [bookings, searchQuery, selectedStatus, selectedService, startDate, endDate, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Reset filters
  const handleFilterReset = () => {
    setSearchQuery("");
    setSelectedStatus("confirmed");
    setSelectedService("all");
    setStartDate("");
    setEndDate("");
    setSortBy("event_asc");
    setCurrentPage(1);
  };

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Status Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#a87f32]">
            {roleLabel}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1714] mt-0.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            My Bookings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            Confirmed client shoots and assignments scheduled by studio administration.
          </p>
        </div>

        {/* Status Filter Tabs (Pill Switcher) */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfcf] bg-[#f4ede2] p-1 text-xs self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("confirmed");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-semibold transition-all cursor-pointer ${
              selectedStatus === "confirmed"
                ? "bg-[#7a5b28] text-white shadow-xs"
                : "text-[#7c756c] hover:text-[#1a1714]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirmed ({confirmedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus("completed");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-semibold transition-all cursor-pointer ${
              selectedStatus === "completed"
                ? "bg-[#7a5b28] text-white shadow-xs"
                : "text-[#7c756c] hover:text-[#1a1714]"
            }`}
          >
            <span>Completed ({completedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus("all");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-semibold transition-all cursor-pointer ${
              selectedStatus === "all"
                ? "bg-[#7a5b28] text-white shadow-xs"
                : "text-[#7c756c] hover:text-[#1a1714]"
            }`}
          >
            <span>All ({bookings.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="rounded-2xl border border-[#ede5d8] dark:border-border bg-white dark:bg-card p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e968b] dark:text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client name, phone, location..."
              className="w-full rounded-xl border border-[#e8dfcf] dark:border-border bg-[#fcfaf7] dark:bg-muted/30 py-2.5 pl-10 pr-9 text-xs text-[#1a1714] dark:text-foreground placeholder:text-[#9e968b] dark:placeholder:text-muted-foreground focus:border-[#a87f32] focus:bg-white dark:focus:bg-card focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e968b] hover:text-[#1a1714] dark:hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] dark:border-border bg-[#fcfaf7] dark:bg-card px-3.5 py-2.5 text-xs font-medium text-[#1a1714] dark:text-foreground focus:border-[#a87f32] focus:bg-white dark:focus:bg-card focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="all">All Services</option>
              {availableServices.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Start date"
              className="w-full rounded-xl border border-[#e8dfcf] dark:border-border bg-[#fcfaf7] dark:bg-card px-3.5 py-2.5 text-xs text-[#1a1714] dark:text-foreground focus:border-[#a87f32] focus:bg-white dark:focus:bg-card focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            />
          </div>

          {/* Date Range: To */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="End date"
              className="w-full rounded-xl border border-[#e8dfcf] dark:border-border bg-[#fcfaf7] dark:bg-card px-3.5 py-2.5 text-xs text-[#1a1714] dark:text-foreground focus:border-[#a87f32] focus:bg-white dark:focus:bg-card focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Sort & Count Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f2ece2] dark:border-border pt-3 text-xs text-[#8c8478] dark:text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "event_asc" | "event_desc" | "created_desc")}
              className="rounded-lg border border-[#e8dfcf] dark:border-border bg-[#fcfaf7] dark:bg-card px-2.5 py-1 text-xs font-semibold text-[#2d271f] dark:text-foreground focus:border-[#a87f32] focus:outline-hidden cursor-pointer"
            >
              <option value="event_asc">Event Date (Upcoming First)</option>
              <option value="event_desc">Event Date (Furthest First)</option>
              <option value="created_desc">Recently Booked</option>
            </select>

            {(searchQuery || selectedService !== "all" || startDate || endDate || selectedStatus !== "confirmed") && (
              <button
                type="button"
                onClick={handleFilterReset}
                className="ml-2 text-xs font-semibold text-[#a87f32] dark:text-accent hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="text-xs text-[#8c8478] dark:text-muted-foreground font-medium">
            Showing <strong className="text-[#1a1714] dark:text-foreground font-semibold">{filteredBookings.length}</strong> {filteredBookings.length === 1 ? "booking" : "bookings"}
          </div>
        </div>
      </div>

      {/* 3. Table / Bookings List Card */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfcf] dark:border-border bg-white dark:bg-card p-12 text-center shadow-xs">
          <Calendar className="mx-auto h-10 w-10 text-[#8c8478]/40 dark:text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-semibold text-[#1a1714] dark:text-foreground">
            No confirmed bookings yet
          </h3>
          <p className="mt-1 text-xs text-[#7c756c] dark:text-muted-foreground max-w-sm mx-auto">
            {bookings.length === 0
              ? "When the studio administrator sets booking status to 'confirmed', your assignments will appear here."
              : "No records match your active search terms or date filter."}
          </p>
          {(searchQuery || selectedService !== "all" || startDate || endDate || selectedStatus !== "confirmed") && (
            <Button
              type="button"
              variant="outline"
              onClick={handleFilterReset}
              className="mt-4 text-xs cursor-pointer border-[#e8dfcf] dark:border-border"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (Screens >= 768px) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-[#ede5d8] dark:border-border bg-white dark:bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#e8dfcf] dark:border-border bg-[#f5ede0] dark:bg-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground">
                      CLIENT &amp; CONTACT
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground">
                      SERVICE
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground">
                      EVENT DATE
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground">
                      LOCATION
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground">
                      STATUS
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground">
                      QUICK ACTIONS
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] dark:text-foreground text-right">
                      DETAILS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ece2] dark:divide-border bg-white dark:bg-card">
                  {paginatedBookings.map((b) => {
                    const mapsUrl = b.location
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`
                      : null;
                    const relativeText = getRelativeDays(b.event_date);

                    return (
                      <tr
                        key={b.id}
                        className="transition-colors hover:bg-[#faf7f2]/90 dark:hover:bg-muted/40"
                      >
                        {/* 1. Client & Contact */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                              {getInitial(b.name)}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#1f1b16] dark:text-foreground leading-tight">
                                {b.name}
                              </div>
                              <div className="text-xs text-[#8c8478] dark:text-muted-foreground font-mono mt-0.5">
                                {b.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Service */}
                        <td className="px-5 py-4 font-semibold text-sm text-[#2d271f] dark:text-foreground">
                          {b.serviceTitle}
                        </td>

                        {/* 3. Event Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-[#a87f32] dark:text-accent shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-sm text-[#1f1b16] dark:text-foreground leading-tight whitespace-nowrap">
                                {formatDisplayDate(b.event_date)}
                              </div>
                              {relativeText && (
                                <div className="text-[11px] text-[#8c8478] dark:text-muted-foreground mt-0.5">
                                  {relativeText}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 4. Location */}
                        <td className="px-5 py-4 text-xs font-medium text-[#5c5449] dark:text-muted-foreground">
                          {b.location ? (
                            <span className="truncate max-w-[180px] block" title={b.location}>
                              {b.location}
                            </span>
                          ) : (
                            <span className="text-[#9e968b] dark:text-muted-foreground/60">Studio / TBA</span>
                          )}
                        </td>

                        {/* 5. Status Badge */}
                        <td className="px-5 py-4">
                          {b.status === "confirmed" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-3 py-1 text-xs font-semibold text-[#1e7e45]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                              <span>Confirmed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5f0] bg-[#f0edf7] px-3 py-1 text-xs font-semibold text-[#6b4da8]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#6b4da8]" />
                              <span>Completed</span>
                            </span>
                          )}
                        </td>

                        {/* 6. Quick Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {b.phone && b.phone !== "Not provided" && (
                              <>
                                <a
                                  href={formatTelLink(b.phone)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] dark:border-border bg-white dark:bg-muted text-[#7c756c] dark:text-foreground hover:bg-[#f5ede0] dark:hover:bg-muted/80 hover:text-[#1a1714] transition-colors shadow-2xs"
                                  title={`Call ${b.phone}`}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                                <a
                                  href={formatWhatsAppLink(
                                    b.phone,
                                    `Hi ${b.name}, Sivagangai Stories reaching out regarding your ${b.serviceTitle} session on ${b.event_date}.`,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-[#c4e5ce] dark:border-emerald-800/40 bg-[#e8f5ec] dark:bg-emerald-950/40 text-[11px] font-bold text-[#1e7e45] dark:text-emerald-300 hover:bg-[#d8eedf] dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
                                  title="WhatsApp Client"
                                >
                                  <span>WA</span>
                                </a>
                              </>
                            )}
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] dark:border-border bg-white dark:bg-muted text-[#7c756c] dark:text-foreground hover:bg-[#f5ede0] dark:hover:bg-muted/80 hover:text-[#1a1714] transition-colors shadow-2xs"
                                title="Open Location in Google Maps"
                              >
                                <MapPin className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* 7. Details Button */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd3c4] dark:border-border bg-white dark:bg-muted px-3.5 py-1.5 text-xs font-semibold text-[#2d271f] dark:text-foreground hover:bg-[#f5ede0] dark:hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#7c756c] dark:text-muted-foreground" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE STACKED CARDS VIEW (Screens < 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedBookings.map((b) => {
              const mapsUrl = b.location
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`
                : null;
              const relativeText = getRelativeDays(b.event_date);

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-[#ede5d8] dark:border-border bg-white dark:bg-card p-5 shadow-xs space-y-4"
                >
                  {/* Top: Avatar, Client Name, and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                        {getInitial(b.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1f1b16] dark:text-foreground text-base leading-tight">
                          {b.name}
                        </h3>
                        <p className="text-xs text-[#8c8478] dark:text-muted-foreground font-mono mt-0.5">
                          {b.phone}
                        </p>
                      </div>
                    </div>

                    {b.status === "confirmed" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] dark:border-emerald-800/40 bg-[#e8f5ec] dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-[#1e7e45] dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5f0] dark:border-purple-800/40 bg-[#f0edf7] dark:bg-purple-950/40 px-2.5 py-1 text-xs font-semibold text-[#6b4da8] dark:text-purple-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6b4da8]" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-y border-[#f2ece2] dark:border-border py-3">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#8c8478] dark:text-muted-foreground">
                        Service
                      </span>
                      <span className="font-semibold text-[#1a1714] dark:text-foreground mt-0.5 block">
                        {b.serviceTitle}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#8c8478] dark:text-muted-foreground">
                        Event Date
                      </span>
                      <div className="font-semibold text-[#1a1714] dark:text-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#a87f32] dark:text-accent" />
                        <span>{formatDisplayDate(b.event_date)}</span>
                      </div>
                      {relativeText && (
                        <span className="text-[10px] text-[#8c8478] dark:text-muted-foreground">
                          {relativeText}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <span className="block text-[10px] uppercase font-bold text-[#8c8478] dark:text-muted-foreground">
                        Location
                      </span>
                      <span className="text-[#5c5449] dark:text-muted-foreground truncate block mt-0.5">
                        {b.location || "Studio / TBA"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {b.phone && b.phone !== "Not provided" && (
                        <>
                          <a
                            href={formatTelLink(b.phone)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#7c756c] hover:bg-[#f5ede0] hover:text-[#1a1714]"
                            title={`Call ${b.phone}`}
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <a
                            href={formatWhatsAppLink(
                              b.phone,
                              `Hi ${b.name}, Sivagangai Stories reaching out regarding your ${b.serviceTitle} session on ${b.event_date}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 px-3 items-center justify-center rounded-lg border border-[#c4e5ce] dark:border-emerald-800/40 bg-[#e8f5ec] dark:bg-emerald-950/40 text-xs font-bold text-[#1e7e45] dark:text-emerald-300 hover:bg-[#d8eedf] dark:hover:bg-emerald-900/40"
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8dfcf] dark:border-border bg-white dark:bg-muted text-[#7c756c] dark:text-foreground hover:bg-[#f5ede0] dark:hover:bg-muted/80"
                          title="Open Location in Maps"
                        >
                          <MapPin className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd3c4] dark:border-border bg-white dark:bg-muted px-4 py-2 text-xs font-semibold text-[#2d271f] dark:text-foreground hover:bg-[#f5ede0] dark:hover:bg-muted/80 shadow-2xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#7c756c] dark:text-muted-foreground" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRecords={filteredBookings.length}
              currentCount={paginatedBookings.length}
              recordLabel="bookings"
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-[#ede5d8] dark:border-border bg-white dark:bg-card shadow-xs"
            />
          )}
        </>
      )}

      {/* Detail Modal */}
      <StaffBookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
