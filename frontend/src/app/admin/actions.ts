"use server";

// Server Actions for the Admin Dashboard.
// All actions run exclusively on the server, verify the admin session,
// validate inputs with Zod, and use the service role key for database operations.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminEmail, requireAdmin } from "@/lib/admin/auth";
import { isLikelyIndianPhone, normalizeTo10Digits } from "@/lib/admin/phone";
import { checkLoginRateLimit, recordFailedLogin, clearLoginRateLimit } from "@/lib/admin/rate-limit";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase/server";

// ---- Schemas for server validation ----

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .pipe(z.email("Please enter a valid email address.")),
  password: z.string().min(1, "Please enter your password."),
  next: z.string().optional().default("/admin"),
});

const bookingStatusSchema = z.enum(["pending", "confirmed", "cancelled", "completed"]);
const eventConsultationStatusSchema = z.enum(["pending", "contacted", "confirmed", "cancelled", "completed"]);
const signboardStatusSchema = z.enum([
  "new",
  "site_visit_scheduled",
  "measurement_done",
  "render_sent",
  "approved",
  "installed",
  "closed",
]);
const digitalMarketingStatusSchema = z.enum([
  "new",
  "contacted",
  "audit_sent",
  "in_progress",
  "converted",
  "closed",
]);

const uuidSchema = z.string().uuid("Invalid record ID.");

// Helper to determine the client IP from headers
async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headerList.get("x-real-ip") || "127.0.0.1";
}

export type LoginActionState = {
  success?: boolean;
  error?: string;
  redirectTo?: string;
};

/**
 * Handles administrator login with rate-limiting and authorization check.
 */
export async function loginAction(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawInput = {
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/admin",
  };

  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid email or password.";
    return { error: firstIssue };
  }

  const { email, password, next } = parsed.data;
  const ip = await getClientIp();
  const normalizedEmail = email.toLowerCase();
  const ipKey = `admin-login:ip:${ip}`;
  const emailKey = `admin-login:email:${normalizedEmail}`;

  // 1) Rate limiting check (independent checks on both IP and Email)
  const ipLimit = checkLoginRateLimit(ipKey);
  if (!ipLimit.allowed) {
    return {
      error: `Too many login attempts. Please wait ${Math.ceil(
        ipLimit.retryAfterSeconds / 60,
      )} minutes before trying again.`,
    };
  }

  const emailLimit = checkLoginRateLimit(emailKey);
  if (!emailLimit.allowed) {
    return {
      error: `Too many login attempts. Please wait ${Math.ceil(
        emailLimit.retryAfterSeconds / 60,
      )} minutes before trying again.`,
    };
  }

  // 2) Password normalization: if input looks like an Indian mobile number, normalize to 10 digits
  let primaryPassword = password;
  let fallbackPassword: string | null = null;

  if (isLikelyIndianPhone(password)) {
    const normalizedPhone = normalizeTo10Digits(password);
    if (normalizedPhone) {
      primaryPassword = normalizedPhone;
      if (normalizedPhone !== password) {
        fallbackPassword = password;
      }
    }
  }

  // 3) Authenticate with Supabase Auth
  try {
    const supabase = await createSupabaseServerClient();
    let authResult = await supabase.auth.signInWithPassword({
      email,
      password: primaryPassword,
    });

    // If normalized attempt fails and raw input was different, attempt with raw input
    if ((authResult.error || !authResult.data.user) && fallbackPassword) {
      const fallbackResult = await supabase.auth.signInWithPassword({
        email,
        password: fallbackPassword,
      });
      if (fallbackResult.data.user && !fallbackResult.error) {
        authResult = fallbackResult;
      }
    }

    const { data, error } = authResult;

    if (error || !data.user) {
      recordFailedLogin(ipKey);
      recordFailedLogin(emailKey);
      // Attacker-safe generic error message
      return { error: "Invalid email or password." };
    }

    // 4) Authorization check: email in ADMIN_EMAILS or active staff user
    const userEmail = data.user.email?.toLowerCase();
    const isSuperAdmin = isAdminEmail(userEmail);

    if (!isSuperAdmin) {
      // Check staff_users table
      const adminClient = createSupabaseAdmin();
      const { data: staffUser } = await adminClient
        .from("staff_users")
        .select("id, role, status, must_change_password")
        .or(`auth_user_id.eq.${data.user.id},email.eq.${userEmail}`)
        .maybeSingle();

      if (!staffUser) {
        await supabase.auth.signOut();
        recordFailedLogin(ipKey);
        recordFailedLogin(emailKey);
        return {
          error: "Access denied. This account does not have administrator privileges.",
        };
      }

      if (staffUser.status === "inactive") {
        await supabase.auth.signOut();
        return {
          error: "Your account is inactive. Contact the admin.",
        };
      }

      // If must_change_password is true, redirect immediately to /account/change-password
      if (staffUser.must_change_password) {
        clearLoginRateLimit(ipKey);
        clearLoginRateLimit(emailKey);
        return { success: true, redirectTo: "/account/change-password" };
      }
    }

    // 5) Success: reset rate limit counters
    clearLoginRateLimit(ipKey);
    clearLoginRateLimit(emailKey);

    // Sanitize redirect target to avoid open redirects
    const target =
      next.startsWith("/admin") || next.startsWith("/account")
        ? next
        : "/admin";
    return { success: true, redirectTo: target };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Authentication service error.",
    };
  }
}

