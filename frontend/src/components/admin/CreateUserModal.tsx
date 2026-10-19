"use client";

// CreateUserModal: Add New Staff User Dialog.
// Redesigned with warm luxury editorial styling matching Image 2 and studio branding.

import React, { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react";
import {
  createStaffUserAction,
  getNextEmployeeIdAction,
} from "@/app/admin/actions/users";
import { isValidIndianMobile } from "@/lib/admin/phone";
import { useAdminToast } from "./AdminToastContext";
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
  staff: "General studio operations and customer communication.",
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

  // Fetch prefilled sequential Employee ID
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
      aria-labelledby="create-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isPending) onClose();
        }}
      />

      {/* Modal Dialog Container */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#ede5d8] bg-white p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f2ece2] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9c783e] text-white shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="create-user-title"
                className="text-xl sm:text-2xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {createdUser ? "Staff Account Created" : "Add New Staff User"}
              </h2>
              <p className="mt-0.5 text-xs text-[#7c756c]">
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
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[#8c8478] hover:bg-[#f5ede0] hover:text-[#1a1714] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View 1: Success View (Never displaying password value) */}
        {createdUser ? (
          <div className="mt-5 space-y-6">
            <div className="rounded-xl border border-[#c4e5ce] bg-[#e8f5ec] p-4 text-[#1e7e45]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Account created successfully</h4>
                  <p className="mt-1 text-xs text-[#2e5d3c] leading-relaxed">
                    Account created. Login: <strong className="text-[#1a1714] font-semibold">{createdUser.email}</strong> / password: the mobile number.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#7c756c]">
                <span>Employee ID:</span>
                <span className="font-mono font-bold text-[#1a1714]">{createdUser.employee_id}</span>
              </div>
              <div className="text-sm font-semibold text-[#1a1714]">
                {createdUser.name} &bull; <span className="text-[#7c756c] font-normal">{createdUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#7c756c]">
                <span>Role:</span>
                <span className="font-semibold uppercase text-[#1a1714]">{createdUser.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#7c756c]">
                <span>Login Mobile (Initial Password):</span>
                <span className="font-mono font-semibold text-[#1a1714]">{createdUser.mobile}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#edd7af] bg-[#fdf8ee] p-3.5 text-xs space-y-1">
              <p className="font-bold text-[#8a682e]">First-Time Sign In Information</p>
              <p className="text-[#7c756c] leading-relaxed">
                Staff member will log in with their email and registered 10-digit mobile number.
                They will be automatically required to set a permanent password on their first login.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#d4a843] via-[#c9a84c] to-[#a86f28] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* View 2: User Creation Form matching Image 2 */
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

            {/* Row 1: Employee ID & Role */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Employee ID */}
              <div>
                <label
                  htmlFor="employee_id"
                  className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
                >
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="employee_id"
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="EMP-0001"
                  disabled={isPending}
                  className="mt-1.5 block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-sm font-semibold text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden font-mono uppercase transition-colors"
                />
                <p className="mt-1 text-[11px] text-[#8c8478]">
                  Prefilled sequentially, editable before saving.
                </p>
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  disabled={isPending}
                  className="mt-1.5 block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] px-3.5 py-2.5 text-sm font-medium text-[#1a1714] focus:border-[#a87f32] focus:bg-white focus:outline-hidden cursor-pointer transition-colors"
                >
                  <option value="staff">Staff</option>
                  <option value="photographer">Photographer</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="mt-1 text-[11px] text-[#8c8478] truncate" title={roleDescriptions[role]}>
                  {roleDescriptions[role]}
                </p>
              </div>
            </div>

            {/* Row 2: Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9e968b]">
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
                  className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-10 text-sm text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Row 3: Email Address & Mobile Number */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9e968b]">
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
                    className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-10 text-sm text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9e968b]">
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
                    className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-10 text-sm text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#8c8478]">
                  Staff will log in with their email and this mobile number.
                </p>
              </div>
            </div>

            {/* Row 4: Monthly Salary */}
            <div>
              <label
                htmlFor="salary"
                className="block text-[10.5px] font-bold uppercase tracking-wider text-[#735b38]"
              >
                Monthly Salary (INR ₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-[#8c8478]">
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
                  className="block w-full rounded-xl border border-[#e8dfcf] bg-[#fcfaf7] py-2.5 pr-3.5 pl-9 text-sm font-semibold font-mono text-[#1a1714] placeholder:text-[#9e968b] focus:border-[#a87f32] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#8c8478] flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#8c8478]" />
                <span>Confidential: visible only to administrators.</span>
              </p>
            </div>

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
                {isPending ? "Creating Account..." : "Create Staff Account"}
              </button>
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
