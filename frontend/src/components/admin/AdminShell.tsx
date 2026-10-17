"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useAdminToast } from "./AdminToastContext";
import { siteConfig } from "@/data/site";

import type { StaffRole } from "@/types/staff";

interface AdminShellProps {
  userEmail?: string | null;
  userRole?: StaffRole | null;
  children: React.ReactNode;
}

export default function AdminShell({ userEmail, userRole, children }: AdminShellProps) {
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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <AdminSidebar
        userEmail={userEmail}
        userRole={userRole}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header (Hidden on md and up) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-heading text-base font-bold tracking-tight text-card-foreground">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent/30">
            Admin
          </span>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
