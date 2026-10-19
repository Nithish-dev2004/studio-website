"use client";

// ResetPasswordModal: Reset User Password Confirmation.
// Styled with warm luxury aesthetic matching studio branding.

import React, { useState, useTransition } from "react";
import {
  AlertCircle,
  KeyRound,
  ShieldAlert,
  X,
} from "lucide-react";
import { resetStaffPasswordAction } from "@/app/admin/actions/users";
import { useAdminToast } from "./AdminToastContext";
import type { StaffUser } from "@/types/staff";

interface ResetPasswordModalProps {
  user: StaffUser | null;
  isOpen: boolean;
  onClose: () => void;
}

function ResetPasswordModalContent({
  user,
  onClose,
}: {
  user: StaffUser;
  onClose: () => void;
}) {
  const { showToast } = useAdminToast();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmReset = () => {
    setErrorMsg(null);

    startTransition(async () => {
      const result = await resetStaffPasswordAction(user.id);

      if (!result.ok) {
        setErrorMsg(result.error || "Failed to reset password.");
        showToast(result.error || "Failed to reset password.", "error");
      } else {
        showToast(
          result.message || `Password reset to registered mobile number for ${user.name}.`,
          "success",
        );
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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#ede5d8] bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f2ece2] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9c783e] text-white shadow-xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-lg sm:text-xl font-bold text-[#1a1714]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Reset User Password
              </h2>
              <p className="text-xs text-[#7c756c] mt-0.5">{user.name} ({user.employee_id})</p>
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

        <div className="mt-5 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-[#f2d5d5] bg-[#fdf2f2] p-3.5 text-xs text-[#d9534f]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="rounded-2xl border border-[#ede5d8] bg-[#fcfaf7] p-4 space-y-2 text-xs text-[#5c5449]">
            <p className="font-bold text-[#1a1714]">Resets the password to the user&apos;s mobile number.</p>
            <p className="text-[#7c756c] leading-relaxed">
              This action will reset the Supabase Auth login password for{" "}
              <strong className="text-[#1a1714] font-semibold">{user.name}</strong> to their registered 10-digit mobile number ({user.mobile}).
            </p>
            <p className="text-[#7c756c] leading-relaxed">
              The user will be required to choose a new password immediately upon their next login.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#edd7af] bg-[#fdf8ee] p-3 text-xs text-[#5c5449]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#8a682e]" />
            <span>
              For security, the password will never be displayed on screen or saved in audit logs.
            </span>
          </div>

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end pt-3 border-t border-[#f2ece2]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto rounded-xl border border-[#e8dfcf] bg-white px-5 py-2.5 text-xs font-semibold text-[#5c5449] hover:bg-[#f5ede0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              disabled={isPending}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#d4a843] via-[#c9a84c] to-[#a86f28] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Resetting Password..." : "Confirm Reset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordModal({
  user,
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  if (!isOpen || !user) return null;
  return <ResetPasswordModalContent key={user.id} user={user} onClose={onClose} />;
}
