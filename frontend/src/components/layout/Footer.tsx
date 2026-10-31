"use client";

// Site footer: brand, quick links, contact details and social icons.
// Everything here comes from data/site.ts.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Globe, Mail, MapPin, Phone, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import { navItems, siteConfig, socialLinks } from "@/data/site";
import type { SocialPlatform } from "@/types";

const socialIcons: Record<SocialPlatform, LucideIcon> = {
  instagram: Camera,
  facebook: Globe,
  youtube: Video,
};

export default function Footer() {
  const pathname = usePathname();

  // Brand pages, admin pages, and staff account pages have their own layouts
  if (
    pathname.startsWith("/brands/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account")
  ) {
    return null;
  }

  return (
    <footer className="bg-muted border-border border-t pb-[max(1rem,env(safe-area-inset-bottom))] transition-colors">
      <Container className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:grid-cols-3 sm:py-12 lg:gap-10">
        <div className="space-y-3 sm:col-span-2 md:col-span-1">
          <p className="font-heading text-2xl text-foreground">{siteConfig.name}</p>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            {siteConfig.description}
          </p>
          <ul className="flex flex-wrap gap-2.5 pt-2">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.platform];
              return (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="border-border hover:text-accent hover:border-accent inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Footer Navigation">
          <p className="mb-3 text-xs font-semibold tracking-widest uppercase text-foreground">
            Explore
          </p>
          <ul className="space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                Book a Session
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-widest uppercase text-foreground">
            Contact
          </p>
          <address className="text-muted-foreground space-y-3 text-sm not-italic">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{siteConfig.address}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="hover:text-accent transition-colors"
              >
                {siteConfig.phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-accent transition-colors">
                {siteConfig.email}
              </a>
            </p>
          </address>
        </div>
      </Container>

      <div className="border-border border-t py-4">
        <Container>
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-2 text-center text-xs sm:flex-row">
            <span>
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-accent transition-colors py-1"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-accent transition-colors py-1"
              >
                Terms
              </Link>
              <Link
                href="/admin/login"
                prefetch={false}
                aria-label="Staff and admin login"
                className="text-muted-foreground hover:text-accent transition-colors py-1"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
