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

// lucide-react has no brand logos, so each platform uses a simple stand-in icon.
// TODO: swap these for real brand icons later (e.g. the "react-icons" package).
const socialIcons: Record<SocialPlatform, LucideIcon> = {
  instagram: Camera,
  facebook: Globe,
  youtube: Video,
};

export default function Footer() {
  const pathname = usePathname();

  // Brand pages have their own dedicated editorial dark footer matching their UI
  if (pathname.startsWith("/brands/")) {
    return null;
  }

  return (
    <footer className="bg-muted border-border border-t">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl">{siteConfig.name}</p>
          <p className="text-muted-foreground mt-3 max-w-xs text-sm">
            {siteConfig.description}
          </p>
          <ul className="mt-5 flex gap-3">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.platform];
              return (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="border-border hover:text-accent hover:border-accent inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Footer">
          <p className="mb-4 text-sm font-medium tracking-widest uppercase">Explore</p>
          <ul className="space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/booking" className="text-muted-foreground hover:text-accent">
                Book a Session
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-4 text-sm font-medium tracking-widest uppercase">Contact</p>
          <address className="text-muted-foreground space-y-3 text-sm not-italic">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {siteConfig.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="hover:text-accent"
              >
                {siteConfig.phone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-accent">
                {siteConfig.email}
              </a>
            </p>
          </address>
        </div>
      </Container>

      <div className="border-border border-t py-5">
        <Container>
          <p className="text-muted-foreground text-center text-xs">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
