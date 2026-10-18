"use client";

import React, { useState, useTransition } from "react";
import {
  AlertCircle,
  KeyRound,
  ShieldAlert,
  X,
} from "lucide-react";
import { resetStaffPasswordAction } from "@/app/admin/actions/users";
import { useAdminToast } from "./AdminToastContext";
import Button from "@/components/ui/Button";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-card-foreground">
                Reset User Password
              </h2>
              <p className="text-xs text-muted-foreground">{user.name} ({user.employee_id})</p>
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

        <div className="mt-5 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs text-foreground">
            <p className="font-semibold">Resets the password to the user&apos;s mobile number.</p>
            <p className="text-muted-foreground leading-relaxed">
              This action will reset the Supabase Auth login password for{" "}
              <strong className="text-foreground">{user.name}</strong> to their registered 10-digit mobile number ({user.mobile}).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The user will be required to choose a new password immediately upon their next login.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-foreground">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              For security, the password will never be displayed on screen or saved in audit logs.
            </span>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
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
              type="button"
              onClick={handleConfirmReset}
              disabled={isPending}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Resetting Password..." : "Confirm Reset"}
            </Button>
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

  return (
    <ResetPasswordModalContent
      user={user}
      onClose={onClose}
    />
  );
}
