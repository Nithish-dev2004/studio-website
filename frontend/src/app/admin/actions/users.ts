"use server";

// Server Actions for User & Staff Management (/admin/users).
// All actions run strictly on the server and require the 'admin' role.
// Service role key is used exclusively on the server, never leaked to the client.

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStaffAudit, requireAdminRole } from "@/lib/admin/auth";
import { isValidIndianMobile, normalizeTo10Digits } from "@/lib/admin/phone";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { StaffRole, StaffStatus, StaffUser } from "@/types/staff";

// ---- Zod Validation Schemas ----

const createStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name cannot exceed 80 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Email is required.")
    .max(254, "Email is too long.")
    .pipe(z.email("Please provide a valid email address.")),
  mobile: z
    .string()
    .trim()
    .refine((val) => isValidIndianMobile(val), {
      message: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210).",
    }),
  role: z.enum(["admin", "manager", "photographer", "editor", "staff"], {
    message: "Please select a valid role.",
  }),
  salary: z.coerce
    .number()
    .min(0, "Salary cannot be negative."),
  employee_id: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Employee ID is required.")
    .max(30, "Employee ID cannot exceed 30 characters."),
});

const updateStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name cannot exceed 80 characters.")
    .optional(),
  mobile: z
    .string()
    .trim()
    .refine((val) => isValidIndianMobile(val), {
      message: "Please enter a valid 10-digit Indian mobile number.",
    })
    .optional(),
  role: z
    .enum(["admin", "manager", "photographer", "editor", "staff"])
    .optional(),
  salary: z.coerce
    .number()
    .min(0, "Salary cannot be negative.")
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * Generates a cryptographically strong, friendly temporary password.
 */
export async function generateStrongPasswordAction(): Promise<string> {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%^&*";
  let pwd = "";
  const randomBytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    pwd += chars[randomBytes[i] % chars.length];
  }
  return pwd;
}

/**
 * Calculates the next employee ID sequence (e.g. EMP-0001, EMP-0002).
 */
export async function getNextEmployeeIdAction(): Promise<{ ok: boolean; nextId: string }> {
  await requireAdminRole();

  try {
    const adminClient = createSupabaseAdmin();
    const { data, error } = await adminClient
      .from("staff_users")
      .select("employee_id");

    if (error) throw error;

    let maxNum = 0;
    const regex = /^EMP-(\d+)$/i;

    (data || []).forEach((row) => {
      const match = regex.exec(row.employee_id || "");
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNumber = maxNum + 1;
    const padded = nextNumber.toString().padStart(4, "0");
    return { ok: true, nextId: `EMP-${padded}` };
  } catch {
    return { ok: true, nextId: "EMP-0001" };
  }
}

/**
 * Creates a new staff user.
 * Atomically creates the Supabase Auth user and the staff_users row.
 * If either step fails, rolls back the other to guarantee zero orphan records.
 */
export async function createStaffUserAction(formData: FormData) {
  const { user: currentAdmin } = await requireAdminRole();

  const rawInput = {
    name: formData.get("name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    role: formData.get("role"),
    salary: formData.get("salary"),
    employee_id: formData.get("employee_id"),
  };

  const parsed = createStaffSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid user information.";
    return { ok: false, error: firstIssue, statusCode: 400 };
  }

  const { name, email, mobile, role, salary, employee_id } = parsed.data;
  const normalizedMobile = normalizeTo10Digits(mobile);
  if (!normalizedMobile) {
    return {
      ok: false,
      error: "Please enter a valid 10-digit Indian mobile number.",
      statusCode: 400,
    };
  }
  const adminClient = createSupabaseAdmin();

  // 1. Pre-check for duplicate email or employee ID
  try {
    const { data: existingRows } = await adminClient
      .from("staff_users")
      .select("id, email, employee_id")
      .or(`email.eq.${email},employee_id.eq.${employee_id}`);

    if (existingRows && existingRows.length > 0) {
      const matchEmail = existingRows.find((r) => r.email === email);
      if (matchEmail) {
        return {
          ok: false,
          error: `Email address "${email}" is already registered.`,
          statusCode: 409,
        };
      }
      const matchEmp = existingRows.find((r) => r.employee_id === employee_id);
      if (matchEmp) {
        return {
          ok: false,
          error: `Employee ID "${employee_id}" already belongs to an existing staff member.`,
          statusCode: 409,
        };
      }
    }
  } catch (err) {
    console.error("Duplicate check error:", err);
  }

  // 2. Step 1 of atomic creation: Supabase Auth user with normalized 10-digit mobile as initial password
  let createdAuthUserId: string | null = null;
  try {
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: normalizedMobile,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        employee_id,
      },
    });

    if (authError || !authData.user) {
      if (authError?.message?.toLowerCase().includes("already registered") || authError?.message?.includes("email_exists")) {
        return {
          ok: false,
          error: `Email address "${email}" is already registered in authentication.`,
          statusCode: 409,
        };
      }
      return {
        ok: false,
        error: authError?.message || "Failed to create authentication user.",
        statusCode: 500,
      };
    }

    createdAuthUserId = authData.user.id;

    // 3. Step 2 of atomic creation: staff_users table row with must_change_password = true
    const { data: staffRow, error: staffError } = await adminClient
      .from("staff_users")
      .insert({
        auth_user_id: createdAuthUserId,
        employee_id,
        name,
        email,
        mobile: normalizedMobile,
        role: role as StaffRole,
        salary,
        status: "active",
        must_change_password: true,
      })
      .select()
      .single();

    if (staffError) {
      // ROLLBACK: Delete auth user if database row insert fails
      console.error("Staff row insert failed, rolling back Auth user:", staffError);
      await adminClient.auth.admin.deleteUser(createdAuthUserId);

      if (staffError.code === "23505") {
        if (staffError.message.includes("employee_id")) {
          return {
            ok: false,
            error: `Employee ID "${employee_id}" is already in use.`,
            statusCode: 409,
          };
        }
        if (staffError.message.includes("email")) {
          return {
            ok: false,
            error: `Email "${email}" is already in use.`,
            statusCode: 409,
          };
        }
      }

      return {
        ok: false,
        error: staffError.message || "Failed to record staff member.",
        statusCode: 500,
      };
    }

    // 4. Audit Log (Never log passwords)
    await logStaffAudit(
      currentAdmin.email || "admin",
      staffRow.id,
      "create",
      {
        employee_id,
        name,
        email,
        role,
      },
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      ok: true,
      user: staffRow as StaffUser,
      message: `Account created. Login: ${email} / password: the mobile number.`,
    };
  } catch (err) {
    // Catch-all rollback
    if (createdAuthUserId) {
      try {
        await adminClient.auth.admin.deleteUser(createdAuthUserId);
      } catch {
        // ignore rollback error
      }
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected error during user creation.",
      statusCode: 500,
    };
  }
}

