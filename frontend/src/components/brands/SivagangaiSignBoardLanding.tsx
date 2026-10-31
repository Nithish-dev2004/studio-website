"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Zap,
  Layers,
  Phone,
  MessageCircle,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  Ruler,
  Wrench,
  X,
  Send,
  Building2,
  Store,
  ChevronRight,
  Sliders,
  Loader2,
  AlertCircle,
} from "lucide-react";
import BrandDarkFooter from "@/components/layout/BrandDarkFooter";
import { postJson } from "@/lib/api";
import { validateSignboardBooking } from "@/lib/validation";
import type { SignboardBookingFormData, FieldErrors } from "@/types";

// =========================================================================
// SIVAGANGAI SIGN BOARD - SAMPLE ASSETS & DATA CONFIG
// (You can easily replace the image URLs below with your own photos)
// =========================================================================

export const SIGNBOARD_ASSETS = {
  // Main dual-card images (Section 1)
  storefrontCommercial: "/images/signboard-led-storefront.jpg",
  corporateInterior: "/images/signboard-corporate-interior.jpg",
  neonArtisan: "/images/signboard-neon-cafe.jpg",

  // Additional showcase mockups
  heritageVilla: "/images/sivagangai-hero-photographer.jpg",
  medicalClinic: "/images/signboard-corporate-interior.jpg",
  jewelleryGrand: "/images/signboard-led-storefront.jpg",
};

interface ShowcaseItem {
  id: string;
  title: string;
  theme: string;
  image: string;
  location: string;
  category: "exterior" | "interior" | "neon";
  specs: string;
}

const initialShowcaseItems: ShowcaseItem[] = [
  {
    id: "aurelia-boutique",
    title: "Aurélia Luxury Fashion Boutique",
    theme: "Theme: 3D Acrylic Front-Lit LED + Dark Matte ACP Cladding",
    image: SIGNBOARD_ASSETS.storefrontCommercial,
    location: "Sivagangai Bazaar",
    category: "exterior",
    specs: "3mm Matte Black ACP • Samsung 1.2W LED • Gold Trim Acrylic Letters",
  },
  {
    id: "aventus-corporate",
    title: "Aventus Global Corporate HQ",
    theme: "Theme: Solid Brushed Brass Halo Backlit on Fluted Wood",
    image: SIGNBOARD_ASSETS.corporateInterior,
    location: "Madurai IT Highway",
    category: "interior",
    specs: "Grade 304 Solid Brass • 3000K Warm White Halo • 20mm Spacer Standoffs",
  },
  {
    id: "daily-grind-cafe",
    title: "The Daily Grind Artisan Bistro",
    theme: "Theme: Custom Warm Glow Neon Flex + Backlit Acrylic Typography",
    image: SIGNBOARD_ASSETS.neonArtisan,
    location: "Karaikudi Main Road",
    category: "neon",
    specs: "Silicone Neon Flex 12V • Waterproof IP67 • MeanWell Power Converter",
  },
];

const extendedShowcaseItems: ShowcaseItem[] = [
  {
    id: "chettinad-heritage",
    title: "Chettinad Heritage Grand Villa",
    theme: "Theme: Vintage Teak Wood Mount & Antique Cast Brass Nameplate",
    image: SIGNBOARD_ASSETS.corporateInterior,
    location: "Kanadukathan",
    category: "interior",
    specs: "Laser Etched Brass • Clear Weather Coat • Burma Teak Plaque",
  },
  {
    id: "apollo-care",
    title: "Apex Multi-Specialty Hospital",
    theme: "Theme: 24/7 High-Lumen Emergency Illuminated Glow Box Pylon",
    image: SIGNBOARD_ASSETS.storefrontCommercial,
    location: "Sivagangai District Center",
    category: "exterior",
    specs:
      "Dual-Sided Backlit Polycarbonate • Heavy GI Frame • Lightning Surge Protection",
  },
  {
    id: "velavan-silks",
    title: "Velavan Silks & Jewellery Showroom",
    theme: "Theme: 4-Foot Massive 3D Golden Mirror Acrylic Letters",
    image: SIGNBOARD_ASSETS.neonArtisan,
    location: "Madurai Meenakshi Gate",
    category: "exterior",
    specs: "Golden Mirror Cast Acrylic • Daylight White 6500K • 30ft Curved Canopy",
  },
];

