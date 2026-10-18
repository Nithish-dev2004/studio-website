// Layout for authenticated staff /account portal pages.
// Enforces server-side authentication and provides a consistent responsive navigation shell.

import React from "react";
import type { Metadata } from "next";
import { requireStaffAccount } from "@/lib/admin/auth";
import { AdminToastProvider } from "@/components/admin/AdminToastContext";
import StaffShell from "@/components/account/StaffShell";

export const metadata: Metadata = {
  title: "Staff Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireStaffAccount({ allowChangePasswordPage: true });
  const canAccessAdmin =
    profile.isSuperAdmin || profile.role === "admin" || profile.role === "manager";

  return (
    <AdminToastProvider>
      <StaffShell
        userName={profile.staffUser?.name || profile.user.email}
        userEmail={profile.user.email}
        userRole={profile.role}
        employeeId={profile.staffUser?.employee_id}
        canAccessAdmin={canAccessAdmin}
      >
        {children}
      </StaffShell>
    </AdminToastProvider>
  );
}
