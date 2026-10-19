"use client";

import React from "react";
import { Mail, MailOpen, MessageSquare, Phone, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

export interface AdminMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface MessageDetailModalProps {
  message: AdminMessageItem | null;
  onClose: () => void;
  onToggleRead: (message: AdminMessageItem, isRead: boolean) => void;
  onDeleteClick: (message: AdminMessageItem) => void;
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
}

export default function MessageDetailModal({
  message,
  onClose,
  onToggleRead,
  onDeleteClick,
}: MessageDetailModalProps) {
  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-detail-title"
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
                id="message-detail-title"
                className="text-xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Inquiry Message
              </h2>
              {message.is_read ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-0.5 text-xs font-semibold text-[#1e7e45]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                  <span>Read</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d9a8] bg-[#faeed6] px-2.5 py-0.5 text-xs font-semibold text-[#b45309]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
                  <span>New / Unread</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#7c756c]">
              Received on {new Date(message.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
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

        {/* Sender Information */}
        <div className="mt-5 rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
              {getInitial(message.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1f1b16] leading-tight">{message.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#8c8478] mt-0.5">
                <a href={`mailto:${message.email}`} className="text-[#a87f32] hover:underline">
                  {message.email}
                </a>
                {message.phone !== "Not provided" && (
                  <span>&bull; <span className="font-mono">{message.phone}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Message Text */}
        <div className="mt-5 rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8478] flex items-center gap-2 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#a87f32]" />
            Message
          </h3>
          <p className="text-sm text-[#2d271f] whitespace-pre-wrap leading-relaxed">
            {message.message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2ece2] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {message.phone && message.phone !== "Not provided" && (
              <>
                <a
                  href={formatTelLink(message.phone)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3 py-2 text-xs font-medium text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                  <span>Call</span>
                </a>
                <a
                  href={formatWhatsAppLink(
                    message.phone,
                    `Hello ${message.name}, reaching out regarding your message to Sivagangai Stories.`,
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
              href={`mailto:${message.email}?subject=Regarding your message to Sivagangai Stories`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3 py-2 text-xs font-medium text-[#2d271f] hover:bg-[#f5ede0] hover:border-[#dbcbb4] transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
              <span>Email</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleRead(message, !message.is_read)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3 py-2 text-xs font-medium text-[#2d271f] hover:bg-[#f5ede0] transition-colors cursor-pointer"
            >
              {message.is_read ? <Mail className="h-3.5 w-3.5 text-[#8c734b]" /> : <MailOpen className="h-3.5 w-3.5 text-[#1e7e45]" />}
              <span>{message.is_read ? "Mark Unread" : "Mark Read"}</span>
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDeleteClick(message)}
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
