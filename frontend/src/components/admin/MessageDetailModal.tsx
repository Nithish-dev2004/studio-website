"use client";

import React from "react";
import { Mail, MessageSquare, Phone, Trash2, User, X } from "lucide-react";
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

      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="message-detail-title" className="text-xl font-bold text-card-foreground">
                Inquiry Message
              </h2>
              {message.is_read ? (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Read
                </span>
              ) : (
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  New / Unread
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Received on {new Date(message.created_at).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sender Information */}
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <User className="h-4 w-4 text-accent" />
            <span>{message.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-accent" />
              <a href={`mailto:${message.email}`} className="text-foreground hover:underline">
                {message.email}
              </a>
            </div>
            {message.phone !== "Not provided" && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-accent" />
                <span>{message.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Full Message Text */}
        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </h3>
          <p className="mt-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {message.message}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onToggleRead(message, !message.is_read)}
              className="text-xs"
            >
              {message.is_read ? "Mark as Unread" : "Mark as Read"}
            </Button>

            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(
                "Reply from Sivagangai Stories",
              )}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>Reply by Email</span>
            </a>

            {message.phone !== "Not provided" && (
              <>
                <a
                  href={formatTelLink(message.phone)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  <span>Call</span>
                </a>
                <a
                  href={formatWhatsAppLink(
                    message.phone,
                    `Hello ${message.name}, replying to your message sent to Sivagangai Stories.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-3 py-2 text-xs font-medium text-whatsapp hover:bg-whatsapp/20"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => onDeleteClick(message)}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
