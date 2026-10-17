"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  Edit2,
  KeyRound,
  Mail,
  Phone,
  Power,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import ResetPasswordModal from "./ResetPasswordModal";
import StatusBadge from "./StatusBadge";
import TablePagination from "./TablePagination";
import { toggleStaffStatusAction } from "@/app/admin/actions/users";
import { useAdminToast } from "./AdminToastContext";
import Button from "@/components/ui/Button";
import type { StaffRole, StaffStatus, StaffUser } from "@/types/staff";

interface UsersTableProps {
  initialUsers: StaffUser[];
  viewerEmail?: string | null;
  viewerIsAdmin?: boolean;
}

const roleBadgeStyles: Record<StaffRole, string> = {
  admin: "bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400",
  manager: "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400",
  photographer: "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400",
  editor: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400",
  staff: "bg-muted border-border text-muted-foreground",
};

function formatINR(val?: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function UsersTable({
  initialUsers,
  viewerEmail,
  viewerIsAdmin = true,
}: UsersTableProps) {
  const { showToast } = useAdminToast();
  const [users, setUsers] = useState<StaffUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<StaffUser | null>(null);

  // Confirmation modal for activate/deactivate
  const [confirmStatusUser, setConfirmStatusUser] = useState<StaffUser | null>(null);
  const [isTogglingStatus, startTransition] = useTransition();

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== "all" && u.status !== statusFilter) {
        return false;
      }
      // Search query across name, email, mobile, employee_id
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesMobile = u.mobile.replace(/\s+/g, "").includes(q);
        const matchesEmpId = u.employee_id.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesMobile || matchesEmpId;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Pagination slices
  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Statistics
  const activeCount = useMemo(() => users.filter((u) => u.status === "active").length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => u.status === "inactive").length, [users]);

  // Callbacks
  const handleUserCreated = (newUser: StaffUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUserUpdated = (updatedUser: StaffUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleConfirmStatusToggle = () => {
    if (!confirmStatusUser) return;
    const targetStatus: StaffStatus =
      confirmStatusUser.status === "active" ? "inactive" : "active";

    startTransition(async () => {
      const res = await toggleStaffStatusAction(confirmStatusUser.id, targetStatus);
      if (!res.ok) {
        showToast(res.error || "Failed to update account status.", "error");
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === confirmStatusUser.id ? { ...u, status: targetStatus } : u,
          ),
        );
        showToast(res.message || "Status updated successfully.", "success");
      }
      setConfirmStatusUser(null);
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const isSelf = (u: StaffUser) =>
    Boolean(viewerEmail && u.email.toLowerCase() === viewerEmail.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Users & Staff
            </h1>
            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-semibold text-muted-foreground shadow-2xs">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage staff credentials, role-based privileges, and payroll details.
          </p>
        </div>

        {/* Action Button: Add User */}
        {viewerIsAdmin && (
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New User</span>
          </Button>
        )}
      </div>

      {/* Metrics / Status Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Staff
            </span>
            <Users className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-xl font-bold text-card-foreground sm:text-2xl">{users.length}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Users
            </span>
            <UserCheck className="h-4 w-4 text-success" />
          </div>
          <p className="mt-2 text-xl font-bold text-success sm:text-2xl">{activeCount}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Inactive
            </span>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xl font-bold text-muted-foreground sm:text-2xl">{inactiveCount}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Role
            </span>
            <ShieldCheck className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-xl font-bold text-card-foreground sm:text-2xl">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs sm:p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
          {/* Search Box */}
          <div className="relative sm:col-span-6 lg:col-span-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, phone, or employee ID..."
              className="block w-full rounded-lg border border-border bg-background py-2 pr-9 pl-9 text-xs sm:text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="photographer">Photographer</option>
              <option value="editor">Editor</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-xs">
            <span className="text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-foreground">
                &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {roleFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 capitalize text-foreground">
                Role: {roleFilter}
                <button type="button" onClick={() => setRoleFilter("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 capitalize text-foreground">
                Status: {statusFilter}
                <button type="button" onClick={() => setStatusFilter("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs text-accent hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* 1. Desktop & Tablet View (Hidden on mobile < 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 sm:px-6">Employee ID</th>
                <th className="px-4 py-3">Staff Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                {viewerIsAdmin && <th className="px-4 py-3">Monthly Salary</th>}
                <th className="px-4 py-3 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={viewerIsAdmin ? 7 : 6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-foreground">No users found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search criteria or clearing filters."
                        : "No staff users registered in the system yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const self = isSelf(u);

                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Employee ID */}
                      <td className="px-4 py-3.5 sm:px-6 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                        <span className="rounded-md border border-border bg-muted/60 px-2 py-1">
                          {u.employee_id}
                        </span>
                      </td>

                      {/* Name & Self Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{u.name}</span>
                          {self && (
                            <span className="rounded-sm border border-accent/40 bg-accent/15 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-accent">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact: Email & Mobile */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={`mailto:${u.email}`}
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span>{u.email}</span>
                          </a>
                          <a
                            href={`tel:${u.mobile.replace(/\s+/g, "")}`}
                            className="inline-flex items-center gap-1.5 text-muted-foreground/80 hover:text-foreground"
                          >
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{u.mobile}</span>
                          </a>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                            roleBadgeStyles[u.role] || "bg-muted text-muted-foreground"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={u.status} />
                      </td>

                      {/* Salary (Admin only) */}
                      {viewerIsAdmin && (
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                          {formatINR(u.salary)}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-4 py-3.5 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            title="Edit user"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Reset Password button */}
                          <button
                            type="button"
                            onClick={() => setResetPwdUser(u)}
                            title="Reset password (Resets the password to the user's mobile number)"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Activate / Deactivate Toggle Button */}
                          <button
                            type="button"
                            disabled={self}
                            onClick={() => setConfirmStatusUser(u)}
                            title={
                              self
                                ? "You cannot deactivate your own account"
                                : u.status === "active"
                                  ? "Deactivate account"
                                  : "Activate account"
                            }
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                              self
                                ? "border-border text-muted-foreground/30 cursor-not-allowed"
                                : u.status === "active"
                                  ? "border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  : "border-success/30 text-success hover:bg-success/10 cursor-pointer"
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
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

        {/* 2. Mobile View: Stacked Cards (Visible only on mobile < 768px) */}
        <div className="md:hidden divide-y divide-border">
          {paginatedUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground">No users found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "Adjust search or clear filters."
                  : "No staff users registered yet."}
              </p>
            </div>
          ) : (
            paginatedUsers.map((u) => {
              const self = isSelf(u);

              return (
                <div key={u.id} className="p-4 space-y-3">
                  {/* Top: Name, ID, Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground">{u.name}</h3>
                        {self && (
                          <span className="rounded-sm border border-accent/40 bg-accent/15 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-accent">
                            You
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{u.employee_id}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${
                          roleBadgeStyles[u.role] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role}
                      </span>
                      <StatusBadge status={u.status} />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs">
                    <a
                      href={`mailto:${u.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="break-all">{u.email}</span>
                    </a>
                    <a
                      href={`tel:${u.mobile.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 text-muted-foreground/80 hover:text-foreground"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{u.mobile}</span>
                    </a>
                  </div>

                  {/* Salary info (Admin only) */}
                  {viewerIsAdmin && (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">Monthly Salary:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatINR(u.salary)}
                      </span>
                    </div>
                  )}

                  {/* Mobile Actions Toolbar with min 44px tap targets */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingUser(u)}
                      className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResetPwdUser(u)}
                      title="Reset password: Resets to registered mobile number"
                      className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Password</span>
                    </button>

                    <button
                      type="button"
                      disabled={self}
                      onClick={() => setConfirmStatusUser(u)}
                      className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors ${
                        self
                          ? "border-border text-muted-foreground/30 cursor-not-allowed"
                          : u.status === "active"
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "border-success/30 text-success hover:bg-success/10"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      <span>{u.status === "active" ? "Deactivate" : "Activate"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            currentCount={paginatedUsers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
            recordLabel="staff members"
          />
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        user={editingUser}
        currentUserEmail={viewerEmail}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleUserUpdated}
        onOpenResetPassword={(u) => setResetPwdUser(u)}
      />

      <ResetPasswordModal
        user={resetPwdUser}
        isOpen={Boolean(resetPwdUser)}
        onClose={() => setResetPwdUser(null)}
      />

      {/* Confirmation Dialog for Activate / Deactivate */}
      <ConfirmationModal
        isOpen={Boolean(confirmStatusUser)}
        title={
          confirmStatusUser?.status === "active"
            ? `Deactivate ${confirmStatusUser?.name}?`
            : `Activate ${confirmStatusUser?.name}?`
        }
        description={
          confirmStatusUser?.status === "active"
            ? `Deactivating this user will ban their Supabase Auth account and invalidate all active login sessions immediately. They will not be able to sign in until reactivated.`
            : `Activating this user will lift their authentication ban and allow them to log into the admin console.`
        }
        confirmLabel={
          confirmStatusUser?.status === "active" ? "Yes, Deactivate User" : "Yes, Activate User"
        }
        cancelLabel="Cancel"
        variant={confirmStatusUser?.status === "active" ? "destructive" : "primary"}
        isLoading={isTogglingStatus}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => {
          if (!isTogglingStatus) {
            setConfirmStatusUser(null);
          }
        }}
      />
    </div>
  );
}
