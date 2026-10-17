// Layout for authenticated staff /account portal pages.
// Enforces server-side authentication and provides a consistent responsive navigation shell.

import React from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, ShieldCheck, User } from "lucide-react";
import { requireStaffAccount } from "@/lib/admin/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminToastProvider } from "@/components/admin/AdminToastContext";
import { siteConfig } from "@/data/site";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireStaffAccount({ allowChangePasswordPage: true });
  const isPendingPasswordChange = Boolean(profile.staffUser?.must_change_password);
  const canAccessAdmin = profile.isSuperAdmin || profile.role === "admin" || profile.role === "manager";

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href={isPendingPasswordChange ? "#" : "/account/profile"}
                className="flex items-center gap-2.5 font-heading text-lg font-bold text-foreground"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span>
                  {siteConfig.name} <span className="text-xs font-normal text-muted-foreground">Staff Portal</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Back to Admin link if authorized and not forced */}
              {!isPendingPasswordChange && canAccessAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 border-l border-border pl-3 text-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground font-semibold">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-foreground truncate max-w-[130px]">
                    {profile.staffUser?.name || profile.user.email}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-accent">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Sign out form */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </AdminToastProvider>
  );
}
