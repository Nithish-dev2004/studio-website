"use client";

// Sticky top navigation. Desktop: inline links. Mobile: hamburger menu.
// Links come from data/site.ts. The current page's link is highlighted.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { navItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  // We remember WHICH page the menu was opened on. When the visitor navigates to another
  // page the paths no longer match, so the menu closes by itself (no extra effect needed).
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
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
