"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Download,
  Eye,
  Mail,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import BookingDetailModal, { AdminBookingItem } from "./BookingDetailModal";
import ConfirmationModal from "./ConfirmationModal";
import StatusBadge from "./StatusBadge";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import { deleteBookingAction, updateBookingStatusAction } from "@/app/admin/actions";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

interface BookingsTableProps {
  initialBookings: AdminBookingItem[];
  availableServices: { slug: string; title: string }[];
}

export default function BookingsTable({
  initialBookings,
  availableServices,
}: BookingsTableProps) {
  const [bookings, setBookings] = useState<AdminBookingItem[]>(initialBookings);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"event_desc" | "event_asc" | "created_desc" | "created_asc">(
    "event_asc",
  );
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingItem | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    booking: AdminBookingItem;
    newStatus: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBookingItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useAdminToast();

  // 1) Find confirmed date collisions across the entire booking dataset
  const confirmedDateMap = useMemo(() => {
    const map = new Map<string, AdminBookingItem[]>();
    bookings.forEach((b) => {
      if (b.status === "confirmed" && b.event_date) {
        const list = map.get(b.event_date) || [];
        list.push(b);
        map.set(b.event_date, list);
      }
    });
    return map;
  }, [bookings]);

  // 2) Filter and sort records
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((item) => {
        // Text search across name, email, phone, location, message
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            item.name.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.phone.toLowerCase().includes(q) ||
            (item.location && item.location.toLowerCase().includes(q)) ||
            (item.message && item.message.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Status filter
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
        if (sortBy === "event_desc") return b.event_date.localeCompare(a.event_date);
        if (sortBy === "event_asc") return a.event_date.localeCompare(b.event_date);
        if (sortBy === "created_desc") return b.created_at.localeCompare(a.created_at);
        if (sortBy === "created_asc") return a.created_at.localeCompare(b.created_at);
        return 0;
      });
  }, [bookings, searchQuery, selectedStatus, selectedService, startDate, endDate, sortBy]);

  // 3) Pagination
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Reset page when filters change
  const handleFilterReset = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedService("all");
    setStartDate("");
    setEndDate("");
    setSortBy("event_asc");
    setCurrentPage(1);
  };

  // 4) Execute status change after confirmation
  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    setIsProcessing(true);

    const { booking, newStatus } = statusChangeTarget;
    const res = await updateBookingStatusAction(booking.id, newStatus);
    setIsProcessing(false);
    setStatusChangeTarget(null);

    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, status: newStatus, updated_at: new Date().toISOString() }
            : b,
        ),
      );
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Status updated to "${newStatus}" for ${booking.name}.`, "success");
    } else {
      showToast(res.error || "Failed to update status.", "error");
    }
  };

  // 5) Execute booking deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);

    const targetId = deleteTarget.id;
    const targetName = deleteTarget.name;
    const res = await deleteBookingAction(targetId);
    setIsProcessing(false);
    setDeleteTarget(null);

    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== targetId));
      if (selectedBooking && selectedBooking.id === targetId) {
        setSelectedBooking(null);
      }
      showToast(`Booking for ${targetName} was deleted.`, "success");
    } else {
      showToast(res.error || "Failed to delete booking.", "error");
    }
  };

  // 6) Export filtered bookings to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      showToast("No bookings to export with current filters.", "error");
      return;
    }

    const headers = [
      "ID",
      "Client Name",
      "Email",
      "Phone",
      "Service",
      "Event Date",
      "Location",
      "Status",
      "Message",
      "Created At",
    ];

    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredBookings.map((b) => [
      escapeCsv(b.id),
      escapeCsv(b.name),
      escapeCsv(b.email),
      escapeCsv(b.phone),
      escapeCsv(b.serviceTitle),
      escapeCsv(b.event_date),
      escapeCsv(b.location),
      escapeCsv(b.status),
      escapeCsv(b.message),
      escapeCsv(new Date(b.created_at).toISOString()),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `studio-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredBookings.length} bookings to CSV.`, "success");
  };

  return (
    <div className="space-y-6">

      {/* Page Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Bookings Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, schedule, contact, and manage client bookings across all photography services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-accent" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5 space-y-4">
        {/* Top row: search & reset */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by client name, email, phone, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            />
          </div>

          {(searchQuery ||
            selectedStatus !== "all" ||
            selectedService !== "all" ||
            startDate ||
            endDate) && (
            <button
              type="button"
              onClick={handleFilterReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline px-2 py-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Services</option>
              {availableServices.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              From Event Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              To Event Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(
                  e.target.value as "event_desc" | "event_asc" | "created_desc" | "created_asc",
                );
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="event_asc">Event Date (Earliest first)</option>
              <option value="event_desc">Event Date (Latest first)</option>
              <option value="created_desc">Booking Created (Newest first)</option>
              <option value="created_asc">Booking Created (Oldest first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Count Summary */}
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

      {/* Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No bookings found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No records matched your search terms or filter selection.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleFilterReset}
            className="mt-4 text-xs"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (hidden on mobile, visible on sm and up) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Client</th>
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
                    const conflictingList = b.event_date ? confirmedDateMap.get(b.event_date) || [] : [];
                    const hasConflict = b.status === "confirmed" && conflictingList.length > 1;

                    return (
                      <tr
                        key={b.id}
                        className={`transition-colors hover:bg-muted/30 ${
                          hasConflict ? "bg-destructive/5" : ""
                        }`}
                      >
                        {/* Client Name & Contacts */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-card-foreground">{b.name}</div>
                          <div className="text-xs text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                            <span className="truncate max-w-[180px]">{b.email}</span>
                            <span>{b.phone}</span>
                          </div>
                        </td>

                        {/* Service Title */}
                        <td className="px-5 py-4 text-foreground font-medium">
                          {b.serviceTitle}
                        </td>

                        {/* Event Date with Conflict Indicator */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-foreground whitespace-nowrap">
                            {b.event_date}
                          </div>
                          {hasConflict && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-destructive">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>Double confirmed!</span>
                            </div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {b.location || "Studio / TBA"}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-5 py-4">
                          <select
                            value={b.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus !== b.status) {
                                setStatusChangeTarget({ booking: b, newStatus });
                              }
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold capitalize text-foreground focus:border-accent focus:outline-hidden"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Quick Contact Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {b.phone !== "Not provided" && (
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
                                    `Hi ${b.name}, Sivagangai Stories reaching out about your ${b.serviceTitle} session on ${b.event_date}.`,
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
                            <a
                              href={`mailto:${b.email}`}
                              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title={`Email ${b.email}`}
                            >
                              <Mail className="h-3.5 w-3.5 text-accent" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(b)}
                              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete Booking"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* View Details Button */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
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

          {/* MOBILE STACKED CARDS VIEW (visible on mobile < 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedBookings.map((b) => {
              const conflictingList = b.event_date ? confirmedDateMap.get(b.event_date) || [] : [];
              const hasConflict = b.status === "confirmed" && conflictingList.length > 1;

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 ${
                    hasConflict ? "border-destructive/40 bg-destructive/5" : ""
                  }`}
                >
                  {/* Top: Name, Status, Conflict Warning */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-card-foreground text-base">{b.name}</h3>
                      <p className="text-xs font-medium text-accent mt-0.5">{b.serviceTitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={b.status} />
                      {hasConflict && (
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                          Double Booked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details grid */}
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
                        Phone & Email
                      </span>
                      <span className="text-foreground">{b.phone} · {b.email}</span>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <select
                      value={b.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus !== b.status) {
                          setStatusChangeTarget({ booking: b, newStatus });
                        }
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold capitalize text-foreground"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      {b.phone !== "Not provided" && (
                        <>
                          <a
                            href={formatTelLink(b.phone)}
                            className="rounded-lg border border-border p-2 text-foreground hover:bg-muted"
                            title="Call"
                          >
                            <Phone className="h-4 w-4 text-accent" />
                          </a>
                          <a
                            href={formatWhatsAppLink(
                              b.phone,
                              `Hi ${b.name}, Sivagangai Stories reaching out about your ${b.serviceTitle} session on ${b.event_date}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-2.5 py-1.5 text-xs font-bold text-whatsapp hover:bg-whatsapp/20"
                          >
                            WA
                          </a>
                        </>
                      )}
                      <a
                        href={`mailto:${b.email}`}
                        className="rounded-lg border border-border p-2 text-foreground hover:bg-muted"
                        title="Email"
                      >
                        <Mail className="h-4 w-4 text-accent" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredBookings.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={filteredBookings.length}
                currentCount={paginatedBookings.length}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                recordLabel="bookings"
                className="border-t-0"
              />
            </div>
          )}
        </>
      )}

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        hasConflict={Boolean(
          selectedBooking?.status === "confirmed" &&
            selectedBooking?.event_date &&
            (confirmedDateMap.get(selectedBooking.event_date)?.length || 0) > 1,
        )}
        onClose={() => setSelectedBooking(null)}
        onStatusChangeClick={(booking, newStatus) =>
          setStatusChangeTarget({ booking, newStatus })
        }
        onDeleteClick={(booking) => {
          setSelectedBooking(null);
          setDeleteTarget(booking);
        }}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusChangeTarget !== null}
        title="Confirm Status Change"
        description={`Are you sure you want to change the status of ${statusChangeTarget?.booking.name}'s booking to "${statusChangeTarget?.newStatus}"?`}
        confirmLabel="Update Status"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusChangeTarget(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Booking"
        description={`Are you sure you want to permanently delete the booking for ${deleteTarget?.name} (${deleteTarget?.event_date})? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
