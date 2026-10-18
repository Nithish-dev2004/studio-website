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
  { label: "Feedback", href: "/feedback" },
];

// The businesses within the Sivagangai group. These power the Brands menu and
// the dedicated Brands page, so their names and descriptions stay consistent.
export const subBrands = [
  {
    id: "captures",
    slug: "captures",
    name: "SIVAGANGAI.captures",
    specialty: "Photography & videography",
    description: "Photography and videography for the moments that matter.",
    headline: "Moments, framed forever",
    accent: "#f5ae18",
    action: "Book a shoot",
    secondaryAction: "Watch showreel",
    services: ["Wedding", "Portrait", "Films"],
  },
  {
    id: "eventz",
    slug: "eventz",
    name: "Sivagangai Eventz",
    specialty: "Event management",
    description: "Thoughtful planning and management for memorable events.",
    headline: "Your big day, perfectly run",
    accent: "#e64343",
    action: "Plan my event",
    secondaryAction: "See past events",
    services: ["Weddings", "Corporate", "Birthdays", "Launches"],
  },
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    name: "Sivagangai Digital Marketing",
    specialty: "Digital marketing",
    description: "Digital marketing that helps businesses connect and grow.",
    headline: "Grow where your customers look",
    accent: "#3182e6",
    action: "Free audit",
    secondaryAction: "View case studies",
    services: ["Social media", "Paid ads", "SEO", "Websites"],
  },
  {
    id: "sign-board",
    slug: "sign-board",
    name: "Sivagangai Sign Board",
    specialty: "Sign boards & displays",
    description: "Clear, distinctive sign boards and visual displays for your business.",
    headline: "Be seen from the street",
    accent: "#16b51e",
    action: "Get a quote",
    secondaryAction: "See our work",
    services: ["LED boards", "Acrylic letters", "Flex banners", "Name plates"],
  },
] as const;

// TODO: replace the "#" links with your real profiles.
export const socialLinks: SocialLink[] = [
  { platform: "instagram", label: "Instagram", href: "https://instagram.com/" },
  { platform: "facebook", label: "Facebook", href: "https://facebook.com/" },
  { platform: "youtube", label: "YouTube", href: "https://youtube.com/" },
];
