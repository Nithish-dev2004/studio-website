// Staff Profile and Settings page (/account/profile).
// Displays the staff member's personal credentials and salary in read-only cards,
// and hosts the Change Password form (current password, new password, confirmation).

import React from "react";
import {
  BadgeIndianRupee,
  Calendar,
  KeyRound,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { requireStaffAccount } from "@/lib/admin/auth";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export const metadata = {
  title: "My Details & Settings | Staff Portal",
  robots: { index: false, follow: false },
};

export default async function StaffProfilePage() {
  // Enforces server-side active staff verification
  const profile = await requireStaffAccount({ allowChangePasswordPage: false });
  const staff = profile.staffUser;

  const formattedSalary =
    staff?.salary != null
      ? `₹${Number(staff.salary).toLocaleString("en-IN")}`
      : "Not configured";

  const joinedDate = staff?.created_at
    ? new Date(staff.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Studio Inception";

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Details & Credentials
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Review your verified studio employment details and update your security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card (Left 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-border pb-5 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent font-bold text-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {staff?.name || profile.user.email}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    {staff?.employee_id || "SUPER-ADMIN"}
                  </span>
                  <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              {/* Employee ID */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-accent" />
                  <span>Employee ID</span>
                </dt>
                <dd className="font-semibold text-foreground font-mono select-all">
                  {staff?.employee_id || "SUPER-ADMIN"}
                </dd>
              </div>

              {/* Full Name */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-accent" />
                  <span>Full Name</span>
                </dt>
                <dd className="font-semibold text-foreground">
                  {staff?.name || "Administrator"}
                </dd>
              </div>

              {/* Email Address */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-accent" />
                  <span>Email Address</span>
                </dt>
                <dd className="font-semibold text-foreground break-all select-all">
                  {staff?.email || profile.user.email}
                </dd>
              </div>

              {/* Registered Mobile */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  <span>Registered Mobile</span>
                </dt>
                <dd className="font-semibold text-foreground font-mono select-all">
                  {staff?.mobile || "Not specified"}
                </dd>
              </div>

              {/* Assigned Role */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                  <span>Assigned Role</span>
                </dt>
                <dd className="font-semibold text-foreground uppercase tracking-wide">
                  {profile.role}
                </dd>
              </div>

              {/* Monthly Salary */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <BadgeIndianRupee className="h-3.5 w-3.5 text-accent" />
                  <span>Monthly Salary</span>
                </dt>
                <dd className="font-semibold text-foreground font-mono">
                  {formattedSalary}
                </dd>
              </div>

              {/* Account Status */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                  <span>Account Status</span>
                </dt>
                <dd className="font-semibold text-success flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span>{staff?.status === "active" ? "Active Staff" : "Super Admin"}</span>
                </dd>
              </div>

              {/* Joined Date */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <span>Joined Date</span>
                </dt>
                <dd className="font-semibold text-foreground">
                  {joinedDate}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Change Password Card (Right column on desktop) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Change Password</h3>
                <p className="text-[11px] text-muted-foreground">
                  Update your personal login password.
                </p>
              </div>
            </div>

            <ChangePasswordForm
              userMobile={staff?.mobile}
              isForced={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
