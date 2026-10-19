"use client";

import React from "react";
import { CheckCircle2, EyeOff, Mail, RotateCcw, Trash2, X } from "lucide-react";
import StarRating from "@/components/feedback/StarRating";
import { cleanFeedbackMessage } from "@/lib/validation";
import type { AdminFeedbackItem, FeedbackStatus } from "@/types";

interface FeedbackDetailModalProps {
  feedback: AdminFeedbackItem | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: FeedbackStatus) => void;
  onDeleteClick: (feedback: AdminFeedbackItem) => void;
  isPending?: boolean;
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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function FeedbackDetailModal({
  feedback,
  onClose,
  onStatusChange,
  onDeleteClick,
  isPending = false,
}: FeedbackDetailModalProps) {
  if (!feedback) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#ede5d8] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f2ece2] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="feedback-detail-title"
                className="text-xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Feedback &amp; Testimonial
              </h2>

              {feedback.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-0.5 text-xs font-semibold text-[#1e7e45]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                  <span>Approved &amp; Published</span>
                </span>
              )}
              {feedback.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d9a8] bg-[#faeed6] px-2.5 py-0.5 text-xs font-semibold text-[#b45309]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
                  <span>Pending Moderation</span>
                </span>
              )}
              {feedback.status === "hidden" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d3cb] bg-[#f1f3f4] px-2.5 py-0.5 text-xs font-semibold text-[#5f6368]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5f6368]" />
                  <span>Hidden from Public</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#7c756c]">
              Submitted on {formatDate(feedback.created_at)}
              {feedback.approved_at && feedback.status === "approved" && (
                <span> &bull; Approved on {formatDate(feedback.approved_at)}</span>
              )}
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

        {/* Client & Rating Information Box */}
        <div className="mt-5 rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-sm font-bold text-[#6b522d]">
              {getInitial(feedback.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-[#1f1b16] leading-tight">{feedback.name}</p>
              {feedback.email ? (
                <a
                  href={`mailto:${feedback.email}`}
                  className="inline-flex items-center gap-1 text-xs text-[#a87f32] hover:underline mt-0.5"
                >
                  <Mail className="h-3 w-3" />
                  <span>{feedback.email}</span>
                </a>
              ) : (
                <p className="text-xs italic text-[#9e968b]">No email provided (public reviewer)</p>
              )}
            </div>

            {/* Rating Stars Block */}
            <div className="flex flex-col items-end gap-1">
              <StarRating value={feedback.rating} readOnly size="sm" />
              <span className="text-[11px] font-semibold text-[#8c734b]">
                {feedback.rating} of 5 Stars
              </span>
            </div>
          </div>

          {feedback.service && (
            <div className="pt-2 border-t border-[#f2ece2] flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8c8478]">
                Service:
              </span>
              <span className="rounded-md border border-[#e8dfcf] bg-[#f5ede0] px-2 py-0.5 text-xs font-semibold capitalize text-[#6b522d]">
                {feedback.service}
              </span>
            </div>
          )}
        </div>

        {/* Review Message */}
        <div className="mt-5 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8c8478]">
            Customer Review
          </label>
          <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4">
            <p className="text-sm leading-relaxed text-[#2d271f] whitespace-pre-line">
              &ldquo;{cleanFeedbackMessage(feedback.message)}&rdquo;
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2ece2] pt-4">
          {/* Delete Button */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => onDeleteClick(feedback)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#fcd8d8] bg-white px-3.5 py-2 text-xs font-semibold text-[#dc2626] hover:bg-[#fdeeee] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Feedback</span>
          </button>

          {/* Status Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {feedback.status !== "approved" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onStatusChange(feedback.id, "approved")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e7e45] px-4 py-2 text-xs font-bold text-white hover:bg-[#186637] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve &amp; Publish</span>
              </button>
            )}

            {feedback.status === "approved" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onStatusChange(feedback.id, "hidden")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8d3cb] bg-[#f1f3f4] px-4 py-2 text-xs font-bold text-[#5f6368] hover:bg-[#e4e7e9] transition-colors cursor-pointer disabled:opacity-50"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide from Website</span>
              </button>
            )}

            {feedback.status === "hidden" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onStatusChange(feedback.id, "pending")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3.5 py-2 text-xs font-semibold text-[#6b522d] hover:bg-[#f5ede0] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Move to Pending</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e8dfcf] bg-white px-4 py-2 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
