"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  Layers,
  MapPin,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import SignboardDetailModal, { SignboardBookingItem } from "./SignboardDetailModal";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import { deleteSignboardBookingAction, updateSignboardStatusAction } from "@/app/admin/actions";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

const availableStatuses = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "site_visit_scheduled", label: "Site Visit Scheduled" },
  { value: "measurement_done", label: "Measurement Done" },
  { value: "render_sent", label: "3D Render Sent" },
  { value: "approved", label: "Approved" },
  { value: "installed", label: "Installed" },
  { value: "closed", label: "Closed" },
];

interface SignboardTableProps {
  initialBookings: SignboardBookingItem[];
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
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

export default function SignboardTable({ initialBookings }: SignboardTableProps) {
  const [bookings, setBookings] = useState<SignboardBookingItem[]>(initialBookings);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"created_desc" | "created_asc">("created_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals & Feedback
  const [selectedBooking, setSelectedBooking] = useState<SignboardBookingItem | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    booking: SignboardBookingItem;
    newStatus: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SignboardBookingItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useAdminToast();

  // Status counts for top summary pill badges
  const statusCounts = useMemo(() => {
    let newCount = 0;
    let approvedCount = 0;
    let installedCount = 0;
    bookings.forEach((b) => {
      if (b.status === "new") newCount++;
      else if (b.status === "approved") approvedCount++;
      else if (b.status === "installed") installedCount++;
    });
    return { newCount, approvedCount, installedCount };
  }, [bookings]);

  // Distinct cities for filter
  const distinctCities = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.city) set.add(b.city);
    });
    return Array.from(set).sort();
  }, [bookings]);

  // Filter & Sort
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            item.business_name.toLowerCase().includes(q) ||
            item.phone.toLowerCase().includes(q) ||
            item.city.toLowerCase().includes(q) ||
            item.sign_type.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q));
          if (!match) return false;
        }

        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }

        if (selectedCity !== "all" && item.city !== selectedCity) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "created_asc") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [bookings, searchQuery, selectedStatus, selectedCity, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Status Change execution
  const executeStatusChange = async () => {
    if (!statusChangeTarget) return;
    setIsProcessing(true);

    try {
      const res = await updateSignboardStatusAction(
        statusChangeTarget.booking.id,
        statusChangeTarget.newStatus,
      );

      if (!res.ok) {
        showToast(res.error || "Failed to update status", "error");
      } else {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === statusChangeTarget.booking.id
              ? { ...b, status: statusChangeTarget.newStatus, updated_at: new Date().toISOString() }
              : b,
          ),
        );
        if (selectedBooking && selectedBooking.id === statusChangeTarget.booking.id) {
          setSelectedBooking((prev) =>
            prev ? { ...prev, status: statusChangeTarget.newStatus } : null,
          );
        }
        showToast(res.message || "Status updated successfully.");
      }
    } catch {
      showToast("Network error updating status", "error");
    } finally {
      setIsProcessing(false);
      setStatusChangeTarget(null);
    }
  };

  // Delete execution
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);

    try {
      const res = await deleteSignboardBookingAction(deleteTarget.id);
      if (!res.ok) {
        showToast(res.error || "Failed to delete order", "error");
      } else {
        setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        if (selectedBooking && selectedBooking.id === deleteTarget.id) {
          setSelectedBooking(null);
        }
        showToast("Signboard order deleted.");
      }
    } catch {
      showToast("Network error deleting order", "error");
    } finally {
      setIsProcessing(false);
      setDeleteTarget(null);
    }
  };

  // Filter Reset
  const handleFilterReset = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedCity("all");
    setSortBy("created_desc");
    setCurrentPage(1);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    const headers = [
      "ID",
      "Business Name",
      "Phone",
      "City",
      "Sign Type",
      "Dimensions",
      "Status",
      "Notes",
      "Created At",
    ];

    const rows = filteredBookings.map((b) => [
      b.id,
      `"${b.business_name.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.city}"`,
      `"${b.sign_type.replace(/"/g, '""')}"`,
      `"${b.dimensions.replace(/"/g, '""')}"`,
      b.status,
      `"${(b.notes || "").replace(/"/g, '""')}"`,
      b.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `signboard_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV export downloaded successfully.");
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#1a1714] sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sign Board Orders
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            Sivagangai Sign Board orders, on-site measurements, and 3D acrylic estimates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e8dfcf] bg-white px-3.5 py-2 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-all cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[#a87f32]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filter and Search Bar Card */}
      <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs sm:p-5 space-y-4">
        {/* Top search box */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c8478]" />
            <input
              type="text"
              placeholder="Search by business name, city, phone, sign type..."
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

          {(searchQuery || selectedStatus !== "all" || selectedCity !== "all") && (
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

        {/* Filter controls row with uppercase titles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              STATUS
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              {availableStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              CITY / LOCATION
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="all">All Cities</option>
              {distinctCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              SORT BY
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "created_desc" | "created_asc")}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Bookings Count Summary & Status Badges Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="text-xs text-[#8c8478]">
          Showing <strong className="text-[#1a1714] font-semibold">{filteredBookings.length}</strong> orders
        </div>

        {/* Top Right Status Badges matching screenshot */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "new" ? "all" : "new"));
              setCurrentPage(1);
            }}
            title="Filter by New"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "new"
                ? "bg-[#faeed6] text-[#b45309] border-2 border-[#b45309] shadow-xs"
                : "bg-[#faeed6] text-[#b45309] border border-[#f5d9a8] hover:border-[#b45309]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
            <span>{statusCounts.newCount} new</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "approved" ? "all" : "approved"));
              setCurrentPage(1);
            }}
            title="Filter by Approved"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "approved"
                ? "bg-[#e6f4ea] text-[#137333] border-2 border-[#137333] shadow-xs"
                : "bg-[#e6f4ea] text-[#137333] border border-[#ceead6] hover:border-[#137333]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" />
            <span>{statusCounts.approvedCount} approved</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "installed" ? "all" : "installed"));
              setCurrentPage(1);
            }}
            title="Filter by Installed"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "installed"
                ? "bg-[#e8f0fe] text-[#1a73e8] border-2 border-[#1a73e8] shadow-xs"
                : "bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] hover:border-[#1a73e8]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
            <span>{statusCounts.installedCount} installed</span>
          </button>
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="rounded-2xl border border-[#ede5d8] bg-white shadow-xs overflow-hidden">
        {/* Desktop View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e8dfcf] bg-[#f5ede0]">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  BUSINESS &amp; CONTACT
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  SIGN TYPE
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  CITY
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  DIMENSIONS
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
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7c756c]">
                    <Layers className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
                    <p className="font-semibold text-[#1a1714]">No signboard orders found</p>
                    <p className="mt-1 text-xs text-[#7c756c]">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-[#faf7f2]/90">
                    {/* Business & Contact */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                          {getInitial(b.business_name)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1f1b16] leading-tight">{b.business_name}</div>
                          <div className="text-xs text-[#8c8478] font-mono mt-0.5">{b.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Sign Type */}
                    <td className="px-5 py-4 font-semibold text-sm text-[#2d271f]">
                      {b.sign_type}
                    </td>

                    {/* City */}
                    <td className="px-5 py-4 text-xs font-medium text-[#5c5449]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#8c734b]" />
                        <span>{b.city}</span>
                      </div>
                    </td>

                    {/* Dimensions */}
                    <td className="px-5 py-4 text-xs font-medium text-[#5c5449]">
                      <span className="inline-block rounded-md border border-[#e8dfcf] bg-[#fcfaf7] px-2.5 py-1 font-mono text-[11px] text-[#2d271f]">
                        {b.dimensions}
                      </span>
                    </td>

                    {/* Status Dropdown Pill with Chevron */}
                    <td className="px-5 py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            setStatusChangeTarget({ booking: b, newStatus: e.target.value })
                          }
                          className={`appearance-none rounded-xl border px-3.5 py-1.5 pr-8 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden transition-all shadow-2xs ${
                            b.status === "approved" || b.status === "installed"
                              ? "bg-[#e8f5ec] border-[#c4e5ce] text-[#1e7e45] hover:bg-[#d8eedf]"
                              : b.status === "site_visit_scheduled" || b.status === "measurement_done" || b.status === "render_sent"
                              ? "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8] hover:bg-[#dbe7fd]"
                              : b.status === "closed"
                              ? "bg-[#f5f5f5] border-[#e0e0e0] text-[#616161]"
                              : "bg-[#faeed6] border-[#f5d9a8] text-[#b45309] hover:bg-[#f6e4c0]"
                          }`}
                        >
                          {availableStatuses
                            .filter((s) => s.value !== "all")
                            .map((s) => (
                              <option key={s.value} value={s.value} className="bg-white text-[#1a1714]">
                                {s.label}
                              </option>
                            ))}
                        </select>
                        <ChevronDown
                          className={`pointer-events-none absolute right-2.5 h-3.5 w-3.5 shrink-0 ${
                            b.status === "approved" || b.status === "installed"
                              ? "text-[#1e7e45]"
                              : b.status === "site_visit_scheduled" || b.status === "measurement_done" || b.status === "render_sent"
                              ? "text-[#1a73e8]"
                              : b.status === "closed"
                              ? "text-[#616161]"
                              : "text-[#b45309]"
                          }`}
                        />
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* Call */}
                        <a
                          href={b.phone ? formatTelLink(b.phone) : undefined}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white transition-colors ${
                            b.phone
                              ? "text-[#735b38] hover:bg-[#f5ede0] hover:border-[#dbcbb4] cursor-pointer"
                              : "opacity-40 pointer-events-none"
                          }`}
                          title={`Call ${b.phone}`}
                        >
                          <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                        </a>

                        {/* WhatsApp */}
                        {b.phone ? (
                          <a
                            href={formatWhatsAppLink(
                              b.phone,
                              `Hello ${b.business_name}, contacting you regarding your Sign Board order with Sivagangai Sign Board.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 items-center justify-center rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors cursor-pointer"
                            title="WhatsApp Client"
                          >
                            WA
                          </a>
                        ) : (
                          <span className="flex h-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-[#fcfaf7] px-2.5 text-xs font-bold text-[#9e968b] opacity-40">
                            WA
                          </span>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fcd8d8] bg-white text-[#dc2626] hover:bg-[#fdeeee] hover:border-[#fca5a5] transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
                        </button>
                      </div>
                    </td>

                    {/* Details */}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-[#f2ece2]">
          {paginatedBookings.length === 0 ? (
            <div className="p-8 text-center text-[#7c756c]">
              <Layers className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
              <p className="font-semibold text-[#1a1714]">No signboard orders found</p>
            </div>
          ) : (
            paginatedBookings.map((b) => (
              <div key={b.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                      {getInitial(b.business_name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1f1b16] text-sm leading-tight">{b.business_name}</h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8c8478]">
                        <span className="font-semibold text-[#2d271f]">{b.sign_type}</span>
                        <span>&bull;</span>
                        <span>{b.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-3 text-xs space-y-1">
                  <div className="text-[#5c5449]">
                    Phone: <span className="font-semibold text-[#1a1714]">{b.phone}</span>
                  </div>
                  <div className="text-[#5c5449]">
                    Dimensions: <span className="font-mono font-semibold text-[#1a1714]">{b.dimensions}</span>
                  </div>
                  <div className="text-[#8c8478] text-[11px] pt-1">
                    Ordered: {formatDisplayDate(b.created_at)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="relative inline-flex items-center">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        setStatusChangeTarget({ booking: b, newStatus: e.target.value })
                      }
                      className="appearance-none rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3 py-1.5 pr-7 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden"
                    >
                      {availableStatuses
                        .filter((s) => s.value !== "all")
                        .map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 shrink-0 text-[#8c8478]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {b.phone && (
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
                            `Hello ${b.business_name}, contacting you regarding your Sign Board order with Sivagangai Sign Board.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 items-center justify-center rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf]"
                        >
                          WA
                        </a>
                      </>
                    )}
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
            ))
          )}
        </div>

        {/* 5. Pagination */}
        {filteredBookings.length > 0 && (
          <div className="border-t border-[#f2ece2]">
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
              recordLabel="orders"
              className="border-t-0"
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <SignboardDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChangeClick={(booking, newStatus) =>
          setStatusChangeTarget({ booking, newStatus })
        }
        onDeleteClick={(booking) => {
          setSelectedBooking(null);
          setDeleteTarget(booking);
        }}
      />

      {/* Status Change Confirmation */}
      <ConfirmationModal
        isOpen={statusChangeTarget !== null}
        title="Confirm Status Change"
        description={`Are you sure you want to change the status of ${statusChangeTarget?.booking.business_name}'s order to "${statusChangeTarget?.newStatus}"?`}
        confirmLabel="Update Status"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={executeStatusChange}
        onCancel={() => setStatusChangeTarget(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Signboard Order"
        description={`Are you sure you want to permanently delete the order for ${deleteTarget?.business_name}? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
