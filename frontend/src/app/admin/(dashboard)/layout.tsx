// Server-side layout for authenticated admin dashboard pages.
// Checks admin authorization before rendering any child page.

import { requireAdmin } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always verify authorization on the server. Never rely on client state alone.
  const profile = await requireAdmin();

  let pendingFeedbackCount = 0;
  try {
    const supabase = createSupabaseAdmin();
    const { count, error } = await supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (!error && count !== null) {
      pendingFeedbackCount = count;
    }
  } catch {
    // If table doesn't exist yet, fallback to 0
  }

  return (
    <AdminShell
      userEmail={profile.user.email}
      userRole={profile.role}
      pendingFeedbackCount={pendingFeedbackCount}
    >
      {children}
    </AdminShell>
  );
}

