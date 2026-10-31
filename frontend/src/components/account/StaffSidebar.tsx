"use client";

// Responsive Sidebar for the Staff Portal (/account).
// Features:
// 1. Desktop fixed-width sidebar (w-64) + mobile slide-out drawer.
// 2. Navigation items: Dashboard, My Bookings, My Details.
// 3. Bottom actions: View website, Sign out with accessible confirmation modal.
// 4. Strict isolation: Admin-only sections (Users, Messages, full studio management) are NEVER shown.

import React, { useState, useTransition } from "react";
import Image from "next/image";
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
    <div
      className="flex h-full flex-col"
      style={{ background: "linear-gradient(180deg, #2a2013 0%, #38291a 60%, #3d2e1c 100%)" }}
    >
      {/* Top: brand */}
      <div className="shrink-0 px-5 pt-6 pb-4">
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            onClick={handleLinkClick}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm shrink-0 p-1"
              style={{ background: "linear-gradient(135deg, #d4a843, #a8722a)" }}
            >
              <Image
                src="/images/logo-icon.png"
                alt={siteConfig.name}
                width={32}
                height={32}
                className="h-7 w-7 object-contain drop-shadow-xs"
              />
            </div>
            <div>
              <span
                className="block text-sm font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {siteConfig.name}
              </span>
              <span
                className="block text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "#c9a84c" }}
              >
                Staff Portal
              </span>
            </div>
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-md p-1.5 md:hidden"
              style={{ color: "#9a8c78" }}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Staff Member identification */}
        <div
          className="mt-5 rounded-lg px-3 py-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <div className="flex items-center justify-between gap-1">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "#7a6e5e" }}
            >
              Signed in as
            </p>
            {userRole && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                style={{
                  background: "rgba(201,168,76,0.18)",
                  color: "#c9a84c",
                  border: "1px solid rgba(201,168,76,0.28)",
                }}
              >
                {userRole}
              </span>
            )}
          </div>
          <p
            className="mt-0.5 truncate text-xs font-semibold text-white"
            title={userName || userEmail || ""}
          >
            {userName || userEmail}
          </p>
          {employeeId && (
            <p
              className="mt-0.5 font-mono text-[10px]"
              style={{ color: "#7a6e5e" }}
            >
              ID: {employeeId}
            </p>
          )}
        </div>
      </div>

      {/* Thin divider */}
      <div
        className="mx-5 shrink-0"
        style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
      />

      {/* Nav label */}
      <div className="px-5 pt-4 pb-1 shrink-0">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "#5c5040" }}
        >
          Navigation
        </p>
      </div>

      {/* Staff Navigation Links */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 space-y-0.5"
        aria-label="Staff Navigation"
      >
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
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]",
                isActive
                  ? "bg-gradient-to-r from-[#c9a84c] to-[#a86f28] text-[#1a1005] font-semibold shadow-sm"
                  : "text-[#c4b49a] hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.20)] hover:to-[rgba(168,111,40,0.10)] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div
        className="shrink-0 px-3 py-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {canAccessAdmin && (
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#c9a84c] transition-all duration-200 min-h-[44px] hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.18)] hover:to-[rgba(168,111,40,0.10)] hover:text-[#f8f1e0]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Admin Console</span>
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#9a8c78] transition-all duration-200 min-h-[44px] hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.15)] hover:to-[rgba(168,111,40,0.08)] hover:text-white"
        >
          <span className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4" />
            <span>View Website</span>
          </span>
          <span className="text-xs" style={{ color: "#5c5040" }}>↗</span>
        </Link>

        <button
          type="button"
          onClick={handleOpenLogoutModal}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer min-h-[44px]"
          style={{ color: "#d97070" }}
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
      <aside className="hidden h-screen w-64 shrink-0 md:sticky md:top-0 md:flex md:flex-col overflow-hidden">
        {navContent}
      </aside>

      {/* Mobile Drawer (overlay on screens < 768px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-10 w-72 max-w-[85vw] shadow-2xl overflow-hidden">
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
