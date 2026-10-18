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
    <div className="flex h-full flex-col justify-between p-4 sm:p-6">
      {/* Top Header & Navigation */}
      <div className="space-y-6">
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
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
                Admin Console
              </span>
            </div>
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User identification */}
        {userEmail && (
          <div className="rounded-lg border border-border bg-muted/60 p-3">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Signed in as
              </p>
              {userRole && (
                <span className="rounded-sm border border-accent/30 bg-accent/15 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-accent">
                  {userRole}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-semibold text-card-foreground" title={userEmail}>
              {userEmail}
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Admin Navigation">
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
                    "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badgeKey === "pendingFeedback" && (pendingFeedbackCount || 0) > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider",
                        isActive
                          ? "bg-background text-accent"
                          : "bg-accent/20 text-accent",
                      )}
                    >
                      {pendingFeedbackCount}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </div>


      {/* Bottom Actions: View Site & Logout */}
      <div className="space-y-1.5 border-t border-border pt-4">
        <Link
          href="/account/profile"
          onClick={handleLinkClick}
          className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <User className="h-4 w-4" />
          <span>My Account</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
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
      <aside className="hidden h-screen w-64 shrink-0 border-r border-border bg-card md:sticky md:top-0 md:flex md:flex-col">
        {navContent}
      </aside>

      {/* Mobile Drawer (overlay) */}
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
