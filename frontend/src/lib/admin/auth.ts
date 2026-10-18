// Admin authentication and authorization helpers.
// Enforces that:
// 1. Super Admins (listed in ADMIN_EMAILS) always have super admin privileges and can NEVER be locked out.
// 2. Staff members exist in `staff_users` table with status = 'active'.
// 3. Inactive staff users are blocked immediately from signing in and on all server-side checks.
// 4. Role-based guards control access: only 'admin' role can view /admin/users or see salaries.

import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminProfile, StaffRole, StaffUser } from "@/types/staff";

/**
 * Returns a list of authorized super admin emails from the ADMIN_EMAILS environment variable.
 * Example: ADMIN_EMAILS="admin@sivagangai.com,owner@sivagangai.com"
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks whether a given email address is in the authorized super admin list.
 * Super admins can NEVER be locked out or deactivated.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const allowed = getAdminEmails();
  return allowed.includes(email.trim().toLowerCase());
}

export type AdminUserResult = {
  user: {
    id: string;
    email?: string | null;
  } | null;
  isAdmin: boolean; // true if role is 'admin' or user is super admin
  role: StaffRole | null;
  isSuperAdmin: boolean;
  staffUser: StaffUser | null;
  error: "unauthenticated" | "forbidden" | "inactive" | null;
  errorMessage?: string;
};

/**
 * Checks the current session from cookies and verifies if the user is an authorized admin or staff member.
 * Never throws — returns a structured status object.
 */
export async function getAdminUser(): Promise<AdminUserResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return {
        user: null,
        isAdmin: false,
        role: null,
        isSuperAdmin: false,
        staffUser: null,
        error: "unauthenticated",
      };
    }

    const email = user.email.toLowerCase();
    const isSuper = isAdminEmail(email);

    // Look up staff user record in database
    let staffUser: StaffUser | null = null;
    try {
      const adminClient = createSupabaseAdmin();
      const { data } = await adminClient
        .from("staff_users")
        .select("*")
        .or(`auth_user_id.eq.${user.id},email.eq.${email}`)
        .maybeSingle();

      if (data) {
        staffUser = data as StaffUser;
      }
    } catch {
      // If table query fails, fallback: super admins still proceed
    }

    // 1. Super admin from ADMIN_EMAILS: always active, role is 'admin', immune to lockout
    if (isSuper) {
      return {
        user,
        isAdmin: true,
        role: "admin",
        isSuperAdmin: true,
        staffUser,
        error: null,
      };
    }

    // 2. Staff user found: verify active status
    if (staffUser) {
      if (staffUser.status === "inactive") {
        return {
          user,
          isAdmin: false,
          role: staffUser.role,
          isSuperAdmin: false,
          staffUser,
          error: "inactive",
          errorMessage: "Your account is inactive. Contact the admin.",
        };
      }

      const isAdminRole = staffUser.role === "admin";
      return {
        user,
        isAdmin: isAdminRole,
        role: staffUser.role,
        isSuperAdmin: false,
        staffUser,
        error: null,
      };
    }

    // 3. User is neither super admin nor registered in staff_users
    return {
      user,
      isAdmin: false,
      role: null,
      isSuperAdmin: false,
      staffUser: null,
      error: "forbidden",
      errorMessage: "Access denied. This account does not have administrator privileges.",
    };
  } catch (err) {
    return {
      user: null,
      isAdmin: false,
      role: null,
      isSuperAdmin: false,
      staffUser: null,
      error: "unauthenticated",
      errorMessage: err instanceof Error ? err.message : "Authentication error",
    };
  }
}

/**
 * Server-side guard to call at the top of admin pages and server actions.
 * If not authenticated, redirects to /admin/login.
 * If inactive, signs out and redirects to /admin/login?error=inactive.
 * If forbidden, signs out and redirects to /admin/login?error=forbidden.
 */
export async function requireAdmin(): Promise<AdminProfile> {
  const result = await getAdminUser();

  if (!result.user || result.error === "unauthenticated") {
    redirect("/admin/login");
  }

  if (result.error === "inactive") {
    // Immediately invalidate cookie session so old sessions cannot be reused
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    redirect("/admin/login?error=inactive");
  }

  if (result.error === "forbidden" || !result.role) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    redirect("/admin/login?error=forbidden");
  }

  // Staff cannot open /admin: only super admin, admin, and manager roles are allowed
  const isAuthorizedAdmin =
    result.isSuperAdmin || result.role === "admin" || result.role === "manager";
  if (!isAuthorizedAdmin) {
    redirect("/account");
  }

  if (result.staffUser?.must_change_password) {
    redirect("/account/change-password");
  }

  return {
    user: result.user,
    role: result.role,
    isSuperAdmin: result.isSuperAdmin,
    staffUser: result.staffUser,
  };
}

/**
 * Server-side guard for /account portal pages.
 * Validates active staff or super admin.
 * If must_change_password is true and allowChangePasswordPage is false,
 * blocks access and redirects to /account/change-password.
 */
export async function requireStaffAccount(options: { allowChangePasswordPage?: boolean } = {}): Promise<AdminProfile> {
  const result = await getAdminUser();

  if (!result.user || result.error === "unauthenticated") {
    redirect("/admin/login?next=/account");
  }

  if (result.error === "inactive") {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    redirect("/admin/login?error=inactive");
  }

  if (result.error === "forbidden" || !result.role) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    redirect("/admin/login?error=forbidden");
  }

  // Force first-login password change on all account pages except /account/change-password
  if (result.staffUser?.must_change_password && !options.allowChangePasswordPage) {
    redirect("/account/change-password");
  }

  return {
    user: result.user,
    role: result.role,
    isSuperAdmin: result.isSuperAdmin,
    staffUser: result.staffUser,
  };
}

/**
 * Server-side guard for admin-only pages (e.g. /admin/users, user management actions).
 * Strictly requires the 'admin' role. Non-admins are redirected back to /admin.
 */
export async function requireAdminRole(): Promise<AdminProfile> {
  const profile = await requireAdmin();

  if (profile.role !== "admin") {
    redirect("/admin?error=unauthorized_role");
  }

  return profile;
}

/**
 * Writes an event to the staff_audit_log table.
 * Used for user creation, edits, status toggles, and password resets.
 * Passwords are NEVER logged.
 */
export async function logStaffAudit(
  performedByEmail: string,
  targetUserId: string | null,
  action: "create" | "edit" | "activate" | "deactivate" | "reset_password",
  details: Record<string, unknown> = {},
) {
  try {
    const adminClient = createSupabaseAdmin();
    await adminClient.from("staff_audit_log").insert({
      performed_by_email: performedByEmail.toLowerCase(),
      target_user_id: targetUserId,
      action,
      details,
    });
  } catch (err) {
    console.error("Failed to write to staff_audit_log:", err);
  }
}