/**
 * Signs out the admin user and redirects to the login screen.
 */
export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Continue to redirect even if signOut errors
  }
  redirect("/admin/login?logged_out=true");
}

/**
 * Updates the status of a booking (pending, confirmed, cancelled, completed).
 */
export async function updateBookingStatusAction(bookingId: string, status: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(bookingId);
  const statusCheck = bookingStatusSchema.safeParse(status);

  if (!idCheck.success || !statusCheck.success) {
    return { ok: false, error: "Invalid booking ID or status value." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("bookings")
      .update({
        status: statusCheck.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    return { ok: true, message: `Booking status updated to ${statusCheck.data}.` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update booking status.",
    };
  }
}

/**
 * Deletes a booking from the database after confirmation.
 */
export async function deleteBookingAction(bookingId: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(bookingId);
  if (!idCheck.success) {
    return { ok: false, error: "Invalid booking ID." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("bookings").delete().eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    return { ok: true, message: "Booking has been deleted." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete booking.",
    };
  }
}

/**
 * Marks a contact message as read or unread.
 */
export async function toggleMessageReadAction(messageId: string, isRead: boolean) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(messageId);
  if (!idCheck.success) {
    return { ok: false, error: "Invalid message ID." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("contacts")
      .update({ is_read: isRead })
      .eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { ok: true, message: isRead ? "Marked as read." : "Marked as unread." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update message.",
    };
  }
}

/**
 * Deletes a contact message after confirmation.
 */
export async function deleteMessageAction(messageId: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(messageId);
  if (!idCheck.success) {
    return { ok: false, error: "Invalid message ID." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("contacts").delete().eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { ok: true, message: "Message has been deleted." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete message.",
    };
  }
}

/**
 * Updates the status of an Event Consultation.
 */
export async function updateEventConsultationStatusAction(consultationId: string, status: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(consultationId);
  const statusCheck = eventConsultationStatusSchema.safeParse(status);

  if (!idCheck.success || !statusCheck.success) {
    return { ok: false, error: "Invalid consultation ID or status value." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("event_consultations")
      .update({
        status: statusCheck.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/events");
    return { ok: true, message: `Event consultation status updated to ${statusCheck.data}.` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update event consultation status.",
    };
  }
}

/**
 * Deletes an Event Consultation after confirmation.
 */
export async function deleteEventConsultationAction(consultationId: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(consultationId);
  if (!idCheck.success) {
    return { ok: false, error: "Invalid consultation ID." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("event_consultations").delete().eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/events");
    return { ok: true, message: "Event consultation deleted." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete event consultation.",
    };
  }
}

/**
 * Updates the status of a Sign Board booking/order.
 */
export async function updateSignboardStatusAction(bookingId: string, status: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(bookingId);
  const statusCheck = signboardStatusSchema.safeParse(status);

  if (!idCheck.success || !statusCheck.success) {
    return { ok: false, error: "Invalid signboard booking ID or status value." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("signboard_bookings")
      .update({
        status: statusCheck.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/signboard");
    return { ok: true, message: `Signboard order status updated to ${statusCheck.data.replace(/_/g, " ")}.` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update signboard order status.",
    };
  }
}

/**
 * Deletes a Sign Board booking after confirmation.
 */
export async function deleteSignboardBookingAction(bookingId: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(bookingId);
  if (!idCheck.success) {
    return { ok: false, error: "Invalid booking ID." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("signboard_bookings").delete().eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/signboard");
    return { ok: true, message: "Signboard booking deleted." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete signboard booking.",
    };
  }
}

/**
 * Updates the status of a Digital Marketing audit & booking request.
 */
export async function updateDigitalMarketingStatusAction(bookingId: string, status: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(bookingId);
  const statusCheck = digitalMarketingStatusSchema.safeParse(status);

  if (!idCheck.success || !statusCheck.success) {
    return { ok: false, error: "Invalid booking ID or status value." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("digital_marketing_bookings")
      .update({
        status: statusCheck.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/digital-marketing");
    return { ok: true, message: `Digital marketing status updated to ${statusCheck.data.replace(/_/g, " ")}.` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update digital marketing status.",
    };
  }
}

/**
 * Deletes a Digital Marketing booking after confirmation.
 */
export async function deleteDigitalMarketingBookingAction(bookingId: string) {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(bookingId);
  if (!idCheck.success) {
    return { ok: false, error: "Invalid booking ID." };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("digital_marketing_bookings").delete().eq("id", idCheck.data);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/digital-marketing");
    return { ok: true, message: "Digital marketing request deleted." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete digital marketing request.",
    };
  }
}

