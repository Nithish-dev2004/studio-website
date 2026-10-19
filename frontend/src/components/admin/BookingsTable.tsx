"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
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
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import { deleteBookingAction, updateBookingStatusAction } from "@/app/admin/actions";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

interface BookingsTableProps {
  initialBookings: AdminBookingItem[];
  availableServices: { slug: string; title: string }[];
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

  // Status counts for top summary pill badges
  const statusCounts = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    bookings.forEach((b) => {
      if (b.status === "pending") pending++;
      else if (b.status === "confirmed") confirmed++;
      else if (b.status === "completed") completed++;
    });
    return { pending, confirmed, completed };
  }, [bookings]);

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
          <h1
            className="text-2xl font-bold tracking-tight text-[#1a1714] sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Studio Bookings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            View, schedule, contact, and manage client bookings across all photography services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs border-[#e8dfcf] bg-white text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-all cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[#a87f32]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs sm:p-5 space-y-4">
        {/* Top row: search & reset */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c8478]" />
            <input
              type="text"
              placeholder="Search by client name, email, phone, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pl-10 pr-9 text-xs text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e968b] hover:text-[#1a1714] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {(searchQuery ||
            selectedStatus !== "all" ||
            selectedService !== "all" ||
            startDate ||
            endDate) && (
            <button
              type="button"
              onClick={handleFilterReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#a87f32] hover:underline px-2 py-1 cursor-pointer"
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
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
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
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
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
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              From Event Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2 text-xs text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              To Event Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2 text-xs text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
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
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="event_asc">Event Date (Earliest first)</option>
              <option value="event_desc">Event Date (Latest first)</option>
              <option value="created_desc">Booking Created (Newest first)</option>
              <option value="created_asc">Booking Created (Oldest first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Count Summary & Status Filter Badges (Matching Screenshot Top Right) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="text-xs text-[#8c8478]">
          Showing <strong className="text-[#1a1714] font-semibold">{filteredBookings.length}</strong> {filteredBookings.length === 1 ? "booking" : "bookings"}
          {selectedStatus !== "all" && (
            <span className="ml-1 text-[#a87f32]">
              (filtered by <span className="font-semibold capitalize">{selectedStatus}</span>)
            </span>
          )}
        </div>

        {/* Top Right Status Badges from Screenshot */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "pending" ? "all" : "pending"));
              setCurrentPage(1);
            }}
            title="Filter by Pending"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "pending"
                ? "bg-[#faeed6] text-[#b45309] border-2 border-[#b45309] shadow-xs"
                : "bg-[#faeed6] text-[#b45309] border border-[#f5d9a8] hover:border-[#b45309]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
            <span>{statusCounts.pending} pending</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "confirmed" ? "all" : "confirmed"));
              setCurrentPage(1);
            }}
            title="Filter by Confirmed"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "confirmed"
                ? "bg-[#e6f4ea] text-[#137333] border-2 border-[#137333] shadow-xs"
                : "bg-[#e6f4ea] text-[#137333] border border-[#ceead6] hover:border-[#137333]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" />
            <span>{statusCounts.confirmed} confirmed</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "completed" ? "all" : "completed"));
              setCurrentPage(1);
            }}
            title="Filter by Completed"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "completed"
                ? "bg-[#e8f0fe] text-[#1a73e8] border-2 border-[#1a73e8] shadow-xs"
                : "bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] hover:border-[#1a73e8]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
            <span>{statusCounts.completed} completed</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfcf] bg-white p-12 text-center shadow-xs">
          <Calendar className="mx-auto h-10 w-10 text-[#8c8478]/40" />
          <h3 className="mt-3 text-base font-semibold text-[#1a1714]">No bookings found</h3>
          <p className="mt-1 text-xs text-[#7c756c]">
            No records matched your search terms or filter selection.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleFilterReset}
            className="mt-4 text-xs cursor-pointer border-[#e8dfcf]"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (matching uploaded screenshot) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-[#ede5d8] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#e8dfcf] bg-[#f5ede0]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                      CLIENT &amp; CONTACT
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                      SERVICE
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                      EVENT DATE
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                      LOCATION
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                      STATUS
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                      QUICK ACTIONS
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] text-right">
                      DETAILS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ece2] bg-white">
                  {paginatedBookings.map((b) => {
                    const conflictingList = b.event_date ? confirmedDateMap.get(b.event_date) || [] : [];
                    const hasConflict = b.status === "confirmed" && conflictingList.length > 1;
                    const relativeText = getRelativeDays(b.event_date);

                    return (
                      <tr
                        key={b.id}
                        className={`transition-colors hover:bg-[#faf7f2]/90 ${
                          hasConflict ? "bg-red-50/50" : ""
                        }`}
                      >
                        {/* 1. Client & Contact */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                              {getInitial(b.name)}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#1f1b16] leading-tight">
                                {b.name}
                              </div>
                              <div className="text-xs text-[#8c8478] flex flex-col gap-0.5 mt-0.5">
                                <span className="truncate max-w-[180px]">{b.email}</span>
                                <span>{b.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Service */}
                        <td className="px-5 py-4 font-semibold text-sm text-[#2d271f]">
                          {b.serviceTitle}
                        </td>

                        {/* 3. Event Date with Relative Label and Conflict Indicator */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-sm text-[#1f1b16] leading-tight whitespace-nowrap">
                            {formatDisplayDate(b.event_date)}
                          </div>
                          {relativeText && (
                            <div className="text-xs font-semibold text-[#b45309] mt-0.5">
                              {relativeText}
                            </div>
                          )}
                          {hasConflict && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-red-600">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>Double confirmed!</span>
                            </div>
                          )}
                        </td>

                        {/* 4. Location */}
                        <td className="px-5 py-4 text-xs font-medium text-[#5c5449]">
                          {b.location ? (
                            <span className="truncate max-w-[160px] block" title={b.location}>
                              {b.location}
                            </span>
                          ) : (
                            <span className="text-[#9e968b]">Studio / TBA</span>
                          )}
                        </td>

                        {/* 5. Status Dropdown (Custom pill with Chevron matching screenshot) */}
                        <td className="px-5 py-4">
                          <div className="relative inline-flex items-center">
                            <select
                              value={b.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus !== b.status) {
                                  setStatusChangeTarget({ booking: b, newStatus });
                                }
                              }}
                              className={`appearance-none rounded-xl border px-3.5 py-1.5 pr-8 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden transition-all shadow-2xs ${
                                b.status === "confirmed"
                                  ? "bg-[#e8f5ec] border-[#c4e5ce] text-[#1e7e45] hover:bg-[#d8eedf]"
                                  : b.status === "completed"
                                  ? "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8] hover:bg-[#dbe7fd]"
                                  : b.status === "cancelled"
                                  ? "bg-[#fdeeee] border-[#f0c8c8] text-[#c53030] hover:bg-[#fadcdc]"
                                  : "bg-[#fdeedc] border-[#f5d3b3] text-[#a0521e] hover:bg-[#fae2c6]"
                              }`}
                            >
                              <option value="pending" className="bg-white text-[#a0521e]">
                                Pending
                              </option>
                              <option value="confirmed" className="bg-white text-[#1e7e45]">
                                Confirmed
                              </option>
                              <option value="completed" className="bg-white text-[#1a73e8]">
                                Completed
                              </option>
                              <option value="cancelled" className="bg-white text-[#c53030]">
                                Cancelled
                              </option>
                            </select>
                            <ChevronDown
                              className={`pointer-events-none absolute right-2.5 h-3.5 w-3.5 shrink-0 ${
                                b.status === "confirmed"
                                  ? "text-[#1e7e45]"
                                  : b.status === "completed"
                                  ? "text-[#1a73e8]"
                                  : b.status === "cancelled"
                                  ? "text-[#c53030]"
                                  : "text-[#a0521e]"
                              }`}
                            />
                          </div>
                        </td>

                        {/* 6. Quick Contact Actions (Phone, WA, Email, Delete matching screenshot) */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* Phone Call Button */}
                            <a
                              href={b.phone !== "Not provided" ? formatTelLink(b.phone) : undefined}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white transition-colors ${
                                b.phone !== "Not provided"
                                  ? "text-[#735b38] hover:bg-[#f5ede0] hover:border-[#dbcbb4] cursor-pointer"
                                  : "opacity-40 pointer-events-none"
                              }`}
                              title={b.phone !== "Not provided" ? `Call ${b.phone}` : "No phone provided"}
                            >
                              <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                            </a>

                            {/* WhatsApp Button */}
                            {b.phone !== "Not provided" ? (
                              <a
                                href={formatWhatsAppLink(
                                  b.phone,
                                  `Hi ${b.name}, Sivagangai Stories reaching out about your ${b.serviceTitle} session on ${b.event_date}.`,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 items-center justify-center rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors cursor-pointer"
                                title="WhatsApp Client"
                              >
                                WA
                              </a>
                            ) : (
                              <span
                                className="flex h-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-[#fcfaf7] px-2.5 text-xs font-bold text-[#9e968b] opacity-40 cursor-not-allowed"
                                title="No phone"
                              >
                                WA
                              </span>
                            )}

                            {/* Email Button */}
                            <a
                              href={`mailto:${b.email}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-colors cursor-pointer"
                              title={`Email ${b.email}`}
                            >
                              <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
                            </a>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(b)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fcd8d8] bg-white text-[#dc2626] hover:bg-[#fdeeee] hover:border-[#fca5a5] transition-colors cursor-pointer"
                              title="Delete Booking"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
                            </button>
                          </div>
                        </td>

                        {/* 7. View Details Button (Pill with Eye icon) */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd3c4] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#c5b9a5] transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#4a3f35]" />
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
              const relativeText = getRelativeDays(b.event_date);

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border border-[#ede5d8] bg-white p-5 shadow-xs space-y-4 ${
                    hasConflict ? "border-red-300 bg-red-50/30" : ""
                  }`}
                >
                  {/* Top: Name, Avatar, Service */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                        {getInitial(b.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1f1b16] text-base leading-tight">{b.name}</h3>
                        <p className="text-xs font-semibold text-[#a87f32] mt-0.5">{b.serviceTitle}</p>
                      </div>
                    </div>
                    {hasConflict && (
                      <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                        Double Booked
                      </span>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#5c5449] border-y border-[#f2ece2] py-3">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#8c8478]">
                        Event Date
                      </span>
                      <span className="font-semibold text-[#1f1b16]">{formatDisplayDate(b.event_date)}</span>
                      {relativeText && (
                        <span className="block text-[11px] font-semibold text-[#b45309]">
                          {relativeText}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#8c8478]">
                        Location
                      </span>
                      <span className="text-[#1f1b16] truncate block">{b.location || "Studio / TBA"}</span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="block text-[10px] uppercase font-bold text-[#8c8478]">
                        Phone &amp; Email
                      </span>
                      <span className="text-[#1f1b16]">{b.phone} &bull; {b.email}</span>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative inline-flex items-center">
                      <select
                        value={b.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus !== b.status) {
                            setStatusChangeTarget({ booking: b, newStatus });
                          }
                        }}
                        className={`appearance-none rounded-xl border px-3 py-1.5 pr-7 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden ${
                          b.status === "confirmed"
                            ? "bg-[#e8f5ec] border-[#c4e5ce] text-[#1e7e45]"
                            : b.status === "completed"
                            ? "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8]"
                            : b.status === "cancelled"
                            ? "bg-[#fdeeee] border-[#f0c8c8] text-[#c53030]"
                            : "bg-[#fdeedc] border-[#f5d3b3] text-[#a0521e]"
                        }`}
                      >
                        <option value="pending" className="bg-white text-[#a0521e]">Pending</option>
                        <option value="confirmed" className="bg-white text-[#1e7e45]">Confirmed</option>
                        <option value="completed" className="bg-white text-[#1a73e8]">Completed</option>
                        <option value="cancelled" className="bg-white text-[#c53030]">Cancelled</option>
                      </select>
                      <ChevronDown
                        className={`pointer-events-none absolute right-2 h-3.5 w-3.5 shrink-0 ${
                          b.status === "confirmed"
                            ? "text-[#1e7e45]"
                            : b.status === "completed"
                            ? "text-[#1a73e8]"
                            : b.status === "cancelled"
                            ? "text-[#c53030]"
                            : "text-[#a0521e]"
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {b.phone !== "Not provided" && (
                        <>
                          <a
                            href={formatTelLink(b.phone)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0]"
                            title="Call"
                          >
                            <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                          </a>
                          <a
                            href={formatWhatsAppLink(
                              b.phone,
                              `Hi ${b.name}, Sivagangai Stories reaching out about your ${b.serviceTitle} session on ${b.event_date}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 items-center justify-center rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf]"
                          >
                            WA
                          </a>
                        </>
                      )}
                      <a
                        href={`mailto:${b.email}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0]"
                        title="Email"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(b)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fcd8d8] bg-white text-[#dc2626] hover:bg-[#fdeeee]"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#dcd3c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0]"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#4a3f35]" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredBookings.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[#ede5d8] bg-white shadow-xs">
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
