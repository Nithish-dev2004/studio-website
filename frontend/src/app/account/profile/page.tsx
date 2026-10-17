// Staff Profile and Settings page (/account/profile).
// Displays account information and hosts the self-service Change Password form.

import Link from "next/link";
import {
  Calendar,
  KeyRound,
  LayoutDashboard,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { requireStaffAccount } from "@/lib/admin/auth";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export const metadata = {
  title: "My Profile & Settings | Staff Account",
  robots: { index: false, follow: false },
};

export default async function StaffProfilePage() {
  // allowChangePasswordPage: false ensures that if must_change_password is true,
  // the server automatically blocks this page and redirects to /account/change-password.
  const profile = await requireStaffAccount({ allowChangePasswordPage: false });
  const staff = profile.staffUser;
  const canAccessAdmin = profile.isSuperAdmin || profile.role === "admin" || profile.role === "manager";

  return (
    <div className="space-y-8">
      {/* Page Title & Admin Link */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Account & Profile
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            View your studio credentials and manage your account security settings.
          </p>
        </div>

        {canAccessAdmin && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-xs transition-colors hover:bg-accent/90"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Go to Admin Portal</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card (Left 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
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

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Address</span>
                </dt>
                <dd className="font-semibold text-foreground break-all select-all">
                  {staff?.email || profile.user.email}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Registered Mobile</span>
                </dt>
                <dd className="font-semibold text-foreground font-mono select-all">
                  {staff?.mobile || "Not specified"}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Account Status</span>
                </dt>
                <dd className="font-semibold text-success flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span>{staff?.status === "active" ? "Active" : "Super Admin"}</span>
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Member Since</span>
                </dt>
                <dd className="font-semibold text-foreground">
                  {staff?.created_at
                    ? new Date(staff.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Studio Inception"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Change Password Card (Right 1 column on lg) */}
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
