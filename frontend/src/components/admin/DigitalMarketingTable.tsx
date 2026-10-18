"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  Mail,
  Phone,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import DigitalMarketingDetailModal, {
  DigitalMarketingBookingItem,
} from "./DigitalMarketingDetailModal";
import StatusBadge from "./StatusBadge";
import TablePagination from "./TablePagination";
import { useAdminToast } from "./AdminToastContext";
import {
  deleteDigitalMarketingBookingAction,
  updateDigitalMarketingStatusAction,
} from "@/app/admin/actions";
import Button from "@/components/ui/Button";
import { formatTelLink, formatWhatsAppLink } from "@/lib/admin/links";

const availableStatuses = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New Request" },
  { value: "contacted", label: "Contacted" },
  { value: "audit_sent", label: "Audit Sent" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted Client" },
  { value: "closed", label: "Closed" },
];

interface DigitalMarketingTableProps {
  initialBookings: DigitalMarketingBookingItem[];
}

export default function DigitalMarketingTable({ initialBookings }: DigitalMarketingTableProps) {
  const [bookings, setBookings] = useState<DigitalMarketingBookingItem[]>(initialBookings);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"created_desc" | "created_asc">("created_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals & Feedback
  const [selectedBooking, setSelectedBooking] = useState<DigitalMarketingBookingItem | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    booking: DigitalMarketingBookingItem;
    newStatus: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DigitalMarketingBookingItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useAdminToast();

  // Distinct Plans
  const distinctPlans = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.plan) set.add(b.plan);
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
            (item.email && item.email.toLowerCase().includes(q)) ||
            item.service_interested.toLowerCase().includes(q) ||
            (item.website_url && item.website_url.toLowerCase().includes(q)) ||
            (item.plan && item.plan.toLowerCase().includes(q));
          if (!match) return false;
        }

        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }

        if (selectedPlan !== "all" && item.plan !== selectedPlan) {
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
  }, [bookings, searchQuery, selectedStatus, selectedPlan, sortBy]);

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
      const res = await updateDigitalMarketingStatusAction(
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
        showToast(res.message || "Status updated.");
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
      const res = await deleteDigitalMarketingBookingAction(deleteTarget.id);
      if (!res.ok) {
        showToast(res.error || "Failed to delete request", "error");
      } else {
        setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        if (selectedBooking && selectedBooking.id === deleteTarget.id) {
          setSelectedBooking(null);
        }
        showToast("Digital marketing request deleted.");
      }
    } catch {
      showToast("Network error deleting request", "error");
    } finally {
      setIsProcessing(false);
      setDeleteTarget(null);
    }
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
      "Email",
      "Service Focus",
      "Plan",
      "Budget",
      "Website",
      "Status",
      "Created At",
    ];

    const rows = filteredBookings.map((b) => [
      b.id,
      `"${b.business_name.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.email || ""}"`,
      `"${b.service_interested.replace(/"/g, '""')}"`,
      `"${(b.plan || "").replace(/"/g, '""')}"`,
      `"${(b.budget || "").replace(/"/g, '""')}"`,
      `"${(b.website_url || "").replace(/"/g, '""')}"`,
      b.status,
      b.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `digital_marketing_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Digital Marketing Audits
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sivagangai Digital Marketing audit requests, lead generation campaigns, and SEO inquiries.
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search business, email, phone..."
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

          {/* Plan Filter */}
          <div>
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Plans</option>
              {distinctPlans.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "created_desc" | "created_asc")}
              className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredBookings.length}</strong> inquiries
            {filteredBookings.length !== bookings.length && ` (filtered from ${bookings.length})`}
          </span>

          {(searchQuery || selectedStatus !== "all" || selectedPlan !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedPlan("all");
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
                <th className="py-3.5 pl-6 pr-3">Business</th>
                <th className="px-3 py-3.5">Contact</th>
                <th className="px-3 py-3.5">Service Interest</th>
                <th className="px-3 py-3.5">Plan / Budget</th>
                <th className="px-3 py-3.5">Website</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-medium text-foreground">No digital marketing requests found</p>
                    <p className="text-xs">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-muted/20">
                    <td className="py-4 pl-6 pr-3">
                      <div className="font-semibold text-card-foreground">{b.business_name}</div>
                      <div className="text-xs text-muted-foreground">ID: {b.id.slice(0, 8)}</div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="text-xs font-medium text-card-foreground">{b.phone}</div>
                      {b.email && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {b.email}
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        {b.phone && b.phone !== "[Encrypted]" && (
                          <>
                            <a
                              href={formatTelLink(b.phone)}
                              className="text-muted-foreground hover:text-accent"
                              title="Call"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                            <a
                              href={formatWhatsAppLink(
                                b.phone,
                                `Hello ${b.business_name}, contacting you regarding your Digital Marketing audit inquiry with Sivagangai Digital Marketing.`,
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
                        {b.email && (
                          <a
                            href={`mailto:${b.email}`}
                            className="text-muted-foreground hover:text-accent"
                            title="Send Email"
                          >
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="text-xs font-medium text-foreground">{b.service_interested}</div>
                    </td>

                    <td className="px-3 py-4 text-xs text-muted-foreground">
                      <div className="font-semibold text-foreground">{b.plan || "Free Audit"}</div>
                      <div className="text-[11px] mt-0.5">{b.budget || "Budget not specified"}</div>
                    </td>

                    <td className="px-3 py-4 text-xs">
                      {b.website_url ? (
                        <a
                          href={b.website_url.startsWith("http") ? b.website_url : `https://${b.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-accent underline hover:opacity-80 max-w-[120px] truncate"
                          title={b.website_url}
                        >
                          <span className="truncate">{b.website_url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60 italic">None</span>
                      )}
                    </td>

                    <td className="px-3 py-4">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          setStatusChangeTarget({ booking: b, newStatus: e.target.value })
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
                          onClick={() => setSelectedBooking(b)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="rounded-lg p-1.5 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Delete Request"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-border">
          {paginatedBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">No digital marketing requests found</p>
            </div>
          ) : (
            paginatedBookings.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-card-foreground text-sm">{b.business_name}</h3>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      <span>{b.service_interested}</span>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs space-y-1">
                  <div className="text-muted-foreground">
                    Phone: <span className="font-semibold text-foreground">{b.phone}</span>
                  </div>
                  {b.plan && (
                    <div className="text-muted-foreground">
                      Plan: <span className="font-semibold text-foreground">{b.plan}</span>
                    </div>
                  )}
                  {b.budget && (
                    <div className="text-muted-foreground">
                      Budget: <span className="font-semibold text-foreground">{b.budget}</span>
                    </div>
                  )}
                  {b.website_url && (
                    <div className="text-muted-foreground truncate">
                      Website:{" "}
                      <a
                        href={b.website_url.startsWith("http") ? b.website_url : `https://${b.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline"
                      >
                        {b.website_url}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      Details
                    </button>
                    {b.phone && b.phone !== "[Encrypted]" && (
                      <a
                        href={formatTelLink(b.phone)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        Call
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        setStatusChangeTarget({ booking: b, newStatus: e.target.value })
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
                      onClick={() => setDeleteTarget(b)}
                      className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                      aria-label="Delete request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredBookings.length > 0 && (
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
            recordLabel="audits"
          />
        )}
      </div>

      {/* Detail Modal */}
      <DigitalMarketingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChangeClick={(booking, newStatus) =>
          setStatusChangeTarget({ booking, newStatus })
        }
        onDeleteClick={(booking) => setDeleteTarget(booking)}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusChangeTarget !== null}
        title="Confirm Status Change"
        description={`Are you sure you want to change the status of request for "${
          statusChangeTarget?.booking.business_name
        }" to "${statusChangeTarget?.newStatus.replace(/_/g, " ")}"?`}
        confirmLabel="Update Status"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={executeStatusChange}
        onCancel={() => setStatusChangeTarget(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Marketing Request"
        description={`Are you sure you want to delete the request for "${deleteTarget?.business_name}"? This action cannot be undone.`}
        confirmLabel="Delete Request"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
