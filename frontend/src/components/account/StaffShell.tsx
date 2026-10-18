"use client";

// StaffShell: Core shell component for the staff portal (/account).
// Provides:
// 1. Desktop sidebar + mobile responsive drawer.
// 2. Desktop topbar with page title, user menu, role pill, and sign-out button.
// 3. Mobile header with hamburger trigger, logo, and staff role pill.
// 4. Session toast loading logic.

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut, Menu, ShieldCheck, User } from "lucide-react";
import StaffSidebar from "./StaffSidebar";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { useAdminToast } from "@/components/admin/AdminToastContext";
import { logoutAction } from "@/app/admin/actions";
import { siteConfig } from "@/data/site";
import type { StaffRole } from "@/types/staff";

interface StaffShellProps {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: StaffRole | null;
  employeeId?: string | null;
  canAccessAdmin?: boolean;
  children: React.ReactNode;
}

export default function StaffShell({
  userName,
  userEmail,
  userRole,
  employeeId,
  canAccessAdmin = false,
  children,
}: StaffShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, startTransition] = useTransition();
  const { showToast } = useAdminToast();
  const toastLoadedRef = useRef(false);

  // Pick human-readable title and subtitle based on current route
  let pageTitle = "Staff Dashboard";
  let pageSubtitle = "Overview of your upcoming assignments and studio schedule";

  if (pathname.startsWith("/account/bookings")) {
    pageTitle = "My Bookings";
    pageSubtitle = "Confirmed studio appointments, schedules, and client contact details";
  } else if (pathname.startsWith("/account/profile")) {
    pageTitle = "My Details & Security";
    pageSubtitle = "Review your credentials and update your account password";
  } else if (pathname.startsWith("/account/change-password")) {
    pageTitle = "Account Security";
    pageSubtitle = "Update your permanent login password";
  }

  useEffect(() => {
    if (toastLoadedRef.current) return;
    try {
      const saved = sessionStorage.getItem("admin_toast");
      if (saved) {
        toastLoadedRef.current = true;
        sessionStorage.removeItem("admin_toast");
        const parsed = JSON.parse(saved);
        showToast(parsed.message, parsed.type || "success");
      }
    } catch {
      // ignore
    }
  }, [showToast]);

  const handleConfirmLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop & Mobile Slide-Out Drawer */}
      <StaffSidebar
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        employeeId={employeeId}
        canAccessAdmin={canAccessAdmin}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header (Screens < 768px) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/account" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-heading text-base font-bold tracking-tight text-card-foreground">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent/30">
            {userRole || "Staff"}
          </span>
        </header>

        {/* Desktop Topbar (Screens >= 768px) */}
        <header className="sticky top-0 z-30 hidden md:flex h-16 items-center justify-between border-b border-border bg-card/90 px-6 lg:px-8 backdrop-blur-md">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-foreground tracking-tight truncate">
              {pageTitle}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {pageSubtitle}
            </p>
          </div>

          {/* Desktop User Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {canAccessAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            <div className="flex items-center gap-2.5 border-l border-border pl-3 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground font-semibold">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-foreground truncate max-w-[150px]">
                  {userName || userEmail}
                </span>
                <span className="text-[10px] uppercase font-bold text-accent">
                  {userRole || "Staff"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              title="Sign out"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog for Topbar */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Sign Out of Staff Portal"
        description="Are you sure you want to sign out? You will need your staff login credentials to access the workspace again."
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Signed In"
        variant="destructive"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => {
          if (!isLoggingOut) {
            setIsLogoutModalOpen(false);
          }
        }}
      />
    </div>
  );
}
