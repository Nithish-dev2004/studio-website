"use client";

import React, { useMemo, useState } from "react";
import {
  Eye,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import MessageDetailModal, { AdminMessageItem } from "./MessageDetailModal";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import { deleteMessageAction, toggleMessageReadAction } from "@/app/admin/actions";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

interface MessagesTableProps {
  initialMessages: AdminMessageItem[];
}

export default function MessagesTable({ initialMessages }: MessagesTableProps) {
  const [messages, setMessages] = useState<AdminMessageItem[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [selectedMessage, setSelectedMessage] = useState<AdminMessageItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMessageItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useAdminToast();

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterRead === "unread" && m.is_read) return false;
      if (filterRead === "read" && !m.is_read) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [messages, searchQuery, filterRead]);

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / pageSize) || 1;
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMessages.slice(start, start + pageSize);
  }, [filteredMessages, currentPage, pageSize]);

  // Toggle read/unread status
  const handleToggleRead = async (message: AdminMessageItem, isRead: boolean) => {
    const res = await toggleMessageReadAction(message.id, isRead);
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_read: isRead } : m)),
      );
      if (selectedMessage && selectedMessage.id === message.id) {
        setSelectedMessage((prev) => (prev ? { ...prev, is_read: isRead } : null));
      }
      showToast(isRead ? "Marked message as read." : "Marked message as unread.", "success");
    } else {
      showToast(res.error || "Failed to update message.", "error");
    }
  };

  // Confirm delete message
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);

    const targetId = deleteTarget.id;
    const res = await deleteMessageAction(targetId);
    setIsProcessing(false);
    setDeleteTarget(null);

    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== targetId));
      if (selectedMessage && selectedMessage.id === targetId) {
        setSelectedMessage(null);
      }
      showToast("Message deleted.", "success");
    } else {
      showToast(res.error || "Failed to delete message.", "error");
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Customer Inquiries
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and respond to messages submitted through the public Contact page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/30">
            {unreadCount} Unread {unreadCount === 1 ? "Message" : "Messages"}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages by sender name, email, phone, text..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setFilterRead("all");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterRead === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterRead("unread");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterRead === "unread"
                ? "bg-accent text-accent-foreground font-semibold"
                : "border border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterRead("read");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterRead === "read"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Messages List / Table */}
      {filteredMessages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No messages found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No inquiries match your current search and filter settings.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE (Hidden on mobile) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Sender</th>
                    <th scope="col" className="px-5 py-3.5">Message Preview</th>
                    <th scope="col" className="px-5 py-3.5">Date</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedMessages.map((m) => (
                    <tr
                      key={m.id}
                      className={`transition-colors hover:bg-muted/30 ${
                        !m.is_read ? "bg-accent/5 font-medium" : ""
                      }`}
                    >
                      {/* Read status icon */}
                      <td className="px-5 py-4 w-12">
                        <button
                          type="button"
                          onClick={() => handleToggleRead(m, !m.is_read)}
                          title={m.is_read ? "Mark as unread" : "Mark as read"}
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {m.is_read ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="flex h-3 w-3 rounded-full bg-accent" />
                          )}
                        </button>
                      </td>

                      {/* Sender Details */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-card-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                        {m.phone !== "Not provided" && (
                          <div className="text-xs text-muted-foreground">{m.phone}</div>
                        )}
                      </td>

                      {/* Message preview snippet */}
                      <td className="px-5 py-4 max-w-md">
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {m.message}
                        </p>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedMessage(m)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                          {m.phone !== "Not provided" && (
                            <a
                              href={formatTelLink(m.phone)}
                              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title={`Call ${m.phone}`}
                            >
                              <Phone className="h-3.5 w-3.5 text-accent" />
                            </a>
                          )}
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent(
                              "Reply from Sivagangai Stories",
                            )}`}
                            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Reply by Email"
                          >
                            <Mail className="h-3.5 w-3.5 text-accent" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(m)}
                            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Message"
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
          </div>

          {/* MOBILE STACKED CARDS (Visible on < 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedMessages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 ${
                  !m.is_read ? "border-accent/40 bg-accent/5" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-card-foreground text-base flex items-center gap-2">
                      {m.name}
                      {!m.is_read && (
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
                    {m.phone !== "Not provided" && (
                      <p className="text-xs text-muted-foreground">{m.phone}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Message preview */}
                <p className="text-xs text-foreground line-clamp-3 bg-muted/20 p-2.5 rounded-lg border border-border/50">
                  {m.message}
                </p>

                {/* Mobile actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(m, !m.is_read)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    {m.is_read ? "Mark as unread" : "Mark as read"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(
                        "Reply from Sivagangai Stories",
                      )}`}
                      className="rounded-lg border border-border p-2 text-foreground hover:bg-muted"
                      title="Reply"
                    >
                      <Mail className="h-3.5 w-3.5 text-accent" />
                    </a>
                    {m.phone !== "Not provided" && (
                      <a
                        href={formatWhatsAppLink(
                          m.phone,
                          `Hello ${m.name}, replying to your message sent to Sivagangai Stories.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-whatsapp/30 bg-whatsapp/10 px-2 py-1.5 text-xs font-bold text-whatsapp hover:bg-whatsapp/20"
                      >
                        WA
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(m)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredMessages.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={filteredMessages.length}
                currentCount={paginatedMessages.length}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                recordLabel="messages"
                className="border-t-0"
              />
            </div>
          )}
        </>
      )}

      {/* Message Detail Modal */}
      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onToggleRead={(m, isRead) => handleToggleRead(m, isRead)}
        onDeleteClick={(m) => {
          setSelectedMessage(null);
          setDeleteTarget(m);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Message"
        description={`Are you sure you want to delete the message from ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete Message"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
