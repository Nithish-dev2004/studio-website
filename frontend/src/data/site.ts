// Brand name, contact info, navigation and social links.
// Edit this one file to rebrand the whole site (Navbar, Footer, SEO, WhatsApp button).

import type { NavItem, SocialLink } from "@/types";

export const siteConfig = {
  // TODO: replace with your real studio name.
  name: "Sivagangai Stories",
  tagline: "Photography & Studio",
  description:
    "Wedding, portrait, product and event photography, plus a bright studio you can rent.",

  // Used for SEO links. Set NEXT_PUBLIC_SITE_URL in .env.local once you have a domain.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // TODO: replace all of the contact details below with real ones.
  email: "hello@example.com",
  phone: "+91 99999 99999",
  address: "123 Studio Street, Sivagangai, Tamil Nadu, India",
  hours: "Mon - Sat, 10:00 AM - 7:00 PM",

  // WhatsApp number: country code + number, digits only (no +, spaces or dashes).
  whatsappNumber: "919999999999",
  whatsappMessage: "Hi! I'd like to know more about your photography services.",
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// TODO: replace the "#" links with your real profiles.
export const socialLinks: SocialLink[] = [
  { platform: "instagram", label: "Instagram", href: "https://instagram.com/" },
  { platform: "facebook", label: "Facebook", href: "https://facebook.com/" },
  { platform: "youtube", label: "YouTube", href: "https://youtube.com/" },
];
