"use client";

// StaffBookingsTable: Interactive, read-only table for staff to view confirmed bookings.
// Provides search, filtering (status, service, date range), sorting, pagination,
// quick communication actions (tel:, wa.me, google maps), and detail modal.
// Strictly read-only: no status change, delete, or reassign controls.

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
import StatusBadge from "@/components/admin/StatusBadge";
import TablePagination from "@/components/admin/TablePagination";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";
import type { StaffBookingItem } from "@/lib/account/queries";

interface StaffBookingsTableProps {
  initialBookings: StaffBookingItem[];
  availableServices: { slug: string; title: string }[];
}

export default function StaffBookingsTable({
  initialBookings,
  availableServices,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Bookings
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Confirmed client shoots and assignments scheduled by studio administration.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-xs text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("confirmed");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              selectedStatus === "confirmed"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
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
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              selectedStatus === "completed"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
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
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              selectedStatus === "all"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All ({bookings.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client name, phone, location..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
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
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
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
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Sort & Reset Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "event_asc" | "event_desc" | "created_desc")}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground"
            >
              <option value="event_asc">Event Date (Upcoming First)</option>
              <option value="event_desc">Event Date (Furthest First)</option>
              <option value="created_desc">Recently Booked</option>
            </select>
          </div>

          {(searchQuery || selectedService !== "all" || startDate || endDate || selectedStatus !== "confirmed") && (
            <button
              type="button"
              onClick={handleFilterReset}
              className="text-xs font-semibold text-accent hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Bookings Count Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong>{filteredBookings.length}</strong> {filteredBookings.length === 1 ? "booking" : "bookings"}
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* 4. Table / Stacked Cards View */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-semibold text-foreground">
            No confirmed bookings yet
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {bookings.length === 0
              ? "When the studio administrator sets booking status to 'confirmed', your assignments will appear here."
              : "No records match your active search terms or date filter."}
          </p>
          {(searchQuery || selectedService !== "all" || startDate || endDate || selectedStatus !== "confirmed") && (
            <Button
              type="button"
              variant="outline"
              onClick={handleFilterReset}
              className="mt-4 text-xs cursor-pointer"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (Visible on screens >= 768px) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Client & Contact</th>
                    <th scope="col" className="px-5 py-3.5">Service</th>
                    <th scope="col" className="px-5 py-3.5">Event Date</th>
                    <th scope="col" className="px-5 py-3.5">Location</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Quick Actions</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedBookings.map((b) => {
                    const mapsUrl = b.location
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`
                      : null;

                    return (
                      <tr
                        key={b.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        {/* Client Name & Phone */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-card-foreground">{b.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {b.phone}
                          </div>
                        </td>

                        {/* Service Title */}
                        <td className="px-5 py-4 text-foreground font-medium">
                          {b.serviceTitle}
                        </td>

                        {/* Event Date */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            <span>{b.event_date}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {b.location ? (
                            <span className="truncate max-w-[180px] block" title={b.location}>
                              {b.location}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">Studio / TBA</span>
                          )}
                        </td>

                        {/* Status (Read-Only Badge) */}
                        <td className="px-5 py-4">
                          <StatusBadge status={b.status} />
                        </td>

                        {/* Quick Contact Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {b.phone && b.phone !== "Not provided" && (
                              <>
                                <a
                                  href={formatTelLink(b.phone)}
                                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title={`Call ${b.phone}`}
                                >
                                  <Phone className="h-3.5 w-3.5 text-accent" />
                                </a>
                                <a
                                  href={formatWhatsAppLink(
                                    b.phone,
                                    `Hi ${b.name}, Sivagangai Stories reaching out regarding your ${b.serviceTitle} session on ${b.event_date}.`,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md border border-whatsapp/30 bg-whatsapp/10 p-1.5 text-whatsapp hover:bg-whatsapp/20"
                                  title="WhatsApp Client"
                                >
                                  <span className="text-[11px] font-bold leading-none">WA</span>
                                </a>
                              </>
                            )}
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Open Location in Google Maps"
                              >
                                <MapPin className="h-3.5 w-3.5 text-accent" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* View Details Button */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
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

          {/* MOBILE STACKED CARDS VIEW (Visible on screens < 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedBookings.map((b) => {
              const mapsUrl = b.location
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`
                : null;

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4"
                >
                  {/* Top: Name, Service & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-card-foreground text-base">{b.name}</h3>
                      <p className="text-xs font-medium text-accent mt-0.5">{b.serviceTitle}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y border-border py-3">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">
                        Event Date
                      </span>
                      <span className="font-semibold text-foreground">{b.event_date}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">
                        Location
                      </span>
                      <span className="text-foreground truncate block">{b.location || "Studio"}</span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">
                        Phone
                      </span>
                      <span className="font-mono text-foreground font-semibold">{b.phone}</span>
                    </div>
                  </div>

                  {/* Quick Contact & Details Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {b.phone && b.phone !== "Not provided" && (
                        <>
                          <a
                            href={formatTelLink(b.phone)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            <Phone className="h-3.5 w-3.5 text-accent" />
                            <span>Call</span>
                          </a>
                          <a
                            href={formatWhatsAppLink(
                              b.phone,
                              `Hi ${b.name}, Sivagangai Stories reaching out regarding your ${b.serviceTitle} session on ${b.event_date}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-3 py-2 text-xs font-semibold text-whatsapp hover:bg-whatsapp/20"
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
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Open Location in Maps"
                        >
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
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
