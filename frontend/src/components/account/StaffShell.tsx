"use client";

// StaffShell: Core shell component for the staff portal (/account).
// Provides:
// 1. Desktop sidebar + mobile responsive drawer.
// 2. Desktop topbar with page title, user menu, role pill, and sign-out button.
// 3. Mobile header with hamburger trigger, logo, and staff role pill.
// 4. Session toast loading logic.

import React, { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut, Menu, User } from "lucide-react";
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
        {/* Mobile & Tablet Header (Screens < 1024px) */}
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 backdrop-blur-md lg:hidden"
          style={{
            background: "rgba(30,22,12,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9a8c78" }}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/account" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md p-1"
                style={{ background: "linear-gradient(135deg, #d4a843, #a8722a)" }}
              >
                <Image
                  src="/images/logo-icon.png"
                  alt={siteConfig.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(201,168,76,0.15)",
              color: "#c9a84c",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            {userRole || "Staff"}
          </span>
        </header>

        {/* Desktop Topbar (Screens >= 1024px) */}
        <header
          className="sticky top-0 z-30 hidden lg:flex h-16 items-center justify-between px-6 lg:px-8 backdrop-blur-md"
          style={{
            background: "rgba(26,18,8,0.88)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold tracking-tight text-white truncate">
              {pageTitle}
            </h1>
            <p className="text-xs truncate" style={{ color: "#7a6e5e" }}>
              {pageSubtitle}
            </p>
          </div>

          {/* Desktop User Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {canAccessAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#9a8c78] transition-all duration-200 hover:border-[rgba(201,168,76,0.35)] hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.18)] hover:to-[rgba(168,111,40,0.10)] hover:text-[#f8f1e0]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#c9a84c]" />
                <span>Admin Console</span>
              </Link>
            )}

            <div
              className="flex items-center gap-2.5 pl-3 text-xs"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white"
                style={{ background: "rgba(201,168,76,0.25)", border: "1px solid rgba(201,168,76,0.35)" }}
              >
                <User className="h-4 w-4" style={{ color: "#c9a84c" }} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-white truncate max-w-[150px]">
                  {userName || userEmail}
                </span>
                <span
                  className="text-[10px] uppercase font-bold"
                  style={{ color: "#c9a84c" }}
                >
                  {userRole || "Staff"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              title="Sign out"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#c4b49a] transition-all duration-200 cursor-pointer hover:border-[rgba(201,168,76,0.4)] hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.22)] hover:to-[rgba(168,111,40,0.12)] hover:text-white hover:shadow-xs active:scale-[0.98]"
            >
              <LogOut className="h-3.5 w-3.5 text-[#c9a84c] transition-transform duration-200 group-hover:translate-x-0.5" />
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
