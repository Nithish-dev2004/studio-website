"use client";

// Sticky top navigation. Desktop: inline links. Mobile & Tablet: hamburger menu.
// Links come from data/site.ts. The current page's link is highlighted.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Container from "@/components/ui/Container";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { navItems, subBrands } from "@/data/site";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  // We remember WHICH page the menu was opened on. When the visitor navigates to another
  // page the paths no longer match, so the menu closes by itself (no extra effect needed).
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const brandsMenuRef = useRef<HTMLDivElement>(null);
  const menuOpen = openOnPath === pathname;

  // Close the mobile menu when the Escape key is pressed.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenOnPath(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Close the desktop brands menu when a visitor clicks elsewhere or presses Escape.
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!brandsMenuRef.current?.contains(event.target as Node)) setBrandsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBrandsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Hide the public navbar on all /admin and /account portal pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/account")) {
    return null;
  }

  // "/" only matches the home page; other links also match their sub-pages.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-[#261e17] bg-[#17120D] transition-colors">
      <Container className="flex h-16 sm:h-18 items-center justify-between">
        {/* Official Brand Logo */}
        <Link href="/" className="group flex items-center py-1 select-none shrink-0">
          <Image
            src="/images/logo.png"
            alt="Sivagangai Stories - Capture • Create • Share"
            width={220}
            height={44}
            priority
            className="h-8 w-auto sm:h-9 md:h-10 lg:h-9 xl:h-11 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop menu (Visible only on lg and up: 1024px+) */}
        <nav aria-label="Main" className="hidden items-center gap-3.5 xl:gap-7 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative py-2 text-xs xl:text-sm font-medium transition-colors duration-200"
              >
                <span
                  className={cn(
                    "transition-colors duration-200",
                    active
                      ? "text-[#C5923A] group-hover:text-[#dda84b]"
                      : "text-[#a89f91] group-hover:text-white",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#C5923A] transition-all duration-300 ease-out",
                    active
                      ? "w-4 shadow-[0_0_8px_rgba(197,146,58,0.7)] group-hover:w-full"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(197,146,58,0.5)]",
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}

          {/* Brands dropdown */}
          <div className="relative" ref={brandsMenuRef}>
            <div className="group flex items-center">
              <Link
                href="/brands"
                aria-current={isActive("/brands") ? "page" : undefined}
                onClick={() => setBrandsOpen(false)}
                className="relative py-2 text-xs xl:text-sm font-medium transition-colors duration-200"
              >
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive("/brands")
                      ? "text-[#C5923A] group-hover:text-[#dda84b]"
                      : "text-[#a89f91] group-hover:text-white",
                  )}
                >
                  Brands
                </span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#C5923A] transition-all duration-300 ease-out",
                    isActive("/brands")
                      ? "w-4 shadow-[0_0_8px_rgba(197,146,58,0.7)] group-hover:w-full"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(197,146,58,0.5)]",
                  )}
                  aria-hidden="true"
                />
              </Link>
              <button
                type="button"
                aria-label={brandsOpen ? "Close Brands menu" : "Open Brands menu"}
                aria-expanded={brandsOpen}
                aria-haspopup="menu"
                aria-controls="brands-menu"
                onClick={() => setBrandsOpen((open) => !open)}
                className={cn(
                  "ml-1 inline-flex h-7 w-5 items-center justify-center transition-colors cursor-pointer",
                  isActive("/brands")
                    ? "text-[#C5923A]"
                    : "text-[#a89f91] group-hover:text-white",
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    brandsOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Brands Dropdown Menu */}
            <AnimatePresence>
              {brandsOpen && (
                <motion.div
                  id="brands-menu"
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.75rem)] w-80 rounded-2xl border border-[#2e2319] bg-[#1a140f] p-2.5 shadow-2xl backdrop-blur-md"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {subBrands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      role="menuitem"
                      onClick={() => setBrandsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#261d15]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c5923a]/15 p-1">
                        <Image
                          src="/images/logo-icon.png"
                          alt={brand.name}
                          width={28}
                          height={28}
                          className="h-7 w-7 object-contain"
                        />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{brand.name}</span>
                        <span className="block truncate text-xs text-[#a89f91]">{brand.specialty}</span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle Button in Desktop Navbar */}
          <div className="border-l border-white/10 pl-3">
            <ThemeToggle className="border-white/15 bg-white/5 text-[#f4ede2] hover:bg-white/10 hover:text-white" />
          </div>

          {/* Book Now Button */}
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#F4EDE2] px-3.5 xl:px-6 py-2 xl:py-2.5 text-xs xl:text-sm font-bold text-[#17120D] shadow-xs transition-all duration-300 ease-in-out hover:bg-[#B9852F] hover:text-white active:scale-95 cursor-pointer ml-1"
          >
            <span>Book Now</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </nav>

        {/* Mobile / Tablet controls (Visible on screens < 1024px) */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Quick theme toggle on mobile/tablet bar */}
          <ThemeToggle className="border-white/15 bg-white/5 text-[#f4ede2] hover:bg-white/10 hover:text-white" />

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#f4ede2] hover:bg-white/5 hover:text-[#C5923A] transition-colors cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setOpenOnPath(menuOpen ? null : pathname)}
          >
            {menuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile & Tablet menu panel with safe height and internal scroll */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile and tablet navigation"
            className="max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-[#261e17] bg-[#17120D] lg:hidden shadow-2xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Container className="flex flex-col gap-1.5 py-5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpenOnPath(null)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors min-h-[44px]",
                      active
                        ? "bg-[#C5923A]/15 text-[#C5923A] font-semibold"
                        : "text-[#a89f91] hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C5923A]" />
                    )}
                  </Link>
                );
              })}

              <div className="mt-3 border-t border-[#261e17] pt-4">
                <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#746a5e]">
                  Our brands
                </p>
                {subBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    onClick={() => setOpenOnPath(null)}
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-white/5 min-h-[44px]"
                  >
                    <span className="flex items-center gap-2.5 font-medium text-white">
                      <Image
                        src="/images/logo-icon.png"
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                      <span>{brand.name}</span>
                    </span>
                    <span className="text-xs text-[#a89f91]">{brand.specialty}</span>
                  </Link>
                ))}
              </div>

              {/* Theme Selector inside Mobile Menu */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm font-medium text-white/80">Appearance</span>
                <ThemeToggle showLabel className="border-white/20 bg-black/40 text-white" />
              </div>

              <div className="mt-4 pt-2">
                <Link
                  href="/booking"
                  onClick={() => setOpenOnPath(null)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F4EDE2] px-6 py-3.5 text-sm font-bold text-[#17120D] shadow-sm transition-all duration-300 hover:bg-[#B9852F] hover:text-white min-h-[44px]"
                >
                  <span>Book Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
