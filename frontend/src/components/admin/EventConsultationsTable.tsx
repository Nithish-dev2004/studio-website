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
import ConfirmationModal from "./ConfirmationModal";
import EventConsultationDetailModal, {
  EventConsultationItem,
} from "./EventConsultationDetailModal";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import {
  deleteEventConsultationAction,
  updateEventConsultationStatusAction,
} from "@/app/admin/actions";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

const availableStatuses = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface EventConsultationsTableProps {
  initialConsultations: EventConsultationItem[];
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "TBD";
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

function getRelativeDays(dateStr?: string | null): string {
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

export default function EventConsultationsTable({
  initialConsultations,
}: EventConsultationsTableProps) {
  const [consultations, setConsultations] = useState<EventConsultationItem[]>(initialConsultations);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"event_asc" | "event_desc" | "created_desc">("event_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals & Feedback
  const [selectedConsultation, setSelectedConsultation] = useState<EventConsultationItem | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    consultation: EventConsultationItem;
    newStatus: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventConsultationItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useAdminToast();

  // Status counts for top summary pill badges
  const statusCounts = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let contacted = 0;
    consultations.forEach((c) => {
      if (c.status === "pending") pending++;
      else if (c.status === "confirmed") confirmed++;
      else if (c.status === "contacted") contacted++;
    });
    return { pending, confirmed, contacted };
  }, [consultations]);

  // Distinct Event Types
  const distinctEventTypes = useMemo(() => {
    const set = new Set<string>();
    consultations.forEach((c) => {
      if (c.event_type) set.add(c.event_type);
    });
    return Array.from(set).sort();
  }, [consultations]);

  // Date collisions for confirmed events
  const confirmedDateMap = useMemo(() => {
    const map = new Map<string, EventConsultationItem[]>();
    consultations.forEach((c) => {
      if (c.status === "confirmed" && c.event_date) {
        const list = map.get(c.event_date) || [];
        list.push(c);
        map.set(c.event_date, list);
      }
    });
    return map;
  }, [consultations]);

  // Filter & Sort
  const filteredConsultations = useMemo(() => {
    return consultations
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            item.name.toLowerCase().includes(q) ||
            item.phone.toLowerCase().includes(q) ||
            (item.email && item.email.toLowerCase().includes(q)) ||
            item.event_type.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q));
          if (!match) return false;
        }

        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }

        if (selectedEventType !== "all" && item.event_type !== selectedEventType) {
          return false;
        }

        if (startDate && (!item.event_date || item.event_date < startDate)) {
          return false;
        }

        if (endDate && (!item.event_date || item.event_date > endDate)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "event_asc") {
          if (!a.event_date) return 1;
          if (!b.event_date) return -1;
          return a.event_date.localeCompare(b.event_date);
        }
        if (sortBy === "event_desc") {
          if (!a.event_date) return 1;
          if (!b.event_date) return -1;
          return b.event_date.localeCompare(a.event_date);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [consultations, searchQuery, selectedStatus, selectedEventType, startDate, endDate, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredConsultations.length / pageSize) || 1;
  const paginatedConsultations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredConsultations.slice(start, start + pageSize);
  }, [filteredConsultations, currentPage, pageSize]);

  // Status Change
  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    setIsProcessing(true);
    const { consultation, newStatus } = statusChangeTarget;
    const res = await updateEventConsultationStatusAction(consultation.id, newStatus);
    setIsProcessing(false);
    setStatusChangeTarget(null);

    if (res.ok) {
      setConsultations((prev) =>
        prev.map((c) =>
          c.id === consultation.id
            ? { ...c, status: newStatus, updated_at: new Date().toISOString() }
            : c,
        ),
      );
      if (selectedConsultation && selectedConsultation.id === consultation.id) {
        setSelectedConsultation((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Status updated to "${newStatus}".`, "success");
    } else {
      showToast(res.error || "Failed to update status.", "error");
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    const targetId = deleteTarget.id;
    const res = await deleteEventConsultationAction(targetId);
    setIsProcessing(false);
    setDeleteTarget(null);

    if (res.ok) {
      setConsultations((prev) => prev.filter((c) => c.id !== targetId));
      if (selectedConsultation && selectedConsultation.id === targetId) {
        setSelectedConsultation(null);
      }
      showToast("Consultation inquiry deleted.", "success");
    } else {
      showToast(res.error || "Failed to delete inquiry.", "error");
    }
  };

  const handleFilterReset = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedEventType("all");
    setStartDate("");
    setEndDate("");
    setSortBy("event_asc");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Phone",
      "Email",
      "Event Type",
      "Event Date",
      "Guest Count",
      "Status",
      "Notes",
      "Created At",
    ];

    const rows = filteredConsultations.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${c.event_type.replace(/"/g, '""')}"`,
      c.event_date || "",
      `"${c.guest_count || ""}"`,
      c.status,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      c.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `event_consultations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV export downloaded successfully.", "success");
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
            Event Consultations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            Sivagangai Events inquiries for weddings, receptions, sangeet, and corporate functions.
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
              placeholder="Search by client name, email, phone, notes..."
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
            selectedEventType !== "all" ||
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

        {/* Filter controls row with uppercase titles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
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
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            >
              {availableStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              EVENT TYPE
            </label>
            <select
              value={selectedEventType}
              onChange={(e) => {
                setSelectedEventType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="all">All Event Types</option>
              {distinctEventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              FROM EVENT DATE
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

          {/* Date Range: To */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              TO EVENT DATE
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
              SORT BY
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "event_asc" | "event_desc" | "created_desc")
              }
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="event_asc">Event Date (Earliest first)</option>
              <option value="event_desc">Event Date (Latest first)</option>
              <option value="created_desc">Inquiry Created (Newest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Bookings Count Summary & Status Badges Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="text-xs text-[#8c8478]">
          Showing <strong className="text-[#1a1714] font-semibold">{filteredConsultations.length}</strong> inquiries
        </div>

        {/* Top Right Status Badges matching screenshot */}
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
              setSelectedStatus((prev) => (prev === "contacted" ? "all" : "contacted"));
              setCurrentPage(1);
            }}
            title="Filter by Contacted"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === "contacted"
                ? "bg-[#e8f0fe] text-[#1a73e8] border-2 border-[#1a73e8] shadow-xs"
                : "bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] hover:border-[#1a73e8]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
            <span>{statusCounts.contacted} contacted</span>
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
                  CLIENT &amp; CONTACT
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  EVENT TYPE
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  EVENT DATE
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  GUEST COUNT
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
              {paginatedConsultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7c756c]">
                    <Calendar className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
                    <p className="font-semibold text-[#1a1714]">No event consultations found</p>
                    <p className="mt-1 text-xs text-[#7c756c]">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedConsultations.map((c) => {
                  const hasConflict =
                    c.status === "confirmed" &&
                    !!c.event_date &&
                    (confirmedDateMap.get(c.event_date)?.length || 0) > 1;
                  const relativeText = getRelativeDays(c.event_date);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-[#faf7f2]/90 ${
                        hasConflict ? "bg-red-50/50" : ""
                      }`}
                    >
                      {/* Client & Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                            {getInitial(c.name)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1f1b16] leading-tight">{c.name}</div>
                            <div className="text-xs text-[#8c8478] flex flex-col gap-0.5 mt-0.5">
                              {c.email && <span className="truncate max-w-[170px]">{c.email}</span>}
                              <span className="font-mono">{c.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td className="px-5 py-4 font-semibold text-sm text-[#2d271f]">
                        {c.event_type}
                      </td>

                      {/* Event Date */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm text-[#1f1b16] leading-tight whitespace-nowrap">
                          {formatDisplayDate(c.event_date)}
                        </div>
                        {relativeText && (
                          <div className="text-xs font-semibold text-[#b45309] mt-0.5">
                            {relativeText}
                          </div>
                        )}
                        {hasConflict && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Date Collision</span>
                          </div>
                        )}
                      </td>

                      {/* Guest Count */}
                      <td className="px-5 py-4 text-xs font-medium text-[#5c5449]">
                        {c.guest_count ? `${c.guest_count} guests` : <span className="text-[#9e968b]">Not specified</span>}
                      </td>

                      {/* Status Dropdown Pill with Chevron */}
                      <td className="px-5 py-4">
                        <div className="relative inline-flex items-center">
                          <select
                            value={c.status}
                            onChange={(e) =>
                              setStatusChangeTarget({ consultation: c, newStatus: e.target.value })
                            }
                            className={`appearance-none rounded-xl border px-3.5 py-1.5 pr-8 text-xs font-semibold capitalize cursor-pointer focus:outline-hidden transition-all shadow-2xs ${
                              c.status === "confirmed"
                                ? "bg-[#e8f5ec] border-[#c4e5ce] text-[#1e7e45] hover:bg-[#d8eedf]"
                                : c.status === "contacted"
                                ? "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8] hover:bg-[#dbe7fd]"
                                : c.status === "cancelled"
                                ? "bg-[#fdeeee] border-[#f0c8c8] text-[#c53030] hover:bg-[#fadcdc]"
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
                              c.status === "confirmed"
                                ? "text-[#1e7e45]"
                                : c.status === "contacted"
                                ? "text-[#1a73e8]"
                                : c.status === "cancelled"
                                ? "text-[#c53030]"
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
                            href={c.phone ? formatTelLink(c.phone) : undefined}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white transition-colors ${
                              c.phone
                                ? "text-[#735b38] hover:bg-[#f5ede0] hover:border-[#dbcbb4] cursor-pointer"
                                : "opacity-40 pointer-events-none"
                            }`}
                            title={`Call ${c.phone}`}
                          >
                            <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                          </a>

                          {/* WhatsApp */}
                          {c.phone ? (
                            <a
                              href={formatWhatsAppLink(
                                c.phone,
                                `Hello ${c.name}, contacting you regarding your event inquiry with Sivagangai Events.`,
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

                          {/* Email */}
                          {c.email ? (
                            <a
                              href={`mailto:${c.email}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-colors cursor-pointer"
                              title={`Email ${c.email}`}
                            >
                              <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
                            </a>
                          ) : null}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fcd8d8] bg-white text-[#dc2626] hover:bg-[#fdeeee] hover:border-[#fca5a5] transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
                          </button>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedConsultation(c)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd3c4] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#c5b9a5] transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#4a3f35]" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-[#f2ece2]">
          {paginatedConsultations.length === 0 ? (
            <div className="p-8 text-center text-[#7c756c]">
              <Calendar className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
              <p className="font-semibold text-[#1a1714]">No event consultations found</p>
            </div>
          ) : (
            paginatedConsultations.map((c) => {
              const hasConflict =
                c.status === "confirmed" &&
                !!c.event_date &&
                (confirmedDateMap.get(c.event_date)?.length || 0) > 1;
              const relativeText = getRelativeDays(c.event_date);

              return (
                <div key={c.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                        {getInitial(c.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1f1b16] text-sm leading-tight">{c.name}</h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#8c8478]">
                          <Calendar className="h-3 w-3 text-[#a87f32]" />
                          <span>{formatDisplayDate(c.event_date)}</span>
                          {relativeText && (
                            <span className="font-semibold text-[#b45309]">({relativeText})</span>
                          )}
                          <span>&bull;</span>
                          <span className="font-semibold text-[#2d271f]">{c.event_type}</span>
                        </div>
                      </div>
                    </div>
                    {hasConflict && (
                      <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                        Collision
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-3 text-xs space-y-1">
                    <div className="text-[#5c5449]">
                      Phone: <span className="font-semibold text-[#1a1714]">{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="text-[#5c5449]">
                        Email: <span className="text-[#1a1714]">{c.email}</span>
                      </div>
                    )}
                    {c.guest_count && (
                      <div className="text-[#5c5449]">
                        Guests: <span className="text-[#1a1714]">{c.guest_count}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="relative inline-flex items-center">
                      <select
                        value={c.status}
                        onChange={(e) =>
                          setStatusChangeTarget({ consultation: c, newStatus: e.target.value })
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
                      {c.phone && (
                        <>
                          <a
                            href={formatTelLink(c.phone)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0]"
                            title="Call"
                          >
                            <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                          </a>
                          <a
                            href={formatWhatsAppLink(
                              c.phone,
                              `Hello ${c.name}, contacting you regarding your event inquiry with Sivagangai Events.`,
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
                        onClick={() => setSelectedConsultation(c)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#dcd3c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0]"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#4a3f35]" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Pagination */}
        {filteredConsultations.length > 0 && (
          <div className="border-t border-[#f2ece2]">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRecords={filteredConsultations.length}
              currentCount={paginatedConsultations.length}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              recordLabel="inquiries"
              className="border-t-0"
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <EventConsultationDetailModal
        consultation={selectedConsultation}
        hasConflict={Boolean(
          selectedConsultation?.status === "confirmed" &&
            selectedConsultation?.event_date &&
            (confirmedDateMap.get(selectedConsultation.event_date)?.length || 0) > 1,
        )}
        onClose={() => setSelectedConsultation(null)}
        onStatusChangeClick={(c, newStatus) =>
          setStatusChangeTarget({ consultation: c, newStatus })
        }
        onDeleteClick={(c) => {
          setSelectedConsultation(null);
          setDeleteTarget(c);
        }}
      />

      {/* Status Change Confirmation */}
      <ConfirmationModal
        isOpen={statusChangeTarget !== null}
        title="Confirm Status Change"
        description={`Are you sure you want to change the status of ${statusChangeTarget?.consultation.name}'s inquiry to "${statusChangeTarget?.newStatus}"?`}
        confirmLabel="Update Status"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusChangeTarget(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Consultation Inquiry"
        description={`Are you sure you want to permanently delete the inquiry for ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