export default function SivagangaiSignBoardLanding() {
  const [showExtended, setShowExtended] = useState(false);
  const [nightModeGlow, setNightModeGlow] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // Quote form state
  const initialFormData: SignboardBookingFormData = {
    businessName: "",
    phone: "",
    signType: "3D LED Acrylic Letters",
    dimensions: "10 ft x 3 ft",
    city: "Sivagangai",
    notes: "",
    website: "", // honeypot
  };

  const [formData, setFormData] = useState<SignboardBookingFormData>(initialFormData);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignboardBookingFormData>>(
    {},
  );

  const maskDisplayPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 7) {
      return digits.slice(0, 2) + "•••••" + digits.slice(-3);
    }
    return raw;
  };

  const handleCloseModal = () => {
    setIsQuoteOpen(false);
    if (formSubmitted) {
      setFormSubmitted(false);
      setFormData(initialFormData);
      setSubmitError("");
      setFieldErrors({});
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setFieldErrors({});

    const validation = validateSignboardBooking(formData);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setSubmitError("Please fill in the required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await postJson<SignboardBookingFormData>(
        "/api/signboard-booking",
        validation.data,
      );

      if (response.ok) {
        setFormSubmitted(true);
        setSubmitError("");
        setFieldErrors({});
      } else {
        if (response.errors) {
          setFieldErrors(response.errors);
        }
        setSubmitError(response.message || "Failed to submit request. Please try again.");
      }
    } catch {
      setSubmitError(
        "Unable to submit request. Please check your internet connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentShowcase = showExtended
    ? [...initialShowcaseItems, ...extendedShowcaseItems]
    : initialShowcaseItems;

  return (
    <div
      className={`min-h-screen bg-white dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 antialiased transition-colors duration-500 selection:bg-[#0062ff] selection:text-white ${
        nightModeGlow ? "bg-[#0b0f17] text-slate-100" : "bg-white"
      }`}
    >
      {/* -------------------------------------------------------------
          STICKY TOP NAVIGATION / BREADCRUMB BAR
          ------------------------------------------------------------- */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          nightModeGlow
            ? "border-slate-800 bg-[#0b0f17]/90 text-white"
            : "border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f17]/95 text-slate-900 dark:text-slate-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              <span>←</span>
              <span>All Brands</span>
            </Link>
            <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#0062ff]" />
              <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
                Sivagangai Sign Board
              </span>
              <span className="hidden rounded-full bg-[#0062ff]/10 px-2 py-0.5 text-[10px] font-medium text-[#0062ff] sm:inline-block">
                Division of Sivagangai Group
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Day / Night Glow Simulator Toggle */}
            <button
              onClick={() => setNightModeGlow(!nightModeGlow)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                nightModeGlow
                  ? "border border-amber-400/40 bg-amber-400/20 text-amber-300 shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title="Toggle Night Illuminated Signboard Glow"
            >
              {nightModeGlow ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Day View</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Night Glow Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsQuoteOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#0062ff] px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#0052d9]"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Get a Quote</span>
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          IMAGE 1 LAYOUT: "What do you want to create?"
          Dual Comparison Cards (Collection of work vs Welcome page format)
          ------------------------------------------------------------- */}
      <section
        id="create"
        className={`pt-20 pb-24 transition-colors sm:pt-28 sm:pb-32 ${
          nightModeGlow ? "bg-[#0e141f]" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Centered Heading & Subtitle exactly matching Image 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1
              className={`text-3xl font-light tracking-tight sm:text-4xl md:text-5xl ${
                nightModeGlow ? "text-white" : "text-slate-900"
              }`}
            >
              What do you want to create?
            </h1>
            <p
              className={`mt-4 text-sm leading-relaxed sm:text-base md:text-lg ${
                nightModeGlow ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Whether you want to showcase your business with an illuminated, high-impact
              commercial storefront, or create sleek interior architectural wayfinding
              signage, we’ve got you covered.
            </p>
          </motion.div>

          {/* Two Comparison Cards side-by-side matching Image 1 */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
            {/* Card 1: Exterior / Commercial (Collection of work layout) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
                nightModeGlow
                  ? "border border-slate-800 bg-[#141b29] shadow-2xl shadow-blue-950/30"
                  : "border border-slate-200/80 bg-[#f4f6f8] shadow-sm hover:shadow-xl"
              }`}
            >
              {/* Top Visual Area (Multi-element visual showcase) */}
              <div
                className={`relative flex h-72 w-full items-center justify-center overflow-hidden p-6 sm:h-80 sm:p-8 md:h-96 ${
                  nightModeGlow ? "bg-[#111723]" : "bg-[#eaedf2]"
                }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src={SIGNBOARD_ASSETS.storefrontCommercial}
                    alt="Sivagangai Sign Board - Exterior Storefront & Facades"
                    fill
                    className={`object-cover ${
                      nightModeGlow ? "brightness-110 contrast-125" : ""
                    }`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  {/* Subtle Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    <Store className="h-3 w-3 text-[#0062ff]" />
                    <span>Commercial Storefronts</span>
                  </div>
                  {nightModeGlow && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-transparent" />
                  )}
                </div>
              </div>

              {/* Bottom Text Area matching Image 1 */}
              <div className="flex flex-1 flex-col justify-between p-8 text-center sm:p-10">
                <div>
                  <h2
                    className={`text-xl font-semibold tracking-tight sm:text-2xl ${
                      nightModeGlow ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Collection of Commercial Work
                  </h2>
                  <p
                    className={`mt-4 text-xs leading-relaxed sm:text-sm ${
                      nightModeGlow ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Create a commanding, fully weatherproof outdoor presence for your
                    commercial outlet. Your project includes high-lumen 3D acrylic LED
                    channel letters, architectural ACP sheet facades, and roadside
                    monolith pylons. From there, you can customize dimensions and lighting
                    as desired.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    3D LED Letters
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    ACP Cladding
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Pylon Signs
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Glow Sign Boxes
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Interior / Corporate (Welcome page layout) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
                nightModeGlow
                  ? "border border-slate-800 bg-[#141b29] shadow-2xl shadow-blue-950/30"
                  : "border border-slate-200/80 bg-[#f4f6f8] shadow-sm hover:shadow-xl"
              }`}
            >
              {/* Top Visual Area (Clean single wide image preview) */}
              <div
                className={`relative flex h-72 w-full items-center justify-center overflow-hidden p-6 sm:h-80 sm:p-8 md:h-96 ${
                  nightModeGlow ? "bg-[#111723]" : "bg-[#eaedf2]"
                }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src={SIGNBOARD_ASSETS.corporateInterior}
                    alt="Sivagangai Sign Board - Interior Reception & Wayfinding"
                    fill
                    className={`object-cover ${
                      nightModeGlow ? "brightness-110 contrast-125" : ""
                    }`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Subtle Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    <Building2 className="h-3 w-3 text-[#0062ff]" />
                    <span>Interior & Reception Displays</span>
                  </div>
                  {nightModeGlow && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent" />
                  )}
                </div>
              </div>

              {/* Bottom Text Area matching Image 1 */}
              <div className="flex flex-1 flex-col justify-between p-8 text-center sm:p-10">
                <div>
                  <h2
                    className={`text-xl font-semibold tracking-tight sm:text-2xl ${
                      nightModeGlow ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Interior & Office Wayfinding
                  </h2>
                  <p
                    className={`mt-4 text-xs leading-relaxed sm:text-sm ${
                      nightModeGlow ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Create a pristine, understated luxury statement for corporate
                    reception lobbies, executive suites, and clinics. Ideal for solid
                    brushed brass logos, frosted acrylic panels, and directional floor
                    directories. You can always add additional department nameplates and
                    room indicators if desired.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Solid Brass Letters
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Reception Logos
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Floor Wayfinding
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Laser Engraved Plates
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 2 LAYOUT: "See what's possible"
          Headline + Subtitle + [Get Started →] [View More Examples]
          Followed by 3-column project showcase grid
          ------------------------------------------------------------- */}
      <section
        id="examples"
        className={`border-t py-24 transition-colors sm:py-32 ${
          nightModeGlow ? "border-slate-800 bg-[#0b0f17]" : "border-slate-100 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Centered Heading, Subtitle & Action Buttons matching Image 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2
              className={`text-3xl font-light tracking-tight sm:text-4xl md:text-5xl ${
                nightModeGlow ? "text-white" : "text-slate-900"
              }`}
            >
              See what’s possible
            </h2>
            <p
              className={`mt-4 text-sm leading-relaxed sm:text-base md:text-lg ${
                nightModeGlow ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Retail outlets, hospitals, corporate towers, and boutique cafes across
              Sivagangai & Tamil Nadu trust us to illuminate their brand. See some
              examples below.
            </p>

            {/* Centered Buttons matching the exact style of Image 2 */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsQuoteOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0062ff] px-8 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#0052d9] hover:shadow-lg"
              >
                <span>Get Started</span>
                <span className="font-sans">→</span>
              </button>

              <button
                onClick={() => setShowExtended(!showExtended)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                  nightModeGlow
                    ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <span>{showExtended ? "Show Less" : "View More Examples"}</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-300 ${
                    showExtended ? "-rotate-90" : "rotate-90"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* 3-Column Showcase Grid matching Image 2 */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {currentShowcase.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setIsQuoteOpen(true)}
                >
                  {/* Image Card Container */}
                  <div
                    className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl border transition-all duration-300 ${
                      nightModeGlow
                        ? "border-slate-800 bg-slate-900 shadow-xl shadow-blue-950/20 group-hover:border-[#0062ff]"
                        : "border-slate-200 bg-slate-100 shadow-sm group-hover:border-slate-300 group-hover:shadow-xl"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                        nightModeGlow ? "brightness-110 contrast-125" : ""
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Location Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                      <MapPin className="h-2.5 w-2.5 text-[#0062ff]" />
                      <span>{item.location}</span>
                    </div>

                    {/* Night mode realistic illumination glow filter */}
                    {nightModeGlow && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-500/25 via-transparent to-transparent" />
                    )}
                  </div>

                  {/* Clean Typography below Image matching Image 2 */}
                  <div className="mt-4 text-left">
                    <h3
                      className={`text-base font-semibold tracking-tight transition-colors group-hover:text-[#0062ff] sm:text-lg ${
                        nightModeGlow ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`mt-1 text-xs font-normal sm:text-sm ${
                        nightModeGlow ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {item.theme}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {item.specs}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 3 LAYOUT: "Showcase your work in minutes"
          Headline + Subtitle + 6-Grid Feature Matrix with Blue Line Icons
          ------------------------------------------------------------- */}
      <section
        id="features"
        className={`border-t py-24 transition-colors sm:py-32 ${
          nightModeGlow ? "border-slate-800 bg-[#0e141f]" : "border-slate-100 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Centered Heading & Subtitle matching Image 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2
              className={`text-3xl font-light tracking-tight sm:text-4xl md:text-5xl ${
                nightModeGlow ? "text-white" : "text-slate-900"
              }`}
            >
              Engineered for decades of brilliance
            </h2>
            <p
              className={`mt-4 text-sm leading-relaxed sm:text-base md:text-lg ${
                nightModeGlow ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Don’t know sheet gauges or lumens? No problem. With Sivagangai Sign Board,
              our precision-manufactured systems are the most reliable, striking way to
              present your brand to the street.
            </p>
          </motion.div>

          {/* 6-Grid Feature Matrix matching Image 3 layout */}
          <div className="mt-16 grid grid-cols-1 divide-y md:grid-cols-2 md:gap-x-8 md:gap-y-12 md:divide-y-0 lg:grid-cols-3">
            {/* Feature 1: CNC Laser (Behance sync style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center p-6 text-center sm:p-8"
            >
              {/* Blue Outline Illustration Icon matching Adobe Portfolio */}
              <div className="flex h-24 w-28 items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="flex h-16 w-16 flex-col justify-between rounded-xl border-2 border-[#0062ff]/40 bg-blue-50/50 p-1.5 dark:bg-blue-950/20">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0062ff]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0062ff]/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5">
                      <div className="h-4 rounded bg-[#0062ff]/20" />
                      <div className="h-4 rounded bg-[#0062ff]/30" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0062ff] text-[11px] font-bold text-white shadow-md">
                    CNC
                  </div>
                </div>
              </div>

              <h3
                className={`mt-6 text-base font-semibold tracking-tight sm:text-lg ${
                  nightModeGlow ? "text-white" : "text-slate-900"
                }`}
              >
                CNC Laser &amp; Router Precision
              </h3>
              <p
                className={`mt-2.5 max-w-xs text-xs leading-relaxed sm:text-sm ${
                  nightModeGlow ? "text-slate-400" : "text-slate-600"
                }`}
              >
                High-precision 0.1mm micro-tolerance laser cutting across cast acrylic,
                solid brass, copper, and composite panels for razor-sharp typography and
                intricate logos.
              </p>
            </motion.div>

            {/* Feature 2: IP67 Weatherproof (Responsive screens style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center p-6 text-center sm:p-8"
            >
              <div className="flex h-24 w-28 items-center justify-center">
                <div className="relative flex items-end justify-center gap-1.5">
                  {/* Monitor frame */}
                  <div className="flex h-16 w-20 flex-col rounded-lg border-2 border-[#0062ff]/50 bg-blue-50/30 p-1 dark:bg-blue-950/20">
                    <div className="mb-1 h-2 w-full rounded-sm bg-[#0062ff]/20" />
                    <div className="grid flex-1 grid-cols-2 gap-1">
                      <div className="rounded bg-[#0062ff]/10" />
                      <div className="rounded bg-[#0062ff]/15" />
                    </div>
                  </div>
                  {/* Small device frame */}
                  <div className="flex h-10 w-6 flex-col justify-between rounded border-2 border-[#0062ff] bg-white p-0.5 shadow-sm dark:bg-slate-900">
                    <div className="mx-auto h-1 w-2 rounded-full bg-[#0062ff]" />
                    <div className="h-4 rounded bg-[#0062ff]/20" />
                    <div className="mx-auto h-1 w-1 rounded-full bg-[#0062ff]" />
                  </div>
                </div>
              </div>

              <h3
                className={`mt-6 text-base font-semibold tracking-tight sm:text-lg ${
                  nightModeGlow ? "text-white" : "text-slate-900"
                }`}
              >
                IP67 Weatherproof &amp; Sealed
              </h3>
              <p
                className={`mt-2.5 max-w-xs text-xs leading-relaxed sm:text-sm ${
                  nightModeGlow ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Dual-layer silicone perimeter seals, concealed moisture drain channels,
                and UV-stabilized clear coats engineered to endure scorching Tamil Nadu
                heat and monsoons.
              </p>
            </motion.div>

            {/* Feature 3: High-Lumen Korean LEDs (Domain name style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center p-6 text-center sm:p-8"
            >
              <div className="flex h-24 w-28 items-center justify-center">
                <div className="relative flex flex-col items-center justify-center">
                  <div className="flex h-14 w-22 items-center justify-center rounded-lg border-2 border-[#0062ff]/40 bg-blue-50/40 p-2 dark:bg-blue-950/20">
                    <div className="flex items-center gap-1 text-xs font-semibold tracking-wider text-[#0062ff]">
                      <CheckCircle2 className="h-4 w-4 fill-[#0062ff] text-white" />
                      <span>LED.</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3
                className={`mt-6 text-base font-semibold tracking-tight sm:text-lg ${
                  nightModeGlow ? "text-white" : "text-slate-900"
                }`}
              >
                High-Lumen Korean LED Modules
              </h3>
              <p
                className={`mt-2.5 max-w-xs text-xs leading-relaxed sm:text-sm ${
                  nightModeGlow ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Equipped with certified Samsung/LG tier-1 LED chips providing 50,000+
                hours of continuous, flicker-free lumens with uniform light diffusion and
                zero dark patches.
              </p>
            </motion.div>

            {/* Feature 4: Architectural ACP & Cast Acrylic (Typekit font style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center p-6 text-center sm:p-8"
            >
              <div className="flex h-24 w-28 items-center justify-center">
                <div className="flex flex-col items-start justify-center text-left font-serif leading-none">
                  <span className="text-xl font-bold text-[#0062ff]">AaBb</span>
                  <span className="text-base font-medium text-[#0062ff]/60">AaBb</span>
                  <span className="text-xs font-normal text-[#0062ff]/40">AaBb</span>
                </div>
              </div>

              <h3
                className={`mt-6 text-base font-semibold tracking-tight sm:text-lg ${
                  nightModeGlow ? "text-white" : "text-slate-900"
                }`}
              >
                Architectural Grade Materials
              </h3>
              <p
                className={`mt-2.5 max-w-xs text-xs leading-relaxed sm:text-sm ${
                  nightModeGlow ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Heavy-duty 3mm/4mm virgin exterior ACP sheets, 100% cast virgin acrylic
                that never yellows or cracks, and rust-proof SS 304 alloy for enduring
                aesthetic superiority.
              </p>
            </motion.div>

            {/* Feature 5: MeanWell SMPS Power Systems (Lightroom cloud style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center p-6 text-center sm:p-8"
            >
              <div className="flex h-24 w-28 items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="flex h-16 w-20 items-center justify-center rounded-xl border-2 border-[#0062ff]/40 bg-blue-50/40 p-2 dark:bg-blue-950/20">
                    <Zap className="h-8 w-8 text-[#0062ff]/70" />
                  </div>
                  <div className="absolute -right-1 -bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0062ff] text-[10px] font-bold text-white shadow-md">
                    SMPS
                  </div>
                </div>
              </div>

              <h3
                className={`mt-6 text-base font-semibold tracking-tight sm:text-lg ${
                  nightModeGlow ? "text-white" : "text-slate-900"
                }`}
              >
                MeanWell SMPS Power Systems
              </h3>
              <p
                className={`mt-2.5 max-w-xs text-xs leading-relaxed sm:text-sm ${
                  nightModeGlow ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Industrial-grade short-circuit and electrical surge-protected power
                converters housed inside ventilated, weather-resistant boxes for
                uninterrupted 24/7 reliability.
              </p>
            </motion.div>

            {/* Feature 6: Certified On-Site Installation (Password / Lock style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col items-center p-6 text-center sm:p-8"
            >
              <div className="flex h-24 w-28 items-center justify-center">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-1 rounded-lg bg-[#0062ff] px-4 py-2 font-mono text-xs font-bold tracking-widest text-white shadow-md">
                    <span>****</span>
                    <span className="h-3 w-0.5 animate-pulse bg-white" />
                  </div>
                </div>
              </div>

              <h3
                className={`mt-6 text-base font-semibold tracking-tight sm:text-lg ${
                  nightModeGlow ? "text-white" : "text-slate-900"
                }`}
              >
                3-Year Comprehensive Warranty
              </h3>
              <p
                className={`mt-2.5 max-w-xs text-xs leading-relaxed sm:text-sm ${
                  nightModeGlow ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Total peace of mind with prompt on-site replacement coverage on LED
                modules, power adapters, and mounting structural frames across Sivagangai
                &amp; Madurai districts.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 4 LAYOUT: "And it's all free with Creative Cloud" style CTA
          Centered Headline + Subtitle + [Get Started →]
          ------------------------------------------------------------- */}
      <section
        id="cta"
        className={`border-t py-24 transition-colors sm:py-32 ${
          nightModeGlow ? "border-slate-800 bg-[#0b0f17]" : "border-slate-100 bg-white"
        }`}
      >
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className={`text-3xl font-light tracking-tight sm:text-4xl md:text-5xl ${
                nightModeGlow ? "text-white" : "text-slate-900"
              }`}
            >
              Ready to elevate your storefront visibility?
            </h2>
            <p
              className={`mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base md:text-lg ${
                nightModeGlow ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Every project begins with a free on-site physical measurement, 3D daylight
              and night-glow preview render, and transparent itemized quotation delivered
              within 24 hours.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsQuoteOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0062ff] px-9 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#0052d9] hover:shadow-xl"
              >
                <span>Get Started</span>
                <span className="font-sans">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          SIGNATURE DARK BRAND FOOTER
          5-column grid + pill newsletter + brand links
          ------------------------------------------------------------- */}
      <BrandDarkFooter
        brandName="Sivagangai Sign Board"
        tagline="SIGN BOARDS, 3D LED ACRYLIC & ARCHITECTURAL DISPLAYS STUDIO"
      />

      {/* -------------------------------------------------------------
          INTERACTIVE GET A QUOTE / MEASUREMENT MODAL
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {isQuoteOpen && (
          <div className="fixed inset-0 z-50 flex [scrollbar-width:none] items-center justify-center overflow-y-auto p-4 sm:p-6 [&::-webkit-scrollbar]:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-xl [scrollbar-width:none] overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8 [&::-webkit-scrollbar]:hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {formSubmitted ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading mt-4 text-2xl font-semibold">
                    Measurement Request Received!
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Thank you,{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formData.businessName}
                    </span>
                    . Our signage engineer will call{" "}
                    <span className="font-semibold text-[#0062ff]">
                      {maskDisplayPhone(formData.phone)}
                    </span>{" "}
                    within 2 hours to confirm your free on-site measurement and 3D mockup
                    render.
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="mt-6 inline-flex rounded-full bg-[#0062ff] px-6 py-2.5 text-xs font-medium text-white shadow-md hover:bg-[#0052d9]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0062ff]/10 px-3 py-1 text-xs font-medium text-[#0062ff]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Free Site Measurement &amp; 3D Render</span>
                    </div>
                    <h3 className="font-heading mt-3 text-3xl font-medium text-slate-900 sm:text-4xl">
                      Request Signboard Estimate
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-5 text-slate-500">
                      Fill out your requirement below for a transparent cost estimate and
                      lighting spec.
                    </p>
                  </div>

                  {submitError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="mt-7 space-y-4 text-left">
                    {/* Honeypot anti-spam field */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      value={formData.website || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Business / Store Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        placeholder="e.g. Saffron Grand Hotel"
                        className={`mt-1.5 w-full rounded-xl border ${
                          fieldErrors.businessName
                            ? "border-red-400 bg-red-50/20"
                            : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                        } px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#0062ff]`}
                      />
                      {fieldErrors.businessName && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">
                          {fieldErrors.businessName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+91 98765 43210"
                          className={`mt-1.5 w-full rounded-xl border ${
                            fieldErrors.phone
                              ? "border-red-400 bg-red-50/20"
                              : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                          } px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#0062ff]`}
                        />
                        {fieldErrors.phone && (
                          <p className="mt-1 text-[11px] font-medium text-red-600">
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Location / City
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#0062ff]"
                        >
                          <option>Sivagangai</option>
                          <option>Karaikudi</option>
                          <option>Madurai</option>
                          <option>Manamadurai</option>
                          <option>Devakottai</option>
                          <option>Other Tamil Nadu</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Signboard Type
                        </label>
                        <select
                          value={formData.signType}
                          onChange={(e) =>
                            setFormData({ ...formData, signType: e.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#0062ff]"
                        >
                          <option>3D LED Acrylic Letters</option>
                          <option>Exterior ACP Facade Cladding</option>
                          <option>Backlit Stainless Steel Halo</option>
                          <option>Custom Neon Flex Display</option>
                          <option>Solid Brass / Metal Nameplate</option>
                          <option>Monolith Roadside Pylon</option>
                          <option>Other / Multiple Signs</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Approx. Size (W x H)
                        </label>
                        <input
                          type="text"
                          value={formData.dimensions}
                          onChange={(e) =>
                            setFormData({ ...formData, dimensions: e.target.value })
                          }
                          placeholder="e.g. 12 ft x 4 ft"
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#0062ff]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Specific Details{" "}
                        <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="e.g. Need warm white illumination on dark grey ACP facade, 2nd floor height."
                        className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#0062ff]"
                      />
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                      <div className="flex flex-col gap-2 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#0062ff]" /> Free on-site
                          measurement
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#0062ff]" /> 3D mockup
                          render
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#0062ff]" /> Transparent
                          cost estimate
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0062ff] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#0052d9] disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Submitting Request...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Submit Free Measurement Request</span>
                          </>
                        )}
                      </button>
                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        🔒 No obligation. Customer phone numbers encrypted with
                        AES-256-GCM.
                      </p>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
