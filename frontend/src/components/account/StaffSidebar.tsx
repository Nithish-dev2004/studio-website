"use client";

// Responsive Sidebar for the Staff Portal (/account).
// Features:
// 1. Desktop fixed-width sidebar (w-64) + mobile slide-out drawer.
// 2. Navigation items: Dashboard, My Bookings, My Details.
// 3. Bottom actions: View website, Sign out with accessible confirmation modal.
// 4. Strict isolation: Admin-only sections (Users, Messages, full studio management) are NEVER shown.

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { logoutAction } from "@/app/admin/actions";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/types/staff";

interface StaffSidebarProps {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: StaffRole | null;
  employeeId?: string | null;
  canAccessAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const staffNavItems = [
  {
    href: "/account",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/account/bookings",
    label: "My Bookings",
    icon: CalendarDays,
    exact: false,
  },
  {
    href: "/account/profile",
    label: "My Details",
    icon: User,
    exact: false,
  },
];

export default function StaffSidebar({
  userName,
  userEmail,
  userRole,
  employeeId,
  canAccessAdmin = false,
  isOpen = false,
  onClose,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, startTransition] = useTransition();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleOpenLogoutModal = () => {
    if (onClose) onClose();
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Header & Navigation */}
      <div className="space-y-6">
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-card-foreground">
                {siteConfig.name}
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-accent">
                Staff Portal
              </span>
            </div>
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Staff Member Card */}
        <div className="rounded-lg border border-border bg-muted/60 p-3">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Signed in as
            </p>
            <span className="rounded-sm border border-accent/30 bg-accent/15 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-accent">
              {userRole || "Staff"}
            </span>
          </div>
          <p
            className="mt-1 truncate text-xs font-semibold text-card-foreground"
            title={userName || userEmail || ""}
          >
            {userName || userEmail}
          </p>
          {employeeId && (
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
              ID: {employeeId}
            </p>
          )}
        </div>

        {/* Staff Navigation Links */}
        <nav className="space-y-1.5" aria-label="Staff Navigation">
          {staffNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Admin Link (if authorized), View Site & Logout */}
      <div className="space-y-1.5 border-t border-border pt-4">
        {canAccessAdmin && (
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-accent transition-colors hover:bg-accent/10 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Admin Console</span>
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground min-h-[44px]"
        >
          <span className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4" />
            <span>View Website</span>
          </span>
          <span className="text-xs text-muted-foreground/60">↗</span>
        </Link>

        <button
          type="button"
          onClick={handleOpenLogoutModal}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer min-h-[44px]"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (persistent, sticky top-0) */}
      <aside className="hidden h-screen w-64 shrink-0 border-r border-border bg-card md:sticky md:top-0 md:flex md:flex-col">
        {navContent}
      </aside>

      {/* Mobile Drawer (overlay on screens < 768px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-10 w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl">
            {navContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
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
    </>
  );
}
