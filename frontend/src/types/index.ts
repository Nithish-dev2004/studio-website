// Shared TypeScript types. Keeping them in one place means the future mobile app
// (or any other client) can reuse the same shapes for API requests and responses.

import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialPlatform = "instagram" | "facebook" | "youtube";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export type Service = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  image: string;
};

export type PortfolioCategory = "Wedding" | "Portrait" | "Product" | "Events" | "Studio";

export type PortfolioItem = {
  id: string;
  title: string;
  category: PortfolioCategory;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Featured items are shown on the home page. */
  featured?: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
};

// ---- Forms and API ----

// `website` is the hidden "honeypot" field. Real visitors never see or fill it;
// spam bots often do. The server ignores any submission where it has text.

export type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string; // YYYY-MM-DD
  location: string; // optional (may be "")
  message: string; // optional (may be "")
  website: string; // honeypot
};

export type ContactFormData = {
  name: string;
  email: string;
  phone: string; // optional (may be "")
  message: string;
  website: string; // honeypot
};

export type EventConsultationFormData = {
  name: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate?: string; // YYYY-MM-DD or ""
  guestCount?: string;
  notes?: string;
  website?: string; // honeypot
};

/** One error message per field, e.g. { email: "Please enter a valid email." } */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Every API route answers with this shape. */
export type ApiResponse<T> =
  { ok: true; message: string } | { ok: false; message: string; errors?: FieldErrors<T> };
