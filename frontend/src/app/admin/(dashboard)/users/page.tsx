// Staff & Users Management Page (/admin/users).
// Strictly protected on the server: only 'admin' role accounts can access this page.
// Loads staff records via the service role key and renders the responsive UsersTable.

import React from "react";
import type { Metadata } from "next";
import UsersTable from "@/components/admin/UsersTable";
import { requireAdminRole } from "@/lib/admin/auth";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { StaffUser } from "@/types/staff";

export const metadata: Metadata = {
  title: "Users & Staff Directory | Admin Console",
  description: "Manage employee credentials, role permissions, active status, and compensation.",
};

export const revalidate = 0;

export default async function AdminUsersPage() {
  // 1. Server-side guard: Strictly enforce admin role
  const profile = await requireAdminRole();

  // 2. Fetch staff users via service role client (bypasses RLS server-side)
  let staffUsers: StaffUser[] = [];
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("staff_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load staff users:", error.message);
    } else if (data) {
      staffUsers = data.map((row) => ({
        id: row.id,
        auth_user_id: row.auth_user_id,
        employee_id: row.employee_id,
        name: row.name,
        email: row.email,
        mobile: row.mobile,
        role: row.role,
        salary: Number(row.salary),
        status: row.status,
        must_change_password: Boolean(row.must_change_password),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    }
  } catch (err) {
    console.error("Error connecting to Supabase for staff users:", err);
  }

  return (
    <UsersTable
      initialUsers={staffUsers}
      viewerEmail={profile.user.email}
      viewerIsAdmin={profile.role === "admin"}
    />
  );
}
