"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Mail,
  MessageSquareHeart,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import FeedbackDetailModal from "./FeedbackDetailModal";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import StarRating from "@/components/feedback/StarRating";
import { deleteFeedbackAction, updateFeedbackStatusAction } from "@/app/admin/actions";
import { cleanFeedbackMessage } from "@/lib/validation";
import type { AdminFeedbackItem, FeedbackStatus } from "@/types";

interface FeedbackTableProps {
  feedback: AdminFeedbackItem[];
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function FeedbackTable({ feedback: initialFeedback }: FeedbackTableProps) {
  const { showToast } = useAdminToast();
  const [feedbackList, setFeedbackList] = useState<AdminFeedbackItem[]>(initialFeedback);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<AdminFeedbackItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdminFeedbackItem | null>(null);

  const [isPending, startTransition] = useTransition();

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: feedbackList.length,
      pending: feedbackList.filter((f) => f.status === "pending").length,
      approved: feedbackList.filter((f) => f.status === "approved").length,
      hidden: feedbackList.filter((f) => f.status === "hidden").length,
    };
  }, [feedbackList]);

  // Filtering & Sorting
  const filtered = useMemo(() => {
    let result = feedbackList.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Rating filter
      if (ratingFilter !== "all" && String(item.rating) !== ratingFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(term);
        const emailMatch = item.email ? item.email.toLowerCase().includes(term) : false;
        const msgMatch = item.message.toLowerCase().includes(term);
        const serviceMatch = item.service ? item.service.toLowerCase().includes(term) : false;
        return nameMatch || emailMatch || msgMatch || serviceMatch;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "rating_high") {
        return b.rating - a.rating;
      }
      if (sortBy === "rating_low") {
        return a.rating - b.rating;
      }
      // default: newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [feedbackList, statusFilter, ratingFilter, searchTerm, sortBy]);

  // Pagination
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    startTransition(async () => {
      const res = await updateFeedbackStatusAction(id, newStatus);
      if (res.ok && res.message) {
        showToast(res.message, "success");
        setFeedbackList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id;
    startTransition(async () => {
      const res = await deleteFeedbackAction(targetId);
      if (res.ok && res.message) {
        showToast(res.message, "success");
        setFeedbackList((prev) => prev.filter((item) => item.id !== targetId));
        if (selectedItem && selectedItem.id === targetId) {
          setSelectedItem(null);
        }
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        showToast(res.error || "Failed to delete feedback", "error");
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRatingFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (filtered.length === 0) {
      showToast("No feedback entries to export", "error");
      return;
    }

    const headers = ["ID", "Client Name", "Email", "Rating", "Service", "Status", "Review Message", "Date"];
    const rows = filtered.map((f) => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.email || ""}"`,
      f.rating,
      `"${f.service || ""}"`,
      f.status,
      `"${f.message.replace(/"/g, '""')}"`,
      f.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `client_feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Feedback exported to CSV.");
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
            Feedback &amp; Testimonials
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            Review, approve, or hide customer testimonials before they appear on the public website.
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
              placeholder="Search by client name, email, service, review text..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pl-10 pr-9 text-xs text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e968b] hover:text-[#1a1714] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {(searchTerm || statusFilter !== "all" || ratingFilter !== "all" || sortBy !== "newest") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#a87f32] hover:underline px-2 py-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Filter controls row with uppercase titles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="all">All Statuses ({counts.all})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="approved">Approved ({counts.approved})</option>
              <option value="hidden">Hidden ({counts.hidden})</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              RATING
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              SORT BY
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Summary & Status Badges Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="text-xs text-[#8c8478]">
          Showing <strong className="text-[#1a1714] font-semibold">{filtered.length}</strong> reviews
        </div>

        {/* Top Right Status Badges matching screenshot */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setStatusFilter((prev) => (prev === "pending" ? "all" : "pending"));
              setCurrentPage(1);
            }}
            title="Filter by Pending"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "pending"
                ? "bg-[#faeed6] text-[#b45309] border-2 border-[#b45309] shadow-xs"
                : "bg-[#faeed6] text-[#b45309] border border-[#f5d9a8] hover:border-[#b45309]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
            <span>{counts.pending} pending</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter((prev) => (prev === "approved" ? "all" : "approved"));
              setCurrentPage(1);
            }}
            title="Filter by Approved"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "approved"
                ? "bg-[#e8f5ec] text-[#137333] border-2 border-[#137333] shadow-xs"
                : "bg-[#e8f5ec] text-[#137333] border border-[#c4e5ce] hover:border-[#137333]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" />
            <span>{counts.approved} approved</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter((prev) => (prev === "hidden" ? "all" : "hidden"));
              setCurrentPage(1);
            }}
            title="Filter by Hidden"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "hidden"
                ? "bg-[#f1f3f4] text-[#5f6368] border-2 border-[#5f6368] shadow-xs"
                : "bg-[#f1f3f4] text-[#5f6368] border border-[#d8d3cb] hover:border-[#5f6368]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5f6368]" />
            <span>{counts.hidden} hidden</span>
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
                  RATING &amp; SERVICE
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  REVIEW MESSAGE
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  DATE
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
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7c756c]">
                    <MessageSquareHeart className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
                    <p className="font-semibold text-[#1a1714]">No feedback found</p>
                    <p className="mt-1 text-xs text-[#7c756c]">
                      {searchTerm || statusFilter !== "all" || ratingFilter !== "all"
                        ? "Try adjusting your search criteria or filters."
                        : "No customer feedback entries exist yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((fb) => (
                  <tr
                    key={fb.id}
                    className="transition-colors hover:bg-[#faf7f2]/90"
                  >
                    {/* Client & Contact */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                          {getInitial(fb.name)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1f1b16] leading-tight">{fb.name}</div>
                          {fb.email ? (
                            <div className="text-xs text-[#8c8478] truncate max-w-[170px] mt-0.5">
                              {fb.email}
                            </div>
                          ) : (
                            <div className="text-xs italic text-[#9e968b] mt-0.5">No email provided</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rating & Service */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <StarRating value={fb.rating} readOnly size="sm" />
                        <div>
                          {fb.service ? (
                            <span className="inline-block rounded-md border border-[#e8dfcf] bg-[#fcfaf7] px-2 py-0.5 text-[11px] font-medium capitalize text-[#6b522d]">
                              {fb.service}
                            </span>
                          ) : (
                            <span className="text-xs text-[#9e968b]">General</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Review Message */}
                    <td className="px-5 py-4 max-w-xs sm:max-w-sm">
                      <p className="line-clamp-2 text-xs text-[#5c5449] leading-relaxed">
                        {cleanFeedbackMessage(fb.message)}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs font-medium text-[#5c5449] whitespace-nowrap">
                      <div>{formatDate(fb.created_at)}</div>
                      {fb.approved_at && fb.status === "approved" && (
                        <div className="text-[10.5px] font-semibold text-[#1e7e45] mt-0.5">
                          Approved
                        </div>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {fb.status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-3 py-1 text-xs font-semibold text-[#1e7e45]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                          <span>Approved</span>
                        </span>
                      )}
                      {fb.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d9a8] bg-[#faeed6] px-3 py-1 text-xs font-semibold text-[#b45309]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
                          <span>Pending</span>
                        </span>
                      )}
                      {fb.status === "hidden" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d3cb] bg-[#f1f3f4] px-3 py-1 text-xs font-semibold text-[#5f6368]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5f6368]" />
                          <span>Hidden</span>
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {/* Approve Button */}
                        {fb.status !== "approved" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(fb.id, "approved")}
                            title="Approve & publish review"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-1 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Hide Button */}
                        {fb.status === "approved" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(fb.id, "hidden")}
                            title="Hide from website"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#d8d3cb] bg-[#f1f3f4] px-2.5 py-1 text-xs font-bold text-[#5f6368] hover:bg-[#e4e7e9] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Hide</span>
                          </button>
                        )}

                        {/* Move back to Pending if hidden */}
                        {fb.status === "hidden" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(fb.id, "pending")}
                            title="Move back to pending moderation"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Email client if email available */}
                        {fb.email && (
                          <a
                            href={`mailto:${fb.email}?subject=Thank you for your feedback at Sivagangai Stories`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] transition-colors"
                            title={`Email ${fb.email}`}
                          >
                            <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
                          </a>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            setItemToDelete(fb);
                            setDeleteModalOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fcd8d8] bg-white text-[#dc2626] hover:bg-[#fdeeee] transition-colors cursor-pointer disabled:opacity-50"
                          title="Permanently Delete Review"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
                        </button>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(fb)}
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
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-[#7c756c]">
              <MessageSquareHeart className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
              <p className="font-semibold text-[#1a1714]">No feedback found</p>
            </div>
          ) : (
            paginatedData.map((fb) => (
              <div key={fb.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                      {getInitial(fb.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1f1b16] text-sm leading-tight">{fb.name}</h3>
                      <div className="text-xs text-[#8c8478] mt-0.5">{fb.email || "No email"}</div>
                    </div>
                  </div>

                  {fb.status === "approved" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e7e45]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                      <span>Approved</span>
                    </span>
                  )}
                  {fb.status === "pending" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#f5d9a8] bg-[#faeed6] px-2.5 py-0.5 text-[11px] font-semibold text-[#b45309]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
                      <span>Pending</span>
                    </span>
                  )}
                  {fb.status === "hidden" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#d8d3cb] bg-[#f1f3f4] px-2.5 py-0.5 text-[11px] font-semibold text-[#5f6368]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5f6368]" />
                      <span>Hidden</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <StarRating value={fb.rating} readOnly size="sm" />
                  {fb.service && (
                    <span className="rounded-md border border-[#e8dfcf] bg-[#fcfaf7] px-2 py-0.5 text-[10.5px] font-medium capitalize text-[#6b522d]">
                      {fb.service}
                    </span>
                  )}
                </div>

                <p className="line-clamp-2 text-xs text-[#5c5449] leading-relaxed">
                  {cleanFeedbackMessage(fb.message)}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#f2ece2] text-xs">
                  <span className="text-[#8c8478]">{formatDate(fb.created_at)}</span>
                  <div className="flex items-center gap-1.5">
                    {fb.status !== "approved" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(fb.id, "approved")}
                        className="rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-1 text-xs font-bold text-[#1e7e45]"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(fb.id, "hidden")}
                        className="rounded-lg border border-[#d8d3cb] bg-[#f1f3f4] px-2.5 py-1 text-xs font-bold text-[#5f6368]"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedItem(fb)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#dcd3c4] bg-white px-3 py-1 text-xs font-semibold text-[#2d271f]"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 5. Pagination Footer */}
        {totalRecords > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            currentCount={paginatedData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            recordLabel="reviews"
          />
        )}
      </div>

      {/* 6. Full Feedback Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedItem}
        onClose={() => setSelectedItem(null)}
        onStatusChange={handleStatusChange}
        onDeleteClick={(fb) => {
          setItemToDelete(fb);
          setDeleteModalOpen(true);
        }}
        isPending={isPending}
      />

      {/* 7. Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Customer Feedback"
        description={`Are you sure you want to permanently delete the feedback from "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isPending) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
      />
    </div>
  );
}
