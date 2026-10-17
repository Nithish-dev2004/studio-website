"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import {
  createStaffUserAction,
  getNextEmployeeIdAction,
} from "@/app/admin/actions/users";
import { isValidIndianMobile } from "@/lib/admin/phone";
import { useAdminToast } from "./AdminToastContext";
import Button from "@/components/ui/Button";
import type { StaffRole, StaffUser } from "@/types/staff";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: StaffUser) => void;
}

const roleDescriptions: Record<StaffRole, string> = {
  admin: "Full administrative access across all modules, users & salaries.",
  manager: "Operational management for bookings, consultations & orders.",
  photographer: "Access to bookings and shooting schedules.",
  editor: "Access to bookings and post-production requests.",
  staff: "General studio operations and customer communications.",
};

function CreateUserModalContent({
  onClose,
  onUserCreated,
}: {
  onClose: () => void;
  onUserCreated: (user: StaffUser) => void;
}) {
  const { showToast } = useAdminToast();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [salary, setSalary] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success view state (Never displays the password value)
  const [createdUser, setCreatedUser] = useState<StaffUser | null>(null);

  // Fetch prefilled Employee ID sequentially on mount
  useEffect(() => {
    let active = true;

    getNextEmployeeIdAction().then((res) => {
      if (active && res.ok && res.nextId) {
        setEmployeeId(res.nextId);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidIndianMobile(mobile)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210).");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("email", email.trim().toLowerCase());
    formData.set("mobile", mobile.trim());
    formData.set("role", role);
    formData.set("salary", salary);
    formData.set("employee_id", employeeId.trim());

    startTransition(async () => {
      const result = await createStaffUserAction(formData);

      if (!result.ok) {
        setErrorMsg(result.error || "Failed to create user.");
        showToast(result.error || "Failed to create user.", "error");
      } else if (result.ok && result.user) {
        setCreatedUser(result.user);
        onUserCreated(result.user);
        showToast(
          result.message || `Account created. Login: ${result.user.email} / password: the mobile number.`,
          "success",
        );
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
                {createdUser ? "Staff Account Created" : "Add New Staff User"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {createdUser
                  ? "Staff member credentials are active in the system."
                  : "Create login access and configure permissions for a team member."}
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

        {/* View 1: Success View (Never displaying password value) */}
        {createdUser ? (
          <div className="mt-5 space-y-6">
            <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-success">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold">Account created successfully</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Account created. Login: <strong className="text-foreground">{createdUser.email}</strong> / password: the mobile number.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Employee ID:</span>
                <span className="font-mono font-semibold text-foreground">{createdUser.employee_id}</span>
              </div>
              <div className="text-sm font-medium text-foreground">
                {createdUser.name} &bull; <span className="text-muted-foreground">{createdUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Role:</span>
                <span className="font-semibold uppercase text-foreground">{createdUser.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Login Mobile (Initial Password):</span>
                <span className="font-mono text-foreground">{createdUser.mobile}</span>
              </div>
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-xs text-foreground space-y-1">
              <p className="font-semibold text-accent">First-Time Sign In Information</p>
              <p className="text-muted-foreground leading-relaxed">
                Staff member will log in with their email and registered 10-digit mobile number.
                They will be automatically required to set a new password on their first login.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* View 2: User Creation Form */
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Employee ID */}
              <div>
                <label
                  htmlFor="employee_id"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Employee ID <span className="text-destructive">*</span>
                </label>
                <input
                  id="employee_id"
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="EMP-0001"
                  disabled={isPending}
                  className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden font-mono uppercase"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Prefilled sequentially, editable before saving.
                </p>
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Role <span className="text-destructive">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  disabled={isPending}
                  className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
                >
                  <option value="staff">Staff</option>
                  <option value="photographer">Photographer</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground truncate" title={roleDescriptions[role]}>
                  {roleDescriptions[role]}
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder="user@sivagangai.com"
                    disabled={isPending}
                    className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Mobile Number <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="mobile"
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98765 43210 or +91 98765 43210"
                    disabled={isPending}
                    className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Staff will log in with their email and this mobile number.
                </p>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label
                htmlFor="salary"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Monthly Salary (INR ₹) <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-semibold">
                  ₹
                </div>
                <input
                  id="salary"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="35000"
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2 pr-3 pl-8 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Confidential: visible only to administrators.
              </p>
            </div>

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
                {isPending ? "Creating Account..." : "Create Staff Account"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  if (!isOpen) return null;

  return (
    <CreateUserModalContent
      onClose={onClose}
      onUserCreated={onUserCreated}
    />
  );
}
