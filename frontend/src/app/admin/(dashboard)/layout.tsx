// Server-side layout for authenticated admin dashboard pages.
// Checks admin authorization before rendering any child page.

import { requireAdmin } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always verify authorization on the server. Never rely on client state alone.
  const profile = await requireAdmin();

  return (
    <AdminShell userEmail={profile.user.email} userRole={profile.role}>
      {children}
    </AdminShell>
  );
}
