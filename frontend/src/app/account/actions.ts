"use server";

// Server Actions for Staff Account Portal (/account).
// Handles first-login password changes and self-service password updates.
// Passwords are NEVER stored, returned, or logged.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStaffAudit, requireStaffAccount } from "@/lib/admin/auth";
import { normalizeTo10Digits } from "@/lib/admin/phone";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase/server";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long.")
      .max(72, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match. Please verify and try again.",
    path: ["confirmPassword"],
  });

export type ChangePasswordResult = {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
  statusCode?: number;
};

/**
 * Changes the staff user's password.
 * Enforces:
 * 1. Current password verification (for self-service changes)
 * 2. Min 8 characters
 * 3. Confirmed twice
 * 4. Must differ from registered mobile number & current password
 * 5. Sets must_change_password = false
 * 6. Passwords NEVER stored in database or logged
 */
export async function changePasswordAction(
  formData: FormData,
): Promise<ChangePasswordResult> {
  // Allow accessing this action even during forced first login
  const profile = await requireStaffAccount({ allowChangePasswordPage: true });

  const rawInput = {
    currentPassword: (formData.get("currentPassword") as string) || undefined,
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid password.";
    return { ok: false, error: firstIssue, statusCode: 400 };
  }

  const { newPassword, currentPassword } = parsed.data;
  const isForced = Boolean(profile.staffUser?.must_change_password);

  // If self-service (not forced first login), verify current password
  if (!isForced) {
    if (!currentPassword) {
      return {
        ok: false,
        error: "Please enter your current password.",
        statusCode: 400,
      };
    }

    try {
      const supabase = await createSupabaseServerClient();
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile.user.email || "",
        password: currentPassword,
      });

      if (verifyError) {
        return {
          ok: false,
          error: "Current password is incorrect.",
          statusCode: 400,
        };
      }
    } catch {
      return {
        ok: false,
        error: "Could not verify current password. Please try again.",
        statusCode: 500,
      };
    }

    if (currentPassword === newPassword) {
      return {
        ok: false,
        error: "Your new password must be different from your current password.",
        statusCode: 400,
      };
    }
  }

  // Validation: Must differ from registered mobile number
  if (profile.staffUser?.mobile) {
    const rawMobile = profile.staffUser.mobile.trim();
    const normalizedMobile = normalizeTo10Digits(rawMobile);
    const normalizedNewPassword = normalizeTo10Digits(newPassword);

    if (
      newPassword.trim() === rawMobile ||
      (normalizedMobile && normalizedNewPassword && normalizedMobile === normalizedNewPassword)
    ) {
      return {
        ok: false,
        error: "Your new password must differ from your registered mobile number.",
        statusCode: 400,
      };
    }
  }

  const adminClient = createSupabaseAdmin();

  try {
    // 1. Update password in Supabase Auth
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      profile.user.id,
      {
        password: newPassword,
      },
    );

    if (authError) {
      return {
        ok: false,
        error: authError.message || "Failed to update password in authentication.",
        statusCode: 500,
      };
    }

    // 2. Mark must_change_password = false in staff_users table
    if (profile.staffUser?.id) {
      const { error: dbError } = await adminClient
        .from("staff_users")
        .update({
          must_change_password: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.staffUser.id);

      if (dbError) {
        console.error("Failed to update must_change_password flag:", dbError);
      }

      // 3. Audit log (Never log passwords)
      await logStaffAudit(
        profile.user.email || "staff",
        profile.staffUser.id,
        "edit",
        {
          event: "password_changed_by_user",
        },
      );
    }

    revalidatePath("/account");
    revalidatePath("/account/profile");
    revalidatePath("/account/change-password");
    revalidatePath("/admin");

    // If first login was completed, send regular staff to /account dashboard
    const destination = isForced
      ? (profile.role === "admin" || profile.role === "manager" ? "/admin" : "/account")
      : "/account/profile";

    return {
      ok: true,
      message: "Password changed successfully. Your account is secured.",
      redirectTo: destination,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected error during password change.",
      statusCode: 500,
    };
  }
}
