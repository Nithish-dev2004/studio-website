"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useAdminToast } from "./AdminToastContext";
import { siteConfig } from "@/data/site";
import type { StaffRole } from "@/types/staff";

interface AdminShellProps {
  userEmail?: string | null;
  userRole?: StaffRole | null;
  pendingFeedbackCount?: number;
  children: React.ReactNode;
}

export default function AdminShell({
  userEmail,
  userRole,
  pendingFeedbackCount = 0,
  children,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useAdminToast();
  const toastLoadedRef = useRef(false);

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

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      {/* Sidebar for Desktop (1024px+) & Mobile/Tablet Drawer (< 1024px) */}
      <AdminSidebar
        userEmail={userEmail}
        userRole={userRole}
        pendingFeedbackCount={pendingFeedbackCount}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile & Tablet Header (Screens < 1024px) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/admin" className="flex items-center gap-2">
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
              <span className="font-heading text-base font-bold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent/30">
            Admin
          </span>
        </header>

        {/* Desktop Topbar (Screens >= 1024px) */}
        <header className="sticky top-0 z-30 hidden lg:flex h-16 items-center justify-between border-b border-border bg-card/85 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">
              Studio Admin Console
            </h1>
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30">
              {userRole || "Administrator"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-xs text-muted-foreground font-mono">
                {userEmail}
              </span>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
