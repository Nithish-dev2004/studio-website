"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Download,
  Eye,
  Mail,
  Phone,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import EventConsultationDetailModal, {
  EventConsultationItem,
} from "./EventConsultationDetailModal";
import StatusBadge from "./StatusBadge";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import {
  deleteEventConsultationAction,
  updateEventConsultationStatusAction,
} from "@/app/admin/actions";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

const availableStatuses = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

interface EventConsultationsTableProps {
  initialConsultations: EventConsultationItem[];
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
  const executeStatusChange = async () => {
    if (!statusChangeTarget) return;
    setIsProcessing(true);

    try {
      const res = await updateEventConsultationStatusAction(
        statusChangeTarget.consultation.id,
        statusChangeTarget.newStatus,
      );

      if (!res.ok) {
        showToast(res.error || "Failed to update status", "error");
      } else {
        setConsultations((prev) =>
          prev.map((c) =>
            c.id === statusChangeTarget.consultation.id
              ? { ...c, status: statusChangeTarget.newStatus, updated_at: new Date().toISOString() }
              : c,
          ),
        );
        if (selectedConsultation && selectedConsultation.id === statusChangeTarget.consultation.id) {
          setSelectedConsultation((prev) =>
            prev ? { ...prev, status: statusChangeTarget.newStatus } : null,
          );
        }
        showToast(res.message || "Status updated.");
      }
    } catch {
      showToast("Network error updating status", "error");
    } finally {
      setIsProcessing(false);
      setStatusChangeTarget(null);
    }
  };

  // Delete
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);

    try {
      const res = await deleteEventConsultationAction(deleteTarget.id);
      if (!res.ok) {
        showToast(res.error || "Failed to delete consultation", "error");
      } else {
        setConsultations((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        if (selectedConsultation && selectedConsultation.id === deleteTarget.id) {
          setSelectedConsultation(null);
        }
        showToast("Consultation deleted.");
      }
    } catch {
      showToast("Network error deleting consultation", "error");
    } finally {
      setIsProcessing(false);
      setDeleteTarget(null);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredConsultations.length === 0) {
      showToast("No data to export", "error");
      return;
    }

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
    showToast("CSV export downloaded successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Event Consultations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sivagangai Events inquiries for weddings, receptions, sangeet, and corporate functions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={exportToCSV} className="flex items-center gap-2 text-xs h-9 px-3">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-hidden"
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
            <select
              value={selectedEventType}
              onChange={(e) => {
                setSelectedEventType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Event Types</option>
              {distinctEventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-hidden"
              title="Filter by event date from"
            />
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "event_asc" | "event_desc" | "created_desc")
              }
              className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="event_asc">Event Date (Soonest)</option>
              <option value="event_desc">Event Date (Latest)</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredConsultations.length}</strong> inquiries
            {filteredConsultations.length !== consultations.length && ` (filtered from ${consultations.length})`}
          </span>

          {(searchQuery || selectedStatus !== "all" || selectedEventType !== "all" || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedEventType("all");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              className="text-accent underline hover:opacity-80"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Client</th>
                <th className="px-3 py-3.5">Contact</th>
                <th className="px-3 py-3.5">Event Type</th>
                <th className="px-3 py-3.5">Event Date</th>
                <th className="px-3 py-3.5">Guests</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedConsultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-medium text-foreground">No event consultations found</p>
                    <p className="text-xs">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedConsultations.map((c) => {
                  const hasConflict =
                    c.status === "confirmed" &&
                    !!c.event_date &&
                    (confirmedDateMap.get(c.event_date)?.length || 0) > 1;

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-muted/20">
                      <td className="py-4 pl-6 pr-3">
                        <div className="font-semibold text-card-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {c.id.slice(0, 8)}</div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="text-xs font-medium text-card-foreground">{c.phone}</div>
                        {c.email && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {c.email}
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          {c.phone && c.phone !== "[Encrypted]" && (
                            <>
                              <a
                                href={formatTelLink(c.phone)}
                                className="text-muted-foreground hover:text-accent"
                                title="Call client"
                              >
                                <Phone className="h-3 w-3" />
                              </a>
                              <a
                                href={formatWhatsAppLink(
                                  c.phone,
                                  `Hello ${c.name}, contacting you regarding your event inquiry with Sivagangai Events.`,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-whatsapp"
                                title="WhatsApp"
                              >
                                <span className="text-[10px] font-semibold">WA</span>
                              </a>
                            </>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="text-muted-foreground hover:text-accent"
                              title="Send Email"
                            >
                              <Mail className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="text-xs font-medium text-foreground">{c.event_type}</div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            {c.event_date
                              ? new Date(c.event_date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "TBD"}
                          </span>
                        </div>
                        {hasConflict && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-destructive">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>Date Collision</span>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 text-xs text-muted-foreground">
                        {c.guest_count || "Not specified"}
                      </td>

                      <td className="px-3 py-4">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            setStatusChangeTarget({ consultation: c, newStatus: e.target.value })
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:border-accent focus:border-accent focus:outline-hidden"
                        >
                          {availableStatuses
                            .filter((s) => s.value !== "all")
                            .map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedConsultation(c)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="rounded-lg p-1.5 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Consultation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-border">
          {paginatedConsultations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">No event consultations found</p>
            </div>
          ) : (
            paginatedConsultations.map((c) => {
              const hasConflict =
                c.status === "confirmed" &&
                !!c.event_date &&
                (confirmedDateMap.get(c.event_date)?.length || 0) > 1;

              return (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground text-sm">{c.name}</h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 text-accent" />
                        <span>{c.event_date || "Date TBD"}</span>
                        <span>&bull;</span>
                        <span>{c.event_type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={c.status} />
                      {hasConflict && (
                        <span className="text-[10px] font-bold text-destructive">Conflict Date</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs space-y-1">
                    <div className="text-muted-foreground">
                      Phone: <span className="font-semibold text-foreground">{c.phone}</span>
                    </div>
                    {c.guest_count && (
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{c.guest_count}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedConsultation(c)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        Details
                      </button>
                      {c.phone && c.phone !== "[Encrypted]" && (
                        <a
                          href={formatTelLink(c.phone)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Call
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={c.status}
                        onChange={(e) =>
                          setStatusChangeTarget({ consultation: c, newStatus: e.target.value })
                        }
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
                      >
                        {availableStatuses
                          .filter((s) => s.value !== "all")
                          .map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                        aria-label="Delete consultation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {filteredConsultations.length > 0 && (
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
          />
        )}
      </div>

      {/* Detail Modal */}
      <EventConsultationDetailModal
        consultation={selectedConsultation}
        hasConflict={
          selectedConsultation?.status === "confirmed" &&
          !!selectedConsultation.event_date &&
          (confirmedDateMap.get(selectedConsultation.event_date)?.length || 0) > 1
        }
        onClose={() => setSelectedConsultation(null)}
        onStatusChangeClick={(consultation, newStatus) =>
          setStatusChangeTarget({ consultation, newStatus })
        }
        onDeleteClick={(consultation) => setDeleteTarget(consultation)}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusChangeTarget !== null}
        title="Confirm Status Change"
        description={`Are you sure you want to change the status of inquiry for "${
          statusChangeTarget?.consultation.name
        }" to "${statusChangeTarget?.newStatus}"?`}
        confirmLabel="Update Status"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={executeStatusChange}
        onCancel={() => setStatusChangeTarget(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Event Consultation"
        description={`Are you sure you want to delete the consultation for "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Consultation"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
