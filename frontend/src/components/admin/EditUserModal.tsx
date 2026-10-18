"use client";

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
import Button from "@/components/ui/Button";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-card-foreground">
                Edit Staff Member
              </h2>
              <p className="text-xs text-muted-foreground">
                Update account details, role assignments, or active status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {isSelf && (
            <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <strong>Your account:</strong> You cannot change your own role or deactivate
                yourself to protect against lockout.
              </span>
            </div>
          )}

          {/* Locked / Read-only Fields: Employee ID & Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee ID <span className="text-[11px] font-normal text-muted-foreground">(Locked)</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  disabled
                  value={user.employee_id}
                  className="block w-full rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground font-mono cursor-not-allowed select-all"
                />
                <Lock className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address <span className="text-[11px] font-normal text-muted-foreground">(Locked)</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="block w-full rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed select-all"
                />
                <Mail className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>
          </div>

          {/* Editable: Full Name */}
          <div>
            <label
              htmlFor="edit_name"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
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
                className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Editable: Mobile */}
            <div>
              <label
                htmlFor="edit_mobile"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Mobile Number <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="edit_mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Editable: Role */}
            <div>
              <label
                htmlFor="edit_role"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Assigned Role <span className="text-destructive">*</span>
              </label>
              <select
                id="edit_role"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                disabled={isPending || isSelf}
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden disabled:bg-muted/60 disabled:cursor-not-allowed"
              >
                <option value="staff">Staff</option>
                <option value="photographer">Photographer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Editable: Salary */}
            <div>
              <label
                htmlFor="edit_salary"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Monthly Salary (INR ₹) <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-semibold">
                  ₹
                </div>
                <input
                  id="edit_salary"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-8 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Editable: Status */}
            <div>
              <label
                htmlFor="edit_status"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Account Status
              </label>
              <select
                id="edit_status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                disabled={isPending || isSelf}
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden disabled:bg-muted/60 disabled:cursor-not-allowed"
              >
                <option value="active">Active (Access allowed)</option>
                <option value="inactive">Inactive (Access banned)</option>
              </select>
            </div>
          </div>

          {/* Quick Action: Reset Password */}
          {onOpenResetPassword && (
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Password Credentials</h4>
                <p className="text-[11px] text-muted-foreground">
                  Resets the password to the user&apos;s mobile number.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenResetPassword(user);
                }}
                className="gap-1.5 text-xs py-1.5 px-3"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Reset Password
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
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