/**
 * Updates an existing staff user.
 * Validates only modified fields on the server.
 * Prevents an admin from changing their own role or deactivating themselves.
 */
export async function updateStaffUserAction(
  userId: string,
  changedFields: {
    name?: string;
    mobile?: string;
    role?: string;
    salary?: number;
    status?: string;
  },
) {
  const { user: currentAdmin } = await requireAdminRole();

  if (!userId || typeof userId !== "string") {
    return { ok: false, error: "Invalid user ID.", statusCode: 400 };
  }

  const adminClient = createSupabaseAdmin();

  // 1. Fetch current target staff user
  const { data: targetUser, error: fetchErr } = await adminClient
    .from("staff_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (fetchErr || !targetUser) {
    return { ok: false, error: "Staff user not found.", statusCode: 404 };
  }

  // 2. Validate changed fields with Zod
  const parsed = updateStaffSchema.safeParse(changedFields);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid update data.";
    return { ok: false, error: firstIssue, statusCode: 400 };
  }

  const updates = parsed.data;

  // 3. Self-protection guard: Admin cannot change their own role or deactivate themselves
  const isSelf =
    targetUser.auth_user_id === currentAdmin.id ||
    targetUser.email.toLowerCase() === currentAdmin.email?.toLowerCase();

  if (isSelf) {
    if (updates.role && updates.role !== "admin") {
      return {
        ok: false,
        error: "You cannot change your own role. Another administrator must make this change.",
        statusCode: 403,
      };
    }
    if (updates.status && updates.status === "inactive") {
      return {
        ok: false,
        error: "You cannot deactivate your own account to prevent administrative lockout.",
        statusCode: 403,
      };
    }
  }

  // 4. Handle activation / deactivation side-effects on Supabase Auth
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.mobile !== undefined) {
    const norm = normalizeTo10Digits(updates.mobile);
    if (!norm) {
      return {
        ok: false,
        error: "Please enter a valid 10-digit Indian mobile number.",
        statusCode: 400,
      };
    }
    updatePayload.mobile = norm;
  }
  if (updates.role !== undefined) updatePayload.role = updates.role;
  if (updates.salary !== undefined) updatePayload.salary = updates.salary;

  if (updates.status !== undefined) {
    updatePayload.status = updates.status;

    if (targetUser.auth_user_id) {
      if (updates.status === "inactive") {
        // Ban user in Auth and terminate active sessions
        try {
          await adminClient.auth.admin.updateUserById(targetUser.auth_user_id, {
            ban_duration: "876000h", // 100 years ban
          });
          await adminClient.auth.admin.signOut(targetUser.auth_user_id);
        } catch (e) {
          console.error("Failed to ban auth user:", e);
        }
      } else if (updates.status === "active") {
        // Remove ban from Auth
        try {
          await adminClient.auth.admin.updateUserById(targetUser.auth_user_id, {
            ban_duration: "none",
          });
        } catch (e) {
          console.error("Failed to unban auth user:", e);
        }
      }
    }
  }

  // 5. Update staff_users row
  const { error: updateError } = await adminClient
    .from("staff_users")
    .update(updatePayload)
    .eq("id", userId);

  if (updateError) {
    return {
      ok: false,
      error: updateError.message || "Failed to update staff user.",
      statusCode: 500,
    };
  }

  // 6. Audit Log
  const actionType =
    updates.status === "inactive"
      ? "deactivate"
      : updates.status === "active"
        ? "activate"
        : "edit";

  await logStaffAudit(
    currentAdmin.email || "admin",
    userId,
    actionType,
    {
      changed_fields: Object.keys(updates),
      ...updates,
    },
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { ok: true, message: `Updated ${targetUser.name} successfully.` };
}

