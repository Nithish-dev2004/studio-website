"use client";

// Sticky top navigation. Desktop: inline links. Mobile: hamburger menu.
// Links come from data/site.ts. The current page's link is highlighted.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { navItems, siteConfig, subBrands } from "@/data/site";
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

  // Close the desktop menu when a visitor clicks elsewhere or presses Escape.
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

  // Hide the public navbar on all /admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // "/" only matches the home page; other links also match their sub-pages.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="bg-background/90 border-border sticky top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-heading text-2xl font-medium">
          {siteConfig.name}
        </Link>

        {/* Desktop menu */}
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "hover:text-accent text-sm transition-colors",
                isActive(item.href) ? "text-accent font-medium" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative" ref={brandsMenuRef}>
            <div className="flex items-center">
              <Link
                href="/brands"
                aria-current={isActive("/brands") ? "page" : undefined}
                onClick={() => setBrandsOpen(false)}
                className={cn(
                  "hover:text-accent text-sm transition-colors",
                  isActive("/brands") ? "text-accent font-medium" : "text-muted-foreground",
                )}
              >
                Brands
              </Link>
              <button
                type="button"
                aria-label={brandsOpen ? "Close Brands menu" : "Open Brands menu"}
                aria-expanded={brandsOpen}
                aria-haspopup="menu"
                aria-controls="brands-menu"
                onClick={() => setBrandsOpen((open) => !open)}
                className={cn(
                  "hover:text-accent ml-0.5 inline-flex h-8 w-6 items-center justify-center transition-colors",
                  isActive("/brands") ? "text-accent" : "text-muted-foreground",
                )}
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", brandsOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </div>
            {/* The label opens the all-brands page; the chevron keeps direct brand shortcuts. */}
            <AnimatePresence>
              {brandsOpen && (
                <motion.div
                  id="brands-menu"
                  role="menu"
                  className="bg-card border-border absolute right-0 top-[calc(100%+1rem)] w-80 rounded-lg border p-2 shadow-xl"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  {subBrands.map((brand, index) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      role="menuitem"
                      onClick={() => setBrandsOpen(false)}
                      className="hover:bg-muted flex items-center gap-3 rounded-md px-3 py-3 transition-colors"
                    >
                      <span className="bg-accent/15 text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                        S{index + 1}
                      </span>
                      <span>
                        <span className="block font-medium text-foreground">{brand.name}</span>
                        <span className="text-muted-foreground block text-xs">{brand.specialty}</span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button href="/booking">Book Now</Button>
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="hover:bg-muted -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setOpenOnPath(menuOpen ? null : pathname)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </Container>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="border-border bg-background overflow-hidden border-t md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Container className="flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-3 text-base",
                    isActive(item.href)
                      ? "bg-muted text-accent font-medium"
                      : "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-border mt-2 border-t pt-3">
                <p className="text-muted-foreground px-3 pb-1 text-xs font-medium tracking-[0.18em] uppercase">
                  Our brands
                </p>
                {subBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    onClick={() => setOpenOnPath(null)}
                    className="hover:bg-muted block rounded-md px-3 py-2.5"
                  >
                    <span className="block text-sm font-medium">{brand.name}</span>
                    <span className="text-muted-foreground block text-xs">{brand.specialty}</span>
                  </Link>
                ))}
              </div>
              <Button href="/booking" className="mt-2">
                Book Now
              </Button>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
