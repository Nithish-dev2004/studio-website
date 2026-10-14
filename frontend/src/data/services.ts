// The services you offer. Used on the Home page, Services page and the Booking form.
// To add a service: copy one block, change the text, and give it a unique `slug`.

import { Briefcase, Camera, CalendarHeart, Heart, Sun } from "lucide-react";
import { placeholderImage } from "@/lib/utils";
import type { Service } from "@/types";

export const services: Service[] = [
  {
    slug: "wedding",
    title: "Wedding Photography",
    shortDescription: "Candid, timeless coverage of your big day.",
    description:
      "From the first look to the last dance, we capture the moments and emotions that make your wedding yours.",
    features: [
      "Full-day coverage",
      "Pre-wedding shoot",
      "Edited online gallery",
      "Printed album",
    ],
    icon: Heart,
    image: placeholderImage("service-wedding", 800, 600),
  },
  {
    slug: "portrait",
    title: "Portrait Sessions",
    shortDescription: "Natural portraits for individuals, couples and families.",
    description:
      "Relaxed, guided sessions in the studio or on location, so you look and feel like yourself.",
    features: [
      "60-90 minute session",
      "Outfit changes",
      "Retouched photos",
      "Studio or outdoor",
    ],
    icon: Camera,
    image: placeholderImage("service-portrait", 800, 600),
  },
  {
    slug: "product",
    title: "Product Photography",
    shortDescription: "Clean, sharp images that help your products sell.",
    description:
      "Catalogue, e-commerce and lifestyle shots with consistent lighting and careful retouching.",
    features: [
      "White-background shots",
      "Lifestyle styling",
      "Fast turnaround",
      "Web-ready files",
    ],
    icon: Briefcase,
    image: placeholderImage("service-product", 800, 600),
  },
  {
    slug: "events",
    title: "Event Coverage",
    shortDescription: "Birthdays, corporate events, launches and celebrations.",
    description:
      "Discreet, professional coverage so you can enjoy the event while we document it.",
    features: [
      "Hourly or full-day",
      "Quick preview photos",
      "Group photos",
      "Online gallery",
    ],
    icon: CalendarHeart,
    image: placeholderImage("service-events", 800, 600),
  },
  {
    slug: "studio-rental",
    title: "Studio Rental",
    shortDescription: "A bright, fully equipped studio you can book by the hour.",
    description:
      "Natural light, backdrops, strobes and props included. Perfect for photographers, brands and creators.",
    features: [
      "Hourly booking",
      "Lighting included",
      "Backdrops and props",
      "Changing room",
    ],
    icon: Sun,
    image: placeholderImage("service-studio", 800, 600),
  },
];