/**
 * Toggles a user's status between active and inactive.
 * Deactivation immediately bans the Auth user and terminates sessions.
 */
export async function toggleStaffStatusAction(userId: string, newStatus: StaffStatus) {
  const { user: currentAdmin } = await requireAdminRole();

  const adminClient = createSupabaseAdmin();
  const { data: targetUser } = await adminClient
    .from("staff_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!targetUser) {
    return { ok: false, error: "Staff user not found.", statusCode: 404 };
  }

  // Self-protection
  const isSelf =
    targetUser.auth_user_id === currentAdmin.id ||
    targetUser.email.toLowerCase() === currentAdmin.email?.toLowerCase();

  if (isSelf && newStatus === "inactive") {
    return {
      ok: false,
      error: "You cannot deactivate your own account to prevent lockout.",
      statusCode: 403,
    };
  }

  // 1. Update Auth user ban status
  if (targetUser.auth_user_id) {
    try {
      if (newStatus === "inactive") {
        await adminClient.auth.admin.updateUserById(targetUser.auth_user_id, {
          ban_duration: "876000h",
        });
        await adminClient.auth.admin.signOut(targetUser.auth_user_id);
      } else {
        await adminClient.auth.admin.updateUserById(targetUser.auth_user_id, {
          ban_duration: "none",
        });
      }
    } catch (err) {
      console.error("Auth ban toggle error:", err);
    }
  }

  // 2. Update status in staff_users
  const { error } = await adminClient
    .from("staff_users")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, error: error.message, statusCode: 500 };
  }

  // 3. Audit log
  await logStaffAudit(
    currentAdmin.email || "admin",
    userId,
    newStatus === "active" ? "activate" : "deactivate",
    { previous_status: targetUser.status, new_status: newStatus },
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return {
    ok: true,
    message: `${targetUser.name} has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
  };
}

/**
 * Resets a staff user's login password back to their CURRENT registered mobile number
 * and marks must_change_password = true.
 * Passwords are NEVER returned, logged, or shown.
 */
export async function resetStaffPasswordAction(userId: string) {
  const { user: currentAdmin } = await requireAdminRole();

  const adminClient = createSupabaseAdmin();
  const { data: targetUser } = await adminClient
    .from("staff_users")
    .select("id, name, email, mobile, auth_user_id")
    .eq("id", userId)
    .maybeSingle();

  if (!targetUser || !targetUser.auth_user_id) {
    return { ok: false, error: "Staff user not found in authentication.", statusCode: 404 };
  }

  const normalizedMobile = normalizeTo10Digits(targetUser.mobile);
  if (!normalizedMobile) {
    return {
      ok: false,
      error: "User does not have a valid 10-digit mobile number on record.",
      statusCode: 400,
    };
  }

  try {
    // 1. Reset password in Supabase Auth to their current 10-digit mobile number
    const { error: resetError } = await adminClient.auth.admin.updateUserById(
      targetUser.auth_user_id,
      {
        password: normalizedMobile,
      },
    );

    if (resetError) {
      return { ok: false, error: resetError.message, statusCode: 500 };
    }

    // 2. Mark must_change_password = true in staff_users
    const { error: updateError } = await adminClient
      .from("staff_users")
      .update({
        must_change_password: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update must_change_password flag:", updateError);
    }

    // 3. Audit log: NEVER log the password
    await logStaffAudit(
      currentAdmin.email || "admin",
      userId,
      "reset_password",
      {
        target_email: targetUser.email,
        target_name: targetUser.name,
      },
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      ok: true,
      message: `Password reset to registered mobile number for ${targetUser.name}.`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reset password.",
      statusCode: 500,
    };
  }
}
