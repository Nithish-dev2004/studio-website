"use client";

// UsersTable: Staff & Users Directory (/admin/users).
// Redesigned with warm luxury editorial aesthetic matching the provided design.
// Features metrics cards, role/status filters, search, responsive table, and management actions.

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
import TablePagination from "./TablePagination";
import { toggleStaffStatusAction } from "@/app/admin/actions/users";
import { useAdminToast } from "./AdminToastContext";
import type { StaffRole, StaffStatus, StaffUser } from "@/types/staff";

interface UsersTableProps {
  initialUsers: StaffUser[];
  viewerEmail?: string | null;
  viewerIsAdmin?: boolean;
}

const roleBadgeStyles: Record<StaffRole, string> = {
  admin: "bg-[#f7eedb] border-[#edd7af] text-[#8a682e]",
  manager: "bg-[#f0edf7] border-[#ded5f0] text-[#6b4da8]",
  photographer: "bg-[#e6f0fa] border-[#c3daf1] text-[#1c64b0]",
  editor: "bg-[#fef3c7] border-[#fde68a] text-[#92400e]",
  staff: "bg-[#f0e8db] border-[#e2d5c1] text-[#6b522d]",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  photographer: "Photographer",
  editor: "Editor",
  staff: "Staff",
};

function formatINR(val?: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function getInitial(name: string): string {
  if (!name || !name.trim()) return "?";
  return name.trim().charAt(0).toUpperCase();
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
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
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

  // Pagination calculations
  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Statistics
  const activeCount = useMemo(() => users.filter((u) => u.status === "active").length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => u.status === "inactive").length, [users]);
  const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);

  // Total monthly payroll for active staff
  const totalMonthlyPayroll = useMemo(() => {
    return users
      .filter((u) => u.status === "active")
      .reduce((sum, u) => sum + (Number(u.salary) || 0), 0);
  }, [users]);

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
      {/* 1. Top Header & Add User Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1714]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Users &amp; Staff
            </h1>
            <span className="rounded-full bg-[#f4ede2] border border-[#e8dfcf] px-2.5 py-0.5 text-xs font-semibold text-[#8a682e] shadow-2xs">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#7c756c]">
            Manage staff credentials, role-based privileges, and payroll details.
          </p>
        </div>

        {/* Action Button: Add New User with Rich Theme Color */}
        {viewerIsAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4a843] via-[#c9a84c] to-[#a86f28] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer w-full sm:w-auto self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {/* 2. Metrics / Status Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Staff */}
        <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5ede0]">
            <Users className="h-5 w-5 text-[#8a682e]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8c8478]">
              Total Staff
            </span>
            <p
              className="mt-0.5 text-2xl font-bold text-[#8a682e]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {users.length}
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec]">
            <UserCheck className="h-5 w-5 text-[#1e7e45]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8c8478]">
              Active Users
            </span>
            <p
              className="mt-0.5 text-2xl font-bold text-[#1e7e45]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {activeCount}
            </p>
          </div>
        </div>

        {/* Inactive */}
        <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0e8db]/70">
            <UserX className="h-5 w-5 text-[#8c8478]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8c8478]">
              Inactive
            </span>
            <p
              className="mt-0.5 text-2xl font-bold text-[#5c5449]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* Admin Role */}
        <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7eedb]">
            <ShieldCheck className="h-5 w-5 text-[#a87f32]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8c8478]">
              Admin Role
            </span>
            <p
              className="mt-0.5 text-2xl font-bold text-[#8a682e]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {adminCount}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Bar */}
      <div className="rounded-2xl border border-[#ede5d8] bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
          {/* Search Box */}
          <div className="relative sm:col-span-6 lg:col-span-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9e968b]">
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
              className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-9 pl-10 text-xs text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:ring-1 focus:ring-[#a87f32] focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9e968b] hover:text-[#1a1714]"
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
              className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
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
              className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-xs font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f2ece2] text-xs">
            <span className="text-[#8c8478]">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#f4ede2] border border-[#e8dfcf] px-2 py-0.5 text-[#5c5449]">
                &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {roleFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#f4ede2] border border-[#e8dfcf] px-2 py-0.5 capitalize text-[#5c5449]">
                Role: {roleFilter}
                <button type="button" onClick={() => setRoleFilter("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#f4ede2] border border-[#e8dfcf] px-2 py-0.5 capitalize text-[#5c5449]">
                Status: {statusFilter}
                <button type="button" onClick={() => setStatusFilter("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs text-[#a87f32] hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Directory Table */}
      <div className="rounded-2xl border border-[#ede5d8] bg-white shadow-xs overflow-hidden">
        {/* Desktop View (screens >= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e8dfcf] bg-[#f5ede0]">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  EMPLOYEE ID
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  STAFF NAME
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  CONTACT
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  ROLE
                </th>
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                  STATUS
                </th>
                {viewerIsAdmin && (
                  <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                    MONTHLY SALARY
                  </th>
                )}
                <th scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wider text-[#735b38] text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2ece2] bg-white">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={viewerIsAdmin ? 7 : 6}
                    className="py-12 text-center text-sm text-[#7c756c]"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4ede2] text-[#8a682e] mb-3">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-[#1a1714]">No staff members found</p>
                    <p className="mt-1 text-xs text-[#7c756c]">
                      {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search criteria or clearing active filters."
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
                      className="transition-colors hover:bg-[#faf7f2]/90"
                    >
                      {/* Employee ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-block rounded-md border border-[#e8dfcf] bg-[#fcfaf7] px-2.5 py-1 text-[11px] font-mono font-semibold text-[#5c5449]">
                          {u.employee_id}
                        </span>
                      </td>

                      {/* Staff Name & Initial Avatar */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                            {getInitial(u.name)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1f1b16]">{u.name}</span>
                            {self && (
                              <span className="rounded-sm border border-[#a87f32]/40 bg-[#f4ede2] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#a87f32]">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact: Email & Mobile */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={`mailto:${u.email}`}
                            className="inline-flex items-center gap-1.5 text-[#5c5449] hover:text-[#1a1714] transition-colors"
                          >
                            <Mail className="h-3 w-3 text-[#9e968b] shrink-0" />
                            <span>{u.email}</span>
                          </a>
                          <a
                            href={`tel:${u.mobile.replace(/\s+/g, "")}`}
                            className="inline-flex items-center gap-1.5 text-[#8c8478] font-mono hover:text-[#1a1714] transition-colors"
                          >
                            <Phone className="h-3 w-3 text-[#9e968b] shrink-0" />
                            <span>{u.mobile}</span>
                          </a>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            roleBadgeStyles[u.role] || "bg-[#f0e8db] text-[#6b522d]"
                          }`}
                        >
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-2.5 py-1 text-xs font-semibold text-[#1e7e45]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c8c8] bg-[#fdeeee] px-2.5 py-1 text-xs font-semibold text-[#c53030]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c53030]" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Monthly Salary (Admin only) */}
                      {viewerIsAdmin && (
                        <td className="px-5 py-4 font-mono text-xs font-bold text-[#1f1b16] whitespace-nowrap">
                          {formatINR(u.salary)}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            title="Edit user"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#7c756c] transition-colors hover:bg-[#f5ede0] hover:text-[#1a1714] shadow-2xs cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Reset Password button */}
                          <button
                            type="button"
                            onClick={() => setResetPwdUser(u)}
                            title="Reset password to mobile number"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfcf] bg-white text-[#7c756c] transition-colors hover:bg-[#f5ede0] hover:text-[#1a1714] shadow-2xs cursor-pointer"
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
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shadow-2xs ${
                              self
                                ? "border-[#e8dfcf] text-[#8c8478]/30 cursor-not-allowed"
                                : u.status === "active"
                                  ? "border-[#f2d5d5] bg-white text-[#d9534f] hover:bg-[#fdf2f2] cursor-pointer"
                                  : "border-[#c4e5ce] bg-white text-[#1e7e45] hover:bg-[#e8f5ec] cursor-pointer"
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

        {/* Mobile View: Stacked Cards (screens < 768px) */}
        <div className="md:hidden divide-y divide-[#f2ece2]">
          {paginatedUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#7c756c]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4ede2] text-[#8a682e] mb-3">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-semibold text-[#1a1714]">No staff users found</p>
              <p className="mt-1 text-xs text-[#7c756c]">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "Adjust search or clear active filters."
                  : "No staff users registered yet."}
              </p>
            </div>
          ) : (
            paginatedUsers.map((u) => {
              const self = isSelf(u);

              return (
                <div key={u.id} className="p-5 space-y-3.5 bg-white">
                  {/* Top: Avatar, Name, ID, Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8db] text-xs font-bold text-[#6b522d]">
                        {getInitial(u.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[#1a1714] leading-tight">{u.name}</h3>
                          {self && (
                            <span className="rounded-sm border border-[#a87f32]/40 bg-[#f4ede2] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#a87f32]">
                              You
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-[#8c8478]">{u.employee_id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          roleBadgeStyles[u.role] || "bg-[#f0e8db] text-[#6b522d]"
                        }`}
                      >
                        {roleLabels[u.role] || u.role}
                      </span>
                      {u.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#c4e5ce] bg-[#e8f5ec] px-2 py-0.5 text-[10px] font-semibold text-[#1e7e45]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1e7e45]" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#f0c8c8] bg-[#fdeeee] px-2 py-0.5 text-[10px] font-semibold text-[#c53030]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#c53030]" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs border-y border-[#f2ece2] py-2.5">
                    <a
                      href={`mailto:${u.email}`}
                      className="flex items-center gap-2 text-[#5c5449] hover:text-[#1a1714]"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#9e968b] shrink-0" />
                      <span className="break-all">{u.email}</span>
                    </a>
                    <a
                      href={`tel:${u.mobile.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 text-[#8c8478] font-mono hover:text-[#1a1714]"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#9e968b] shrink-0" />
                      <span>{u.mobile}</span>
                    </a>
                  </div>

                  {/* Salary info (Admin only) */}
                  {viewerIsAdmin && (
                    <div className="flex items-center justify-between rounded-xl border border-[#ede5d8] bg-[#fcfaf7] px-3.5 py-2 text-xs">
                      <span className="text-[#8c8478]">Monthly Salary:</span>
                      <span className="font-mono font-bold text-[#1a1714]">
                        {formatINR(u.salary)}
                      </span>
                    </div>
                  )}

                  {/* Mobile Actions Toolbar */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingUser(u)}
                      className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-2 text-xs font-semibold text-[#2d271f] transition-colors hover:bg-[#f5ede0]"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-[#7c756c]" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResetPwdUser(u)}
                      title="Reset password"
                      className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-2 text-xs font-semibold text-[#2d271f] transition-colors hover:bg-[#f5ede0]"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-[#7c756c]" />
                      <span>Password</span>
                    </button>

                    <button
                      type="button"
                      disabled={self}
                      onClick={() => setConfirmStatusUser(u)}
                      className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition-colors ${
                        self
                          ? "border-[#e8dfcf] text-[#8c8478]/30 cursor-not-allowed"
                          : u.status === "active"
                            ? "border-[#f2d5d5] bg-white text-[#d9534f] hover:bg-[#fdf2f2]"
                            : "border-[#c4e5ce] bg-white text-[#1e7e45] hover:bg-[#e8f5ec]"
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

        {/* Table Footer with Monthly Payroll and Pagination */}
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
            recordLabel={
              viewerIsAdmin
                ? `staff members \u00A0\u00A0\u00A0 Monthly payroll ${formatINR(totalMonthlyPayroll)}`
                : "staff members"
            }
            className="border-t border-[#ede5d8] bg-white"
          />
        )}
      </div>

      {/* 5. Modals */}
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
