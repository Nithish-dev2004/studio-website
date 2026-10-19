"use client";

// EditUserModal: Edit Staff Member Dialog.
// Styled with warm luxury aesthetic matching CreateUserModal and studio branding.

import React, { useState, useTransition } from "react";
import {
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { updateStaffUserAction } from "@/app/admin/actions/users";
import { useAdminToast } from "./AdminToastContext";
import type { StaffRole, StaffStatus, StaffUser } from "@/types/staff";

interface EditUserModalProps {
  user: StaffUser | null;
  currentUserEmail?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: StaffUser) => void;
  onOpenResetPassword?: (user: StaffUser) => void;
}

function EditUserModalContent({
  user,
  currentUserEmail,
  onClose,
  onUserUpdated,
  onOpenResetPassword,
}: {
  user: StaffUser;
  currentUserEmail?: string | null;
  onClose: () => void;
  onUserUpdated: (updatedUser: StaffUser) => void;
  onOpenResetPassword?: (user: StaffUser) => void;
}) {
  const { showToast } = useAdminToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile);
  const [role, setRole] = useState<StaffRole>(user.role);
  const [salary, setSalary] = useState(
    user.salary !== null && user.salary !== undefined ? user.salary.toString() : "",
  );
  const [status, setStatus] = useState<StaffStatus>(user.status);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSelf = Boolean(
    currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase(),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    // Collect ONLY changed fields
    const changedFields: {
      name?: string;
      mobile?: string;
      role?: StaffRole;
      salary?: number;
      status?: StaffStatus;
    } = {};

    if (name.trim() !== user.name) changedFields.name = name.trim();
    if (mobile.trim() !== user.mobile) changedFields.mobile = mobile.trim();
    if (role !== user.role) changedFields.role = role;
    const numSalary = parseFloat(salary);
    if (!isNaN(numSalary) && numSalary !== user.salary) changedFields.salary = numSalary;
    if (status !== user.status) changedFields.status = status;

    if (Object.keys(changedFields).length === 0) {
      showToast("No changes detected.", "info");
      onClose();
      return;
    }

    startTransition(async () => {
      const result = await updateStaffUserAction(user.id, changedFields);

      if (!result.ok) {
        setErrorMsg(result.error || "Failed to update staff user.");
        showToast(result.error || "Failed to update staff user.", "error");
      } else {
        const updatedUser: StaffUser = {
          ...user,
          ...changedFields,
          salary: changedFields.salary !== undefined ? changedFields.salary : user.salary,
          updated_at: new Date().toISOString(),
        };
        onUserUpdated(updatedUser);
        showToast(`Updated ${user.name} successfully.`, "success");
        onClose();
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#ede5d8] bg-white p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f2ece2] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9c783e] text-white shadow-xs">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-xl sm:text-2xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Edit Staff Member
              </h2>
              <p className="mt-0.5 text-xs text-[#7c756c]">
                Update account details, role assignments, or active status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-[#8c8478] hover:bg-[#f5ede0] hover:text-[#1a1714] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-[#f2d5d5] bg-[#fdf2f2] p-3.5 text-xs text-[#d9534f]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {isSelf && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#edd7af] bg-[#fdf8ee] p-3 text-xs text-[#5c5449]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#8a682e]" />
              <span>
                <strong className="text-[#1a1714]">Your account:</strong> You cannot change your own role or deactivate
                yourself to protect against lockout.
              </span>
            </div>
          )}

          {/* Locked / Read-only Fields: Employee ID & Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                Employee ID <span className="text-[11px] font-normal text-[#8c8478]">(Locked)</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  disabled
                  value={user.employee_id}
                  className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-sm font-semibold font-mono text-[#8c8478] cursor-not-allowed select-all"
                />
                <Lock className="absolute top-3 right-3.5 h-4 w-4 text-[#8c8478]/70" />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]">
                Email Address <span className="text-[11px] font-normal text-[#8c8478]">(Locked)</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-sm text-[#8c8478] cursor-not-allowed select-all"
                />
                <Mail className="absolute top-3 right-3.5 h-4 w-4 text-[#8c8478]/70" />
              </div>
            </div>
          </div>

          {/* Editable: Full Name */}
          <div>
            <label
              htmlFor="edit_name"
              className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9e968b]">
                <User className="h-4 w-4" />
              </div>
              <input
                id="edit_name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-10 text-sm text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Editable: Mobile & Role */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit_mobile"
                className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9e968b]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="edit_mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={isPending}
                  className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-10 text-sm text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit_role"
                className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
              >
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="edit_role"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                disabled={isPending || isSelf}
                className="mt-1.5 block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-sm font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                <option value="staff">Staff</option>
                <option value="photographer">Photographer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Editable: Monthly Salary & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit_salary"
                className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
              >
                Monthly Salary (INR ₹)
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-[#8c8478]">
                  ₹
                </div>
                <input
                  id="edit_salary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  disabled={isPending}
                  className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-8 text-sm font-semibold font-mono text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit_status"
                className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
              >
                Account Status
              </label>
              <select
                id="edit_status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                disabled={isPending || isSelf}
                className="mt-1.5 block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-sm font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                <option value="active">Active (Access allowed)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Quick Action: Reset Password */}
          {onOpenResetPassword && (
            <div className="rounded-2xl border border-[#ede5d8] bg-[#fcfaf7] p-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1a1714]">Password Credentials</h4>
                <p className="text-[11px] text-[#7c756c]">
                  Resets password to the staff member&apos;s registered mobile number.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenResetPassword(user);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfcf] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d271f] hover:bg-[#f5ede0] transition-colors cursor-pointer shadow-2xs"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#8a682e]" />
                <span>Reset Password</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end pt-3 border-t border-[#f2ece2]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto rounded-xl border border-[#e8dfcf] bg-white px-5 py-2.5 text-xs font-semibold text-[#5c5449] hover:bg-[#f5ede0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#d4a843] via-[#c9a84c] to-[#a86f28] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditUserModal(props: EditUserModalProps) {
  if (!props.isOpen || !props.user) return null;
  return <EditUserModalContent key={props.user.id} {...props} user={props.user} />;
}
