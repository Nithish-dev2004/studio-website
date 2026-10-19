"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { logoutAction } from "@/app/admin/actions";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/types/staff";

interface AdminSidebarProps {
  userEmail?: string | null;
  userRole?: StaffRole | null;
  pendingFeedbackCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    adminOnly: false,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    exact: false,
    adminOnly: true,
  },
  {
    href: "/admin/bookings",
    label: "Studio Bookings",
    icon: CalendarDays,
    exact: false,
    adminOnly: false,
  },
  {
    href: "/admin/events",
    label: "Event Consultations",
    icon: Sparkles,
    exact: false,
    adminOnly: false,
  },
  {
    href: "/admin/signboard",
    label: "Sign Board Orders",
    icon: Layers,
    exact: false,
    adminOnly: false,
  },
  {
    href: "/admin/digital-marketing",
    label: "Digital Marketing",
    icon: TrendingUp,
    exact: false,
    adminOnly: false,
  },
  {
    href: "/admin/messages",
    label: "Messages Inbox",
    icon: Mail,
    exact: false,
    adminOnly: false,
  },
  {
    href: "/admin/feedback",
    label: "Feedback",
    icon: MessageSquareHeart,
    exact: false,
    adminOnly: false,
    badgeKey: "pendingFeedback",
  },
];

export default function AdminSidebar({
  userEmail,
  userRole,
  pendingFeedbackCount = 0,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
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
      className="flex h-full min-h-0 flex-col"
      style={{ background: "linear-gradient(180deg, #2a2013 0%, #38291a 60%, #3d2e1c 100%)" }}
    >
      {/* Top: brand */}
      <div className="shrink-0 px-5 pt-6 pb-4">
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #d4a843, #a8722a)" }}
            >
              <ShieldCheck className="h-5 w-5 text-white" />
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
                Admin Console
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

        {/* User identification */}
        {userEmail && (
          <div
            className="mt-5 rounded-lg px-3 py-2.5"
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
              title={userEmail}
            >
              {userEmail}
            </p>
          </div>
        )}
      </div>

      {/* Thin divider */}
      <div
        className="mx-5 shrink-0"
        style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
      />

      {/* MANAGE section label */}
      <div className="px-5 pt-4 pb-1 shrink-0">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "#5c5040" }}
        >
          Manage
        </p>
      </div>

      {/* Middle: independently scrollable navigation */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 space-y-0.5"
        aria-label="Admin Navigation"
      >
        {navItems
          .filter((item) => !item.adminOnly || userRole === "admin")
          .map((item) => {
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
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#c9a84c] to-[#a86f28] text-[#1a1005] font-semibold shadow-sm"
                    : "text-[#c4b49a] hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.20)] hover:to-[rgba(168,111,40,0.10)] hover:text-white"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.badgeKey === "pendingFeedback" &&
                  (pendingFeedbackCount || 0) > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={
                        isActive
                          ? { background: "rgba(26,16,5,0.25)", color: "#1a1005" }
                          : { background: "rgba(201,168,76,0.22)", color: "#c9a84c" }
                      }
                    >
                      {pendingFeedbackCount}
                    </span>
                  )}
              </Link>
            );
          })}
      </nav>

      {/* Bottom Actions: View Site & Logout */}
      <div
        className="shrink-0 px-3 py-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Link
          href="/account/profile"
          onClick={handleLinkClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#9a8c78] transition-all duration-200 hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.15)] hover:to-[rgba(168,111,40,0.08)] hover:text-white"
        >
          <User className="h-4 w-4" />
          <span>My Account</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#9a8c78] transition-all duration-200 hover:bg-gradient-to-r hover:from-[rgba(201,168,76,0.15)] hover:to-[rgba(168,111,40,0.08)] hover:text-white"
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
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all"
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
      {/* Desktop Sidebar (persistent) */}
      <aside className="hidden h-dvh w-64 shrink-0 md:sticky md:top-0 md:flex md:flex-col overflow-hidden">
        {navContent}
      </aside>

      {/* Mobile Drawer (overlay) */}
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
        title="Sign Out of Admin Console"
        description="Are you sure you want to sign out? You will need to enter your admin credentials again to access the dashboard."
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
