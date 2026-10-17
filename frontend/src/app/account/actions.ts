"use server";

// Server Actions for Staff Account Portal (/account).
// Handles first-login password changes and self-service password updates.
// Passwords are NEVER stored, returned, or logged.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStaffAudit, requireStaffAccount } from "@/lib/admin/auth";
import { normalizeTo10Digits } from "@/lib/admin/phone";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const changePasswordSchema = z
  .object({
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
 * 1. Min 8 characters
 * 2. Confirmed twice
 * 3. Must differ from registered mobile number
 * 4. Sets must_change_password = false
 * 5. Passwords NEVER stored in database or logged
 */
export async function changePasswordAction(
  formData: FormData,
): Promise<ChangePasswordResult> {
  // Allow accessing this action even during forced first login
  const profile = await requireStaffAccount({ allowChangePasswordPage: true });

  const rawInput = {
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid password.";
    return { ok: false, error: firstIssue, statusCode: 400 };
  }

  const { newPassword } = parsed.data;

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

    // If staff user is admin or manager, they can go to /admin; others can go to /account/profile
    const destination =
      profile.role === "admin" || profile.role === "manager"
        ? "/admin"
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
