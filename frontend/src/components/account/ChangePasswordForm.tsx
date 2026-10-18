"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { changePasswordAction } from "@/app/account/actions";
import { useAdminToast } from "@/components/admin/AdminToastContext";
import Button from "@/components/ui/Button";

interface ChangePasswordFormProps {
  userMobile?: string;
  isForced?: boolean;
}

export default function ChangePasswordForm({
  userMobile,
  isForced = false,
}: ChangePasswordFormProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isForced && !currentPassword) {
      setErrorMsg("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match. Please verify both fields.");
      return;
    }

    if (!isForced && currentPassword === newPassword) {
      setErrorMsg("Your new password must differ from your current password.");
      return;
    }

    if (userMobile) {
      const cleanMobile = userMobile.replace(/\D/g, "");
      const cleanInput = newPassword.replace(/\D/g, "");
      if (newPassword.trim() === userMobile.trim() || (cleanMobile && cleanMobile === cleanInput)) {
        setErrorMsg("Your new password must differ from your registered mobile number.");
        return;
      }
    }

    const formData = new FormData();
    if (!isForced && currentPassword) {
      formData.set("currentPassword", currentPassword);
    }
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    startTransition(async () => {
      const res = await changePasswordAction(formData);

      if (!res.ok) {
        setErrorMsg(res.error || "Failed to update password.");
        showToast(res.error || "Failed to update password.", "error");
      } else {
        setSuccessMsg(res.message || "Password updated successfully!");
        showToast(res.message || "Password updated successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        if (res.redirectTo) {
          // Give user a brief moment to see the confirmation message
          setTimeout(() => {
            router.push(res.redirectTo!);
            router.refresh();
          }, 1200);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-3.5 text-xs text-success"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold leading-relaxed">{successMsg}</p>
            {isForced && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Redirecting you to your workspace...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Current Password (only shown during regular self-service, not forced first login) */}
      {!isForced && (
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Current Password <span className="text-destructive">*</span>
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              disabled={isPending}
              className="block w-full rounded-lg border border-border bg-background py-2 pr-10 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          New Password <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={isPending}
            className="block w-full rounded-lg border border-border bg-background py-2 pr-10 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Must be at least 8 characters long and cannot be your mobile number.
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Confirm New Password <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <KeyRound className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type your new password"
            disabled={isPending}
            className="block w-full rounded-lg border border-border bg-background py-2 pr-10 pl-9 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Updating Password...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {isForced ? "Set Permanent Password & Continue" : "Update Password"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
