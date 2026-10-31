"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Compass,
  Flame,
  Heart,
  Landmark,
  Send,
  User,
  X,
  Sparkles,
  Download,
  Calendar,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- Decorative ZigZag doodle matching the exact line in Image 2 and Image 3 ---
function ZigZagDoodle({ color = "#2d4d42" }: { color?: string }) {
  return (
    <svg
      width="44"
      height="12"
      viewBox="0 0 44 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      aria-hidden="true"
    >
      <path
        d="M2 10L7 2L12 10L17 2L22 10L27 2L32 10L37 2L42 10"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Data definition for the 6 services shown in Image 2 ---
interface ServiceItem {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  detailedText: string;
  deliverables: string[];
}

const servicesData: ServiceItem[] = [
  {
    id: "wedding",
    title: "Wedding Photography",
    icon: Heart,
    description:
      "Chettinad and traditional South Indian weddings are vibrant symphonies of sacred rituals, garland exchanges, and unspoken emotions. We capture every sacred ritual and candid laugh with timeless warmth.",
    detailedText:
      "Our wedding coverage approaches your sacred union with quiet reverence and cinematic artistry. From Muhurtham dawn rituals and Kanyadaan tears to the colorful reception revelry, we ensure no tender glance or joyous laughter goes unpreserved.",
    deliverables: [
      "Full-day multi-camera candid & traditional coverage",
      "Handcrafted master wedding album & digital gallery",
      "4K cinematic wedding highlight film & raw archive",
      "Pre-wedding shoot consultation & moodboard styling",
    ],
  },
  {
    id: "cultural",
    title: "Cultural & Festival Photography",
    icon: Flame,
    description:
      "Sivagangai's temple festivals, chariot processions, and festive rituals carry centuries of vibrant soul. We document heritage events with vivid color accuracy and cultural reverence.",
    detailedText:
      "Rooted deeply in Tamil heritage, we specialize in documenting religious ceremonies, temple Utsavams, ear-piercing rituals, and puberty celebrations. We understand the spiritual importance of every ritual.",
    deliverables: [
      "Discreet on-location documentary framing",
      "Low-light temple ritual color grading",
      "Expedited preview photos for family sharing within 24h",
      "Archival photo prints & commemorative frames",
    ],
  },
  {
    id: "portrait",
    title: "Portrait Photography",
    icon: User,
    description:
      "Natural light, soulful eyes, and authentic personality. Whether individual artistic portraits, generational family heirlooms, or maternity captures, we reveal who you truly are.",
    detailedText:
      "We believe the most compelling portraits emerge when you forget the camera exists. In our sunlit studio or outdoor rustic backdrops, we gently guide posture and lighting while keeping expressions entirely natural.",
    deliverables: [
      "Guided 90-minute studio or outdoor session",
      "Professional skin-tone & color retouching",
      "High-resolution digital downloads with full personal license",
      "Custom framed fine-art museum-grade canvas prints",
    ],
  },
  {
    id: "architecture",
    title: "Heritage & Architecture",
    icon: Landmark,
    description:
      "The palatial mansions of Chettinad, ornate carved teak doors, Athangudi tiled courtyards, and ancient shrines. We document heritage architecture with geometric precision and dramatic lighting.",
    detailedText:
      "Chettinad's architectural marvels demand an intimate understanding of symmetry, shadow, and historical detail. We work with heritage hotels, conservation architects, and homeowners to capture magnificent estates in their best light.",
    deliverables: [
      "Ultra-wide perspective-corrected interior & exterior capture",
      "Dusk golden-hour & ambient twilight illumination shots",
      "High-dynamic-range detail captures of woodwork and tilework",
      "Commercial licensing ready for publications & hospitality",
    ],
  },
  {
    id: "outdoor",
    title: "Pre-Wedding & Outdoor Shoots",
    icon: Compass,
    description:
      "Scenic rural landscapes, heritage village streets, and golden hour magic. We curate romantic, cinematic narratives where couples feel effortless, relaxed, and completely themselves.",
    detailedText:
      "Step away from stiff studio poses. We journey to secluded Chettinad palatial corridors, ancient lotus ponds, and sun-drenched banyan groves to weave a visual poem of your companionship.",
    deliverables: [
      "Custom location scouting tailored to your couple story",
      "Wardrobe styling and thematic guidance",
      "Teaser reel edited for social media announcement",
      "Digital guestbook ready photo album for reception entry",
    ],
  },
  {
    id: "films",
    title: "Commercial & Event Films",
    icon: Clapperboard,
    description:
      "High-definition 4K event teasers, artisanal brand documentaries, and corporate event films crafted with precision color grading, crystal-clear audio, and dynamic rhythm.",
    detailedText:
      "Visual storytelling that commands attention. Whether launching a regional lifestyle brand, profiling Chettinad artisans, or broadcasting an executive gala, our cine crew delivers broadcast quality cinema.",
    deliverables: [
      "Cinematic 4K 10-bit video capture with gimbal stabilization",
      "Studio-grade audio recording of vows, speeches, and ambient sound",
      "Bespoke film score licensing and color grading",
      "Vertical cut versions optimized for Instagram & YouTube Shorts",
    ],
  },
];

// --- Data definition for the Preset Store shown in Image 3 ---
interface PresetPack {
  id: string;
  volume: string;
  title: string;
  image: string;
  price: string;
  description: string;
  features: string[];
}

const presetPacks: PresetPack[] = [
  {
    id: "vol-01",
    volume: "Vol. 01",
    title: "Sivagangai Preset Pack Vol. 01",
    image: "/images/preset-pack-vol1.jpg",
    price: "₹1,499",
    description:
      "The first volume is our signature go-to preset pack when shooting weddings and golden-hour portraits. Just the right balance of rich warm skin tones and glowing brass highlights to make your photos pop!",
    features: ["8 Desktop XMP Presets", "8 Mobile DNG Presets", "Warm skin-tone protection", "Ideal for Indian silk sarees"],
  },
  {
    id: "vol-02",
    volume: "Vol. 02",
    title: "Heritage Preset Pack Vol. 02",
    image: "/images/preset-pack-vol2.jpg",
    price: "₹1,499",
    description:
      "Vol. 02 is dedicated solely to landscape, travel, and heritage architecture photography. Pay attention to your exposure while out there and these presets will elevate your foliage and terracotta tones.",
    features: ["10 Lightroom Presets", "Rich terracotta & earthy green curve", "Sky highlight recovery tool", "Installation video guide"],
  },
  {
    id: "vol-03",
    volume: "Vol. 03",
    title: "Candid Preset Pack Vol. 03",
    image: "/images/preset-pack-vol3.jpg",
    price: "₹1,299",
    description:
      "These are a curated collection of our most expressive black-and-white tonal recipes. Use with care — smooth micro-contrast, gentle film grain, and deep emotional shadow gradients that define raw character.",
    features: ["6 Timeless Monochrome Presets", "3 Grain intensity variations", "Dramatic street & portrait curve", "Compatible with RAW & JPEG"],
  },
];

export default function SivagangaiCaptureLanding() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetPack | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f5] dark:bg-[#0e0e0e] text-[#1c2225] dark:text-[#f3f1ed] selection:bg-[#2d4d42] selection:text-white font-sans overflow-x-hidden">
      {/* =========================================================================
          ATMOSPHERIC AMBIENT GLOW BLOBS (Exact visual tone of Image 1, 2, 3, 4)
          Soft warm peach on bottom left, forest green on top right, subtle coral
          ========================================================================= */}
      <div
        className="pointer-events-none fixed -top-24 -right-24 h-[550px] w-[550px] rounded-full bg-[#345e52]/15 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-[45%] -left-28 h-[580px] w-[580px] rounded-full bg-[#e09e78]/18 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-10 -right-20 h-[520px] w-[520px] rounded-full bg-[#eb8c82]/14 blur-[140px]"
        aria-hidden="true"
      />

      {/* =========================================================================
          SECTION 1: HERO / INTRODUCTION (Exact layout of Image 1)
          Left: Heading + Paragraph + Green "Read more" button
          Right: Rounded vertical card with professional photographer portrait
          ========================================================================= */}
      <section className="relative z-10 pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Contextual story and introduction */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 xl:col-span-6 lg:pr-4"
            >
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-medium leading-[1.12] tracking-tight text-[#234237]">
                Hi, We&apos;re Sivagangai Capture &amp; We tell stories through light.
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#4b5550]">
                Rooted in the timeless soul of Chettinad and Sivagangai, we craft heartfelt visual
                narratives. From sacred South Indian wedding rituals and candid smiles to evocative
                portraits and grand palatial architecture, every single frame is composed with
                reverence, gentle natural light, and quiet elegance.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-lg bg-[#2d4d42] px-7 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#223d34] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  Read more
                </a>
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center rounded-lg border border-[#2d4d42]/30 px-6 py-3 text-sm font-medium text-[#234237] transition-all duration-200 hover:bg-[#2d4d42]/5 hover:border-[#2d4d42]"
                >
                  Book a Session
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Rounded portrait card matching Image 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center lg:col-span-6 xl:col-span-6 lg:justify-end"
            >
              <div className="group relative w-full max-w-[430px] overflow-hidden rounded-[2.2rem] bg-white p-2 shadow-2xl shadow-black/10 ring-1 ring-black/[0.05]">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.8rem]">
                  <Image
                    src="/images/sivagangai-hero-photographer.jpg"
                    alt="Sivagangai Capture lead photographer with professional camera at studio staircase"
                    fill
                    priority
                    sizes="(min-width: 1024px) 430px, 90vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle lighting vignette */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SERVICES SECTION (Exact layout of Image 2)
          Top: Green ZigZag doodle + "Services" + Subtitle
          Grid: 6 Rounded cards with circular icon badge and "Read more →" link
          ========================================================================= */}
      <section id="services" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ZigZagDoodle color="#2d4d42" />
            <h2 className="font-heading mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight text-[#234237]">
              Services
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#505a54]">
              Every celebration is unique, and every emotion deserves its own authentic rhythm.
              From monumental wedding rituals to candid portraits and heritage architecture, our lens
              captures authentic grace and raw emotion across every occasion.
            </p>
          </motion.div>

          {/* 6-Card Grid (2 rows x 3 columns on desktop) */}
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesData.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                >
                  <div className="group flex h-full flex-col justify-between rounded-2xl border border-black/[0.04] bg-[#f5f3ef]/80 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/5">
                    <div>
                      {/* Circular icon badge matching Image 2 */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7eee9] text-[#2d4d42] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#2d4d42] group-hover:text-white">
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                      </div>

                      <h3 className="font-heading mt-6 text-xl sm:text-2xl font-medium tracking-tight text-[#234237]">
                        {service.title}
                      </h3>

                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#525c56]">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2d4d42] transition-all duration-200 group-hover:gap-2.5 hover:underline"
                      >
                        Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PRESET STORE (Exact layout of Image 3)
          Top: Red ZigZag doodle + "Preset Store" in coral red + Subtitle
          Grid: 3 Cards with isometric mockup photos on top, white card body below
          Bottom: Centered "Preset store →" link
          ========================================================================= */}
      <section id="preset-store" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ZigZagDoodle color="#df554a" />
            <h2 className="font-heading mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight text-[#df554a]">
              Preset Store
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#505a54]">
              Bring the signature Sivagangai Capture color science into your own visual storytelling.
              Handcrafted Lightroom desktop and mobile presets developed through years of shooting
              under rich South Indian sunlight and architectural wonder.
            </p>
          </motion.div>

          {/* 3-Card Grid */}
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {presetPacks.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10"
              >
                {/* Isometric Mockup Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f0eee9]">
                  <Image
                    src={pack.image}
                    alt={`${pack.title} packaging mockup`}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, 100vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#2d4d42] shadow-sm backdrop-blur">
                    {pack.volume}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-7">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-xl font-medium tracking-tight text-[#234237]">
                        {pack.title}
                      </h3>
                      <span className="font-semibold text-sm text-[#2d4d42]">{pack.price}</span>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#525c56]">
                      {pack.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/[0.05]">
                    <button
                      type="button"
                      onClick={() => setSelectedPreset(pack)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2d4d42]/10 py-2.5 text-xs font-semibold text-[#2d4d42] transition-colors hover:bg-[#2d4d42] hover:text-white"
                    >
                      View Pack Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Centered Preset store link */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setSelectedPreset(presetPacks[0])}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2d4d42] transition-all hover:gap-2.5 hover:underline"
            >
              Preset store <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FLOATING CONTACT BANNER (Top of Image 4)
          Soft rounded floating card:
          Left: "Want to work together? Follow the link and let's get in touch."
          Right: Dark green "Contact" button
          ========================================================================= */}
      <section className="relative z-10 pt-10 pb-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-black/[0.04] bg-[#f0eee9] p-8 sm:p-12 shadow-sm md:flex-row md:items-center"
          >
            <div className="max-w-xl">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-[2rem] font-medium leading-snug tracking-tight text-[#1c2225]">
                Want to work together?
                <span className="block font-sans text-base sm:text-lg font-normal text-[#505a54] mt-1.5">
                  Follow the link and let&apos;s get in touch.
                </span>
              </h2>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d4d42] px-8 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#223d34] hover:shadow-md hover:-translate-y-0.5"
            >
              Contact
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: THE DARK SIGNATURE FOOTER (Exact layout of Image 4)
          Top: Centered brand name "Sivagangai Capture" in huge serif
          Columns: PAGES | PRESET PACKS | BUSINESS AREAS | UTILITY PAGES | NEWSLETTER
          ========================================================================= */}
      <footer className="relative z-10 bg-[#1c2225] pt-20 pb-12 text-[#f3f1ed]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Centered Brand Title matching "Mirro" */}
          <div className="text-center">
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-white">
              Sivagangai Capture
            </h2>
            <p className="mt-3 text-xs tracking-[0.25em] uppercase text-[#a1aba5]">
              Photography &amp; Cinematic Heritage Studio
            </p>
          </div>

          {/* 5-Column Navigation Grid matching Image 4 */}
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-14 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">
            {/* Column 1: PAGES */}
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
                Pages
              </p>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/70">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#preset-store" className="transition-colors hover:text-white">
                    Store
                  </a>
                </li>
                <li>
                  <Link href="/about" className="transition-colors hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="transition-colors hover:text-white">
                    Portfolio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: PRESET PACKS */}
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
                Preset Packs
              </p>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/70">
                {presetPacks.map((pack) => (
                  <li key={pack.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPreset(pack)}
                      className="text-left transition-colors hover:text-white"
                    >
                      {pack.title}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedPreset(presetPacks[0])}
                    className="text-left transition-colors hover:text-white"
                  >
                    Golden Hour LUTs
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: BUSINESS AREAS */}
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
                Business Areas
              </p>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/70">
                <li>
                  <a href="#services" className="transition-colors hover:text-white">
                    Wedding Photography
                  </a>
                </li>
                <li>
                  <a href="#services" className="transition-colors hover:text-white">
                    Chettinad Heritage
                  </a>
                </li>
                <li>
                  <a href="#services" className="transition-colors hover:text-white">
                    Portrait &amp; Heirlooms
                  </a>
                </li>
                <li>
                  <a href="#services" className="transition-colors hover:text-white">
                    Pre-Wedding Films
                  </a>
                </li>
                <li>
                  <a href="#services" className="transition-colors hover:text-white">
                    Artisanal Commercials
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: UTILITY PAGES */}
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
                Utility Pages
              </p>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/70">
                <li>
                  <Link href="/booking" className="transition-colors hover:text-white">
                    Booking Inquiry
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="transition-colors hover:text-white">
                    Pricing &amp; Guides
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="transition-colors hover:text-white">
                    Brand Ecosystem
                  </Link>
                </li>
                <li>
                  <span className="text-white/40 cursor-default">Licenses &amp; Rights</span>
                </li>
                <li>
                  <span className="text-white/40 cursor-default">Changelog</span>
                </li>
              </ul>
            </div>

            {/* Column 5: NEWSLETTER matching Image 4 */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
                Newsletter
              </p>
              <p className="mt-4 text-xs text-white/70 leading-relaxed">
                Subscribe to our newsletter where we share news about upcoming shoots, exhibitions,
                and exclusive preset drops.
              </p>

              {newsletterSubmitted ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Thank you! You are now subscribed to our private newsletter.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="mt-4">
                  <div className="flex items-center rounded-xl bg-white p-1 shadow-inner">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      aria-label="Newsletter email address"
                      className="w-full bg-transparent px-3 py-1.5 text-xs text-[#1c2225] placeholder-[#8b958f] outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2b3337] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1f2528]"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Copyright and Sivagangai Group note */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} Sivagangai Capture · Part of the Sivagangai Media
              Group. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#main" className="transition-colors hover:text-white">
                Back to top ↑
              </a>
              <Link href="/contact" className="transition-colors hover:text-white">
                Support &amp; Inquiries
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE MODAL: SERVICE DETAILS ("Read more →")
          ========================================================================= */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-[#1c2225] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="service-modal-title"
            >
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label="Close service modal"
                className="absolute top-5 right-5 rounded-full p-1.5 text-black/50 hover:bg-black/5 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7eee9] text-[#2d4d42]">
                  <selectedService.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-[#2d4d42] uppercase">
                    Service Overview
                  </span>
                  <h3 id="service-modal-title" className="font-heading text-2xl font-medium text-[#234237]">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#505a54]">
                {selectedService.detailedText}
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-wider text-[#234237] uppercase">
                  What&apos;s Included:
                </p>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[#505a54]">
                  {selectedService.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2d4d42] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-black/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-[#505a54] hover:bg-black/5"
                >
                  Close
                </button>
                <Link
                  href="/booking"
                  onClick={() => setSelectedService(null)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2d4d42] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#223d34]"
                >
                  <Calendar className="h-3.5 w-3.5" /> Book This Service
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE MODAL: PRESET PACK DETAILS
          ========================================================================= */}
      <AnimatePresence>
        {selectedPreset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPreset(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-[#1c2225] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="preset-modal-title"
            >
              <button
                type="button"
                onClick={() => setSelectedPreset(null)}
                aria-label="Close preset modal"
                className="absolute top-5 right-5 rounded-full p-1.5 text-black/50 hover:bg-black/5 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#f0eee9] mb-5">
                <Image
                  src={selectedPreset.image}
                  alt={selectedPreset.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2d4d42] shadow-sm">
                  {selectedPreset.volume}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-[#df554a] uppercase">
                    Lightroom Preset Collection
                  </span>
                  <h3 id="preset-modal-title" className="font-heading text-2xl font-medium text-[#234237]">
                    {selectedPreset.title}
                  </h3>
                </div>
                <span className="font-semibold text-lg text-[#2d4d42]">{selectedPreset.price}</span>
              </div>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#505a54]">
                {selectedPreset.description}
              </p>

              <div className="mt-5 rounded-xl bg-[#faf8f5] p-4 border border-black/[0.05]">
                <p className="text-xs font-semibold tracking-wider text-[#234237] uppercase mb-2">
                  What You Receive:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#505a54]">
                  {selectedPreset.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#2d4d42] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-black/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedPreset(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-[#505a54] hover:bg-black/5"
                >
                  Close
                </button>
                <Link
                  href="/contact?subject=preset-inquiry"
                  onClick={() => setSelectedPreset(null)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2d4d42] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#223d34]"
                >
                  <Download className="h-3.5 w-3.5" /> Purchase &amp; Instant Download
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
