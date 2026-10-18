"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  EyeOff,
  Mail,
  MessageSquareHeart,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import StatusBadge from "./StatusBadge";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import StarRating from "@/components/feedback/StarRating";
import Card from "@/components/ui/Card";
import { deleteFeedbackAction, updateFeedbackStatusAction } from "@/app/admin/actions";
import { cleanFeedbackMessage } from "@/lib/validation";
import type { AdminFeedbackItem, FeedbackStatus } from "@/types";

interface FeedbackTableProps {
  feedback: AdminFeedbackItem[];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function FeedbackTable({ feedback }: FeedbackTableProps) {
  const { showToast } = useAdminToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItem, setSelectedItem] = useState<AdminFeedbackItem | null>(null);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdminFeedbackItem | null>(null);

  const [isPending, startTransition] = useTransition();

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: feedback.length,
      pending: feedback.filter((f) => f.status === "pending").length,
      approved: feedback.filter((f) => f.status === "approved").length,
      hidden: feedback.filter((f) => f.status === "hidden").length,
    };
  }, [feedback]);

  // Filtering & Search
  const filtered = useMemo(() => {
    return feedback.filter((item) => {
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
  }, [feedback, statusFilter, ratingFilter, searchTerm]);

  // Pagination
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedData = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    startTransition(async () => {
      const res = await updateFeedbackStatusAction(id, newStatus);
      if (res.ok && res.message) {
        showToast(res.message, "success");
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const res = await deleteFeedbackAction(itemToDelete.id);
      if (res.ok && res.message) {
        showToast(res.message, "success");
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        showToast(res.error || "Failed to delete feedback", "error");
      }
    });
  };


  return (
    <div className="space-y-6">
      {/* Header controls & Quick Filter Pills */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Status filters">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("pending");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === "pending"
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>Pending</span>
            {counts.pending > 0 && (
              <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent">
                {counts.pending}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("approved");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === "approved"
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("hidden");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === "hidden"
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Hidden ({counts.hidden})
          </button>
        </div>

        {/* Search Bar & Rating Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rating filter dropdown */}
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by rating"
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-hidden"
            />
          </div>

          {(searchTerm || statusFilter !== "all" || ratingFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRatingFilter("all");
                setCurrentPage(1);
              }}
              title="Reset all filters"
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table / Responsive Card View */}
      <Card className="overflow-hidden border-border bg-card shadow-xs">
        {paginatedData.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareHeart className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">No feedback found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {searchTerm || statusFilter !== "all" || ratingFilter !== "all"
                ? "Try adjusting your search criteria or status filter."
                : "No customer feedback entries exist yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Client</th>
                  <th className="px-4 py-3">Rating & Service</th>
                  <th className="px-4 py-3">Review Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((fb) => (
                  <tr key={fb.id} className="transition-colors hover:bg-muted/20">
                    {/* Client info */}
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="font-semibold text-foreground">{fb.name}</div>
                      {fb.email ? (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span title="Kept private from public">{fb.email}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] italic text-muted-foreground/60">No email provided</div>
                      )}
                    </td>

                    {/* Rating & Service */}
                    <td className="px-4 py-3.5">
                      <StarRating value={fb.rating} readOnly size="sm" />
                      <div className="mt-1">
                        {fb.service ? (
                          <span className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                            {fb.service}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">-</span>
                        )}
                      </div>
                    </td>

                    {/* Message */}
                    <td className="max-w-xs px-4 py-3.5 sm:max-w-sm">
                      <p className="line-clamp-2 text-foreground/90 whitespace-pre-line" title={cleanFeedbackMessage(fb.message)}>
                        {cleanFeedbackMessage(fb.message)}
                      </p>
                      {fb.message.length > 80 && (
                        <button
                          type="button"
                          onClick={() => setSelectedItem(fb)}
                          className="mt-1 text-[11px] font-medium text-accent hover:underline cursor-pointer"
                        >
                          Read full message
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={fb.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      <div>{formatDate(fb.created_at)}</div>
                      {fb.approved_at && fb.status === "approved" && (
                        <div className="text-[10px] text-success">
                          Approved {formatDate(fb.approved_at)}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right sm:px-6 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve Button */}
                        {fb.status !== "approved" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(fb.id, "approved")}
                            title="Approve and publish to website"
                            className="inline-flex items-center gap-1 rounded-md bg-success/15 border border-success/30 px-2 py-1 text-[11px] font-semibold text-success hover:bg-success/25 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Hide Button */}
                        {fb.status === "approved" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(fb.id, "hidden")}
                            title="Hide from public view"
                            className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <EyeOff className="h-3 w-3" />
                            <span>Hide</span>
                          </button>
                        )}

                        {/* Unhide / Back to Pending if hidden */}
                        {fb.status === "hidden" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(fb.id, "pending")}
                            title="Move back to pending review"
                            className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <span>To Pending</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            setItemToDelete(fb);
                            setDeleteModalOpen(true);
                          }}
                          title="Permanently delete review"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
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
            recordLabel="feedback items"
          />
        )}
      </Card>

      {/* Full Message Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-lg border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Feedback from {selectedItem.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={selectedItem.rating} readOnly size="sm" />
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {selectedItem.service && (
                <div>
                  <span className="font-medium text-muted-foreground">Service: </span>
                  <span className="font-semibold text-foreground capitalize">{selectedItem.service}</span>
                </div>
              )}
              {selectedItem.email && (
                <div>
                  <span className="font-medium text-muted-foreground">Email: </span>
                  <span className="font-semibold text-foreground">{selectedItem.email}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-muted-foreground">Submitted: </span>
                <span className="text-foreground">{formatDate(selectedItem.created_at)}</span>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3.5 text-sm leading-relaxed text-foreground whitespace-pre-line">
                {cleanFeedbackMessage(selectedItem.message)}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
