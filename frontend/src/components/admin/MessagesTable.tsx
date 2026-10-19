"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Eye,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  X,
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

export default function MessagesTable({ initialMessages }: MessagesTableProps) {
  const [messages, setMessages] = useState<AdminMessageItem[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [sortBy, setSortBy] = useState<"created_desc" | "created_asc">("created_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [selectedMessage, setSelectedMessage] = useState<AdminMessageItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMessageItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useAdminToast();

  const unreadCount = useMemo(() => messages.filter((m) => !m.is_read).length, [messages]);
  const readCount = useMemo(() => messages.filter((m) => m.is_read).length, [messages]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages
      .filter((m) => {
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
      })
      .sort((a, b) => {
        if (sortBy === "created_asc") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [messages, searchQuery, filterRead, sortBy]);

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

  const handleFilterReset = () => {
    setSearchQuery("");
    setFilterRead("all");
    setSortBy("created_desc");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (filteredMessages.length === 0) {
      showToast("No messages to export", "error");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Status", "Message", "Created At"];
    const rows = filteredMessages.map((m) => [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.email}"`,
      `"${m.phone}"`,
      m.is_read ? "Read" : "Unread",
      `"${m.message.replace(/"/g, '""')}"`,
      m.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_messages_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Message Box
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            Review and respond to client inquiries submitted through the contact page.
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
              placeholder="Search by sender name, email, phone, message content..."
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

          {(searchQuery || filterRead !== "all") && (
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#8c8478] mb-1 text-[10.5px]">
              STATUS
            </label>
            <select
              value={filterRead}
              onChange={(e) => {
                setFilterRead(e.target.value as "all" | "unread" | "read");
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="all">All Messages ({messages.length})</option>
              <option value="unread">Unread Only ({unreadCount})</option>
              <option value="read">Read ({readCount})</option>
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
              <option value="created_desc">Newest Messages</option>
              <option value="created_asc">Oldest Messages</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Bookings Count Summary & Status Badges Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="text-xs text-[#8c8478]">
          Showing <strong className="text-[#1a1714] font-semibold">{filteredMessages.length}</strong> messages
        </div>

        {/* Top Right Status Badges matching screenshot */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setFilterRead((prev) => (prev === "unread" ? "all" : "unread"));
              setCurrentPage(1);
            }}
            title="Filter by Unread"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              filterRead === "unread"
                ? "bg-[#faeed6] text-[#b45309] border-2 border-[#b45309] shadow-xs"
                : "bg-[#faeed6] text-[#b45309] border border-[#f5d9a8] hover:border-[#b45309]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
            <span>{unreadCount} unread</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterRead((prev) => (prev === "read" ? "all" : "read"));
              setCurrentPage(1);
            }}
            title="Filter by Read"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              filterRead === "read"
                ? "bg-[#e6f4ea] text-[#137333] border-2 border-[#137333] shadow-xs"
                : "bg-[#e6f4ea] text-[#137333] border border-[#ceead6] hover:border-[#137333]/60"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" />
            <span>{readCount} read</span>
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
                  SENDER &amp; CONTACT
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  MESSAGE PREVIEW
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
              {paginatedMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7c756c]">
                    <MessageSquare className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
                    <p className="font-semibold text-[#1a1714]">No messages found</p>
                    <p className="mt-1 text-xs text-[#7c756c]">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedMessages.map((m) => (
                  <tr
                    key={m.id}
                    className={`transition-colors hover:bg-[#faf7f2]/90 ${
                      !m.is_read ? "bg-[#fcfaf7]" : ""
                    }`}
                  >
                    {/* Sender & Contact */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                          {getInitial(m.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1f1b16] leading-tight">{m.name}</span>
                            {!m.is_read && (
                              <span className="h-2 w-2 rounded-full bg-[#b45309]" title="Unread" />
                            )}
                          </div>
                          <div className="text-xs text-[#8c8478] flex flex-col gap-0.5 mt-0.5">
                            <span className="truncate max-w-[170px]">{m.email}</span>
                            {m.phone !== "Not provided" && (
                              <span className="font-mono">{m.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td className="px-5 py-4 max-w-sm">
                      <p className="line-clamp-2 text-xs text-[#5c5449] leading-relaxed">
                        {m.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs font-medium text-[#5c5449] whitespace-nowrap">
                      {formatDisplayDate(m.created_at)}
                    </td>

                    {/* Status Toggle Pill */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleRead(m, !m.is_read)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
                          m.is_read
                            ? "bg-[#e8f5ec] border border-[#c4e5ce] text-[#1e7e45] hover:bg-[#d8eedf]"
                            : "bg-[#faeed6] border border-[#f5d9a8] text-[#b45309] hover:bg-[#f6e4c0]"
                        }`}
                        title={m.is_read ? "Click to mark unread" : "Click to mark read"}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            m.is_read ? "bg-[#1e7e45]" : "bg-[#b45309]"
                          }`}
                        />
                        <span>{m.is_read ? "Read" : "Unread"}</span>
                      </button>
                    </td>

                    {/* Quick Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Read */}
                        <button
                          type="button"
                          onClick={() => handleToggleRead(m, !m.is_read)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] transition-colors cursor-pointer"
                          title={m.is_read ? "Mark unread" : "Mark read"}
                        >
                          {m.is_read ? (
                            <MailOpen className="h-3.5 w-3.5 text-[#8c734b]" />
                          ) : (
                            <Mail className="h-3.5 w-3.5 text-[#b45309]" />
                          )}
                        </button>

                        {/* Call */}
                        {m.phone && m.phone !== "Not provided" && (
                          <a
                            href={formatTelLink(m.phone)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] transition-colors"
                            title={`Call ${m.phone}`}
                          >
                            <Phone className="h-3.5 w-3.5 text-[#8c734b]" />
                          </a>
                        )}

                        {/* WhatsApp */}
                        {m.phone && m.phone !== "Not provided" && (
                          <a
                            href={formatWhatsAppLink(
                              m.phone,
                              `Hello ${m.name}, reaching out regarding your inquiry to Sivagangai Stories.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 items-center justify-center rounded-lg border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 text-xs font-bold text-[#1e7e45] hover:bg-[#d8eedf] transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            WA
                          </a>
                        )}

                        {/* Email */}
                        <a
                          href={`mailto:${m.email}?subject=Regarding your message to Sivagangai Stories`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#735b38] hover:bg-[#f5ede0] transition-colors"
                          title={`Email ${m.email}`}
                        >
                          <Mail className="h-3.5 w-3.5 text-[#8c734b]" />
                        </a>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(m)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fcd8d8] bg-white text-[#dc2626] hover:bg-[#fdeeee] transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#dc2626]" />
                        </button>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMessage(m)}
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
          {paginatedMessages.length === 0 ? (
            <div className="p-8 text-center text-[#7c756c]">
              <MessageSquare className="mx-auto h-8 w-8 text-[#8c8478]/40 mb-2" />
              <p className="font-semibold text-[#1a1714]">No messages found</p>
            </div>
          ) : (
            paginatedMessages.map((m) => (
              <div key={m.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                      {getInitial(m.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1f1b16] text-sm leading-tight">{m.name}</h3>
                      <div className="text-xs text-[#8c8478] mt-0.5">{m.email}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      m.is_read
                        ? "bg-[#e8f5ec] text-[#1e7e45] border border-[#c4e5ce]"
                        : "bg-[#faeed6] text-[#b45309] border border-[#f5d9a8]"
                    }`}
                  >
                    {m.is_read ? "Read" : "Unread"}
                  </span>
                </div>

                <div className="rounded-xl border border-[#ede5d8] bg-[#fcfaf7] p-3 text-xs text-[#5c5449] line-clamp-3">
                  {m.message}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8c8478]">{formatDisplayDate(m.created_at)}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(m, !m.is_read)}
                      className="rounded-lg border border-[#e8dfcf] bg-white p-1.5 text-[#735b38] hover:bg-[#f5ede0]"
                      title="Toggle read"
                    >
                      {m.is_read ? <MailOpen className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5 text-[#b45309]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(m)}
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
        {filteredMessages.length > 0 && (
          <div className="border-t border-[#f2ece2]">
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
      </div>

      {/* Detail Modal */}
      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onToggleRead={handleToggleRead}
        onDeleteClick={(m) => {
          setSelectedMessage(null);
          setDeleteTarget(m);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Message"
        description={`Are you sure you want to permanently delete the message from ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
