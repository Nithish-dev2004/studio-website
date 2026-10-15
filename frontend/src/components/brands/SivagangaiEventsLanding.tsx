"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  Layout,
  Palette,
  Users,
  Clock,
  Send,
  X,
  MapPin,
  Utensils,
  Smartphone,
  ShieldCheck,
  Music,
  HeartHandshake,
} from "lucide-react";
import BrandDarkFooter from "@/components/layout/BrandDarkFooter";

// --- Theme Showcase Data (Images 2 & 3) ---
interface EventTheme {
  id: string;
  category: "weddings" | "corporate" | "traditional" | "sangeet";
  categoryLabel: string;
  title: string;
  subtitle: string;
  palette: string[];
  image: string;
  highlights: string[];
}

const eventThemes: EventTheme[] = [
  {
    id: "royal-chettinad",
    category: "traditional",
    categoryLabel: "Traditional & Cultural",
    title: "Chettinad Heritage Mandap",
    subtitle: "Carved teakwood pillars, cascading marigolds, and sacred temple courtyard ambiance.",
    palette: ["#d97706", "#b45309", "#f59e0b", "#78350f"],
    image: "/images/sivagangai-event-traditional-mandap.jpg",
    highlights: ["Antique brass oil lamps", "Fresh jasmine ceiling canopy", "Athangudi tile floor styling"],
  },
  {
    id: "twilight-sangeet",
    category: "sangeet",
    categoryLabel: "Intimate & Sangeet",
    title: "Celestial Twilight Sangeet",
    subtitle: "Thousands of warm fairy lights, bohemian velvet cabanas, and live acoustic music stage.",
    palette: ["#7c3aed", "#4f46e5", "#f59e0b", "#1e1b4b"],
    image: "/images/sivagangai-event-sangeet-decor.jpg",
    highlights: ["Overhead fairy light mesh", "Custom cocktail bar & lounge", "Dynamic stage lighting truss"],
  },
  {
    id: "imperial-reception",
    category: "weddings",
    categoryLabel: "Royal Weddings",
    title: "Grand Imperial Reception",
    subtitle: "Curved white rose floral arches, crystal chandeliers, and opulent gold ambient tones.",
    palette: ["#00ab80", "#10b981", "#e5e7eb", "#111827"],
    image: "/images/sivagangai-event-stage-hero.jpg",
    highlights: ["Imported Dutch orchids", "Mirrored guest dining tables", "Custom couple throne dais"],
  },
  {
    id: "lakeside-vedic",
    category: "traditional",
    categoryLabel: "Traditional & Cultural",
    title: "Lakeside Vedic Muhurtham",
    subtitle: "Open-air reflection mandap with floating lotus urns and sacred Vedic dawn chanting.",
    palette: ["#ea580c", "#c2410c", "#fde047", "#431407"],
    image: "/images/sivagangai-event-traditional-mandap.jpg",
    highlights: ["Waterbody lotus floating urns", "Traditional Nadaswaram booth", "Eco-friendly natural banana fibers"],
  },
  {
    id: "corporate-conclave",
    category: "corporate",
    categoryLabel: "Corporate Galas",
    title: "Tech-Forward Executive Conclave",
    subtitle: "Curved 4K LED backdrops, crystal-clear audio routing, and seamless VIP delegate dining.",
    palette: ["#0284c7", "#0369a1", "#0ea5e9", "#0f172a"],
    image: "/images/sivagangai-event-stage-hero.jpg",
    highlights: ["4K panoramic LED screen", "Wireless delegate mic arrays", "High-profile keynote staging"],
  },
  {
    id: "sunshine-haldi",
    category: "sangeet",
    categoryLabel: "Intimate & Sangeet",
    title: "Artisanal Sunshine Haldi",
    subtitle: "Vibrant yellow marigold garlands, earthen urli bath setups, and handcrafted umbrellas.",
    palette: ["#eab308", "#ca8a04", "#fef08a", "#713f12"],
    image: "/images/sivagangai-event-sangeet-decor.jpg",
    highlights: ["Marigold petal showers", "Hand-painted folk photo corners", "Live dholak & percussion"],
  },
];

// --- 2-Column Feature Showcase Data (Image 4) ---
interface ProductionFeature {
  id: string;
  icon: typeof Layout;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  checklist: string[];
}

const productionFeatures: ProductionFeature[] = [
  {
    id: "decor",
    icon: Layout,
    title: "Customizable event decor & stages",
    subtitle:
      "Tailored for your milestone. From traditional royal Chettinad setups to contemporary minimal luxury, every detail reflects your family's personal story.",
    image: "/images/sivagangai-event-stage-hero.jpg",
    badge: "Bespoke Production",
    checklist: [
      "Custom 3D CAD stage renders & lighting previews",
      "Fresh floral procurement directly from Bengaluru & Madurai flower markets",
      "Artisanal wooden mandap pillars & authentic brass heirloom props",
      "Color-calibrated mood lighting that flatters photography and videography",
    ],
  },
  {
    id: "itinerary",
    icon: Clock,
    title: "Full-day vendor & itinerary management",
    subtitle:
      "Minute-by-minute timeline coordination. We synchronize caterers, artists, sound engineers, photographers, and guest hospitality so you never feel rushed.",
    image: "/images/sivagangai-event-traditional-mandap.jpg",
    badge: "Flawless Execution",
    checklist: [
      "Dedicated Chief Event Officer assigned as your single point of contact",
      "Real-time WhatsApp coordination room for family and key vendors",
      "Strict schedule adherence for Muhurtham, Aarti, and dining services",
      "Contingency protocol for unexpected weather or power backup",
    ],
  },
  {
    id: "entertainment",
    icon: Sparkles,
    title: "Artisanal production & entertainment",
    subtitle:
      "Curated live artists, traditional nadaswaram maestros, celebratory fireworks, dynamic LED backdrops, and bespoke personalized guest favors.",
    image: "/images/sivagangai-event-sangeet-decor.jpg",
    badge: "Immersive Experiences",
    checklist: [
      "Vetted carnatic vocalists, fusion live bands, and celebrity DJs",
      "Cold-pyro indoor fireworks and synchronized sparkle cascades",
      "Customized guest gifting hampers with Chettinad palm-leaf crafts",
      "Interactive photo-booths with instant physical prints for guests",
    ],
  },
];

// --- More Features Grid Data (Image 5) ---
interface MoreFeature {
  id: string;
  icon: typeof MapPin;
  title: string;
  description: string;
  image: string;
  tag: string;
}

const moreFeatures: MoreFeature[] = [
  {
    id: "venue",
    icon: MapPin,
    title: "Venue Curation & Negotiation",
    description:
      "From historic Chettinad heritage palaces to open-air lakefront resorts, we secure the perfect setting with exclusive privileges and preferred pricing.",
    image: "/images/sivagangai-event-stage-hero.jpg",
    tag: "Exclusive Estates",
  },
  {
    id: "hospitality",
    icon: Users,
    title: "Hospitality & VIP Logistics",
    description:
      "Airport meet-and-greets, luxury fleet transfers, custom welcome hampers, room allocations, and 24/7 dedicated guest concierge desks.",
    image: "/images/sivagangai-event-sangeet-decor.jpg",
    tag: "White Glove Care",
  },
  {
    id: "digital",
    icon: Smartphone,
    title: "Digital Invites & Live RSVP",
    description:
      "Custom interactive wedding portals, automated WhatsApp RSVP tracking, digital event itineraries, and private cloud photo sharing for guests.",
    image: "/images/sivagangai-event-traditional-mandap.jpg",
    tag: "Smart Celebrations",
  },
  {
    id: "catering",
    icon: Utensils,
    title: "Curated Chettinad & Global Feasts",
    description:
      "Authentic 30-item traditional banana-leaf feasts, live artisanal food counters, bespoke mocktail bars, and curated dessert lounges.",
    image: "/images/sivagangai-event-traditional-mandap.jpg",
    tag: "Culinary Excellence",
  },
];

export default function SivagangaiEventsLanding() {
  // State for Theme Categories (Image 2)
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // State for 2-column feature selector (Image 4)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);

  // State for consultation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formDetails, setFormDetails] = useState({
    name: "",
    phone: "",
    eventType: "Royal Wedding",
    eventDate: "",
    guestCount: "300 - 500 Guests",
    notes: "",
  });

  // Filtered themes
  const filteredThemes =
    activeCategory === "all"
      ? eventThemes
      : eventThemes.filter((theme) => theme.category === activeCategory);

  const totalFiltered = filteredThemes.length;
  const currentTheme = filteredThemes[carouselIndex % totalFiltered] || filteredThemes[0];

  const handleNextTheme = () => {
    setCarouselIndex((prev) => (prev + 1) % totalFiltered);
  };

  const handlePrevTheme = () => {
    setCarouselIndex((prev) => (prev - 1 + totalFiltered) % totalFiltered);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // State for newsletter subscription in dark footer
  const [footerEmail, setFooterEmail] = useState("");
  const [footerSubmitted, setFooterSubmitted] = useState(false);

  const handleFooterNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail || !footerEmail.includes("@")) return;
    setFooterSubmitted(true);
    setFooterEmail("");
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#00ab80] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* =========================================================================
          SECTION 1: HERO SECTION (Exact layout of Image 1)
          - Centered top badge with teal icon
          - Clean bold heading: "The dream event management for unforgettable celebrations"
          - Subheading paragraph
          - Pill CTA button: "Get Started" / "Plan Your Event" in vibrant teal (#00ab80)
          - Floating browser mockup with luxury event moodboard & overlapping mobile card
          ========================================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36 bg-gradient-to-b from-[#f8faf9] via-white to-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 text-center">
          {/* Top Pill Badge matching Image 1 */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-4 py-1.5 shadow-sm text-xs font-medium text-gray-800"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00ab80]">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </span>
            <span>Sivagangai Events &bull; Luxury Event Management</span>
          </motion.div>

          {/* Headline matching Image 1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto mt-6 max-w-4xl text-4xl sm:text-5xl lg:text-[3.8rem] font-bold tracking-tight text-gray-950 leading-[1.12]"
          >
            The dream event management for unforgettable celebrations
          </motion.h1>

          {/* Subtitle matching Image 1 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed"
          >
            Sivagangai Events makes it joyful and effortless to plan royal Chettinad weddings, grand
            corporate galas, and cultural milestones that stand out forever.
          </motion.p>

          {/* Primary CTA button matching Image 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[#00ab80] px-9 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md shadow-[#00ab80]/25 transition-all duration-200 hover:bg-[#00966f] hover:shadow-lg hover:shadow-[#00ab80]/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Plan Your Celebration
            </button>
          </motion.div>

          {/* Hero Showcase Mockup matching Image 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-14 sm:mt-18"
          >
            {/* Desktop Browser Window Mockup */}
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl shadow-gray-200/70">
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-[#fafafa] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="hidden sm:flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs text-gray-500 border border-gray-200/60 shadow-inner">
                  <span>sivagangaievents.com/showcase/royal-chettinad</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                  <span className="hidden md:inline">Weddings</span>
                  <span className="hidden md:inline">Corporate</span>
                  <span className="text-[#00ab80]">Inquire Now</span>
                </div>
              </div>

              {/* Inside Showcase Content */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-900">
                <Image
                  src="/images/sivagangai-event-stage-hero.jpg"
                  alt="Sivagangai Events luxury grand reception stage design"
                  fill
                  priority
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover object-center"
                />
                {/* Visual Overlay Card */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-left">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#00ab80]">
                    Signature Production
                  </span>
                  <h2 className="font-heading mt-2 max-w-xl text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
                    Lasting memories through breathtaking, soulful celebrations.
                  </h2>
                  <p className="mt-2 hidden sm:block max-w-lg text-xs sm:text-sm text-gray-300">
                    Grand floral arches, handpicked crystal chandeliers, and seamless guest hospitality.
                  </p>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Mobile Card on bottom right (matching Image 1) */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-8 -right-2 sm:-bottom-10 sm:right-6 w-64 sm:w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl text-left hidden sm:block"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-900">Live Event Operations</span>
                </div>
                <span className="text-[10px] text-gray-400">Today</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Mandap Florals</span>
                  <span className="font-medium text-emerald-600">Completed &bull; 05:45 AM</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span>Nadaswaram Ensemble</span>
                  <span className="font-medium text-emerald-600">Active Stage</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span>Traditional Feast</span>
                  <span className="font-medium text-gray-500">Scheduled 11:30 AM</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 & 3: INDUSTRY-LEADING DESIGNS / THEMES CAROUSEL (Images 2 & 3)
          - Teal tag: "INDUSTRY-LEADING DESIGNS"
          - Headline: "Templates as stunning as your photos" -> "Themes as stunning as your celebrations"
          - Subtitle paragraph
          - Link: "See website templates ->" -> "See all event themes ->"
          - Filter Pill Tabs: Business websites, Portfolios, One-pagers ->
            Royal Weddings, Corporate Galas, Traditional & Cultural, Intimate & Sangeet
          - Interactive Cards Grid / Carousel with pagination counter (e.g. 6 / 12)
          ========================================================================= */}
      <section id="themes" className="relative py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          {/* Section Header matching Image 2 */}
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-[#00ab80] uppercase">
              Curated Event Experiences
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Themes as stunning as your celebrations
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
              Our bespoke, easy-to-customize event themes are crafted by seasoned producers to put your
              cherished moments and guests in full focus at every moment.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00ab80] hover:text-[#00966f] transition-all hover:gap-2.5"
              >
                See all event themes <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Pills matching Image 2 */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {[
                { id: "all", label: "All Experiences" },
                { id: "weddings", label: "Royal Weddings" },
                { id: "traditional", label: "Traditional & Cultural" },
                { id: "sangeet", label: "Intimate & Sangeet" },
                { id: "corporate", label: "Corporate Galas" },
              ].map((pill) => {
                const isActive = activeCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(pill.id);
                      setCarouselIndex(0);
                    }}
                    className={`rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#00ab80] text-white shadow-sm"
                        : "bg-[#f3f4f6] text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Themes Cards Carousel matching Image 3 */}
          <div className="mt-14">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredThemes.slice(0, 3).map((theme, idx) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300"
                >
                  {/* Card Visual with simulated moodboard look */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={theme.image}
                      alt={theme.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur">
                      {theme.categoryLabel}
                    </div>
                  </div>

                  {/* Card Body with color palette dots and details */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-xl font-bold text-gray-950">
                          {theme.title}
                        </h3>
                        {/* Palette Dots */}
                        <div className="flex items-center gap-1">
                          {theme.palette.map((color, cIdx) => (
                            <span
                              key={cIdx}
                              style={{ backgroundColor: color }}
                              className="h-3 w-3 rounded-full border border-white shadow-xs"
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {theme.subtitle}
                      </p>

                      <ul className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
                        {theme.highlights.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00ab80]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-[#00ab80] hover:text-white"
                      >
                        Inquire For This Theme
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Slider Navigation Bar matching Image 3 bottom (Left/Right arrows + counter + track) */}
            <div className="mt-12 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handlePrevTheme}
                aria-label="Previous event theme"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {/* Counter Display (e.g., 6 / 12) */}
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                <span className="font-semibold text-gray-900">{carouselIndex + 1}</span>
                <span>/</span>
                <span>{totalFiltered > 0 ? totalFiltered : 6}</span>

                {/* Progress bar line */}
                <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#00ab80] transition-all duration-300"
                    style={{
                      width: `${((carouselIndex + 1) / Math.max(totalFiltered, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextTheme}
                aria-label="Next event theme"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 2-COLUMN FEATURE LAYOUT (Exact layout of Image 4)
          - Teal tag: "LAYOUT TEMPLATES" -> "END-TO-END PRODUCTION"
          - Headline: "Ready, set, launch with elegant layouts." -> "Ready, set, celebrate with elegant planning."
          - Subtitle paragraph
          - Left column: 3 interactive selectable items with icons
          - Right column: Dynamic layered visual mockup that switches with item selection
          ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-[#fafaf9] border-t border-b border-gray-200/60">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-[#00ab80] uppercase">
              End-To-End Production
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-950">
              Ready, set, celebrate with elegant planning.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
              Launch your dream celebration faster than ever with our dedicated coordinators, trusted
              vendor network, and bespoke decor production. Zero stress, 100% celebration.
            </p>
          </div>

          {/* 2-Column Split Layout matching Image 4 */}
          <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: 3 Selectable Interactive Items */}
            <div className="lg:col-span-5 space-y-4">
              {productionFeatures.map((feature, index) => {
                const Icon = feature.icon;
                const isSelected = activeFeatureIndex === index;
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => setActiveFeatureIndex(index)}
                    className={`w-full text-left rounded-2xl p-6 transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? "border-[#00ab80]/60 bg-white shadow-md shadow-gray-200/50"
                        : "border-transparent bg-transparent hover:bg-white/60 text-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-[#00ab80]/10 text-[#00ab80]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3
                          className={`text-base sm:text-lg font-bold tracking-tight ${
                            isSelected ? "text-gray-950" : "text-gray-700"
                          }`}
                        >
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                          {feature.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Layered Visual Frame matching Image 4 */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-2xl shadow-gray-200/80"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gray-900">
                    <Image
                      src={productionFeatures[activeFeatureIndex].image}
                      alt={productionFeatures[activeFeatureIndex].title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3.5 py-1 text-xs font-semibold text-gray-900 backdrop-blur shadow-sm">
                      {productionFeatures[activeFeatureIndex].badge}
                    </div>
                  </div>

                  {/* Checklist Bar */}
                  <div className="mt-6 px-2">
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Included In This Phase:
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      {productionFeatures[activeFeatureIndex].checklist.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00ab80] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "MORE FEATURES" HORIZONTAL GRID (Exact layout of Image 5)
          - Teal tag: "MORE FEATURES"
          - Headline: "Discover Pixieset Website features" -> "Discover Sivagangai Events capabilities"
          - Horizontal row of 4 cards:
            1. Blogging -> Venue Curation
            2. Built-in SEO -> Hospitality & VIP Logistics
            3. Bio links -> Digital Invites & RSVP Tracking
            4. AI-powered alt text -> Curated Chettinad & Global Feasts
          ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          {/* Header row matching Image 5 */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-12 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#00ab80] uppercase">
                More Capabilities
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
                Discover Sivagangai Events capabilities
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Comprehensive Management</span>
            </div>
          </div>

          {/* 4-Card Horizontal Grid matching Image 5 */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {moreFeatures.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Card on top */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50 shadow-xs transition-all duration-300 group-hover:shadow-md">
                      <Image
                        src={feat.image}
                        alt={feat.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold text-gray-800 shadow-xs">
                        {feat.tag}
                      </div>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-950 group-hover:text-[#00ab80] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CALL-TO-ACTION BANNER & INQUIRY MODAL
          ========================================================================= */}
      <section className="relative py-20 bg-gradient-to-b from-white to-[#f0f9f6]">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 text-center">
          <div className="rounded-3xl border border-[#00ab80]/20 bg-white p-8 sm:p-14 shadow-xl shadow-gray-200/60">
            <span className="text-xs font-bold tracking-[0.2em] text-[#00ab80] uppercase">
              Begin Your Journey
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
              Turn your celebration into an unforgettable royal milestone.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-gray-600">
              Schedule a free 30-minute creative consultation with our Chief Event Director to explore
              themes, venue options, and personalized budget breakdowns.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-full bg-[#00ab80] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#00ab80]/20 hover:bg-[#00966f] hover:shadow-lg transition-all cursor-pointer"
              >
                Schedule Free Consultation
              </button>
              <Link
                href="/contact"
                className="rounded-full border border-gray-300 px-7 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SIGNATURE DARK FOOTER (Matching exact image provided by user)
          ========================================================================= */}
      <BrandDarkFooter
        brandName="Sivagangai Events"
        tagline="EVENT MANAGEMENT & LUXURY CELEBRATION STUDIO"
      />


      {/* =========================================================================
          INTERACTIVE CONSULTATION MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-[#111827] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="consultation-modal-title"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="absolute top-5 right-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>

              {submitted ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-gray-900">Consultation Scheduled!</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Thank you, {formDetails.name || "friend"}! Our Chief Event Director will call you
                    within 24 hours to discuss your event vision.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setIsModalOpen(false);
                    }}
                    className="mt-6 rounded-full bg-[#00ab80] px-6 py-2.5 text-xs font-semibold text-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ab80]/15 text-[#00ab80]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-[#00ab80] uppercase">
                        Sivagangai Events
                      </span>
                      <h3 id="consultation-modal-title" className="text-xl font-bold text-gray-950">
                        Book Event Consultation
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 text-left text-xs">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={formDetails.name}
                        onChange={(e) => setFormDetails({ ...formDetails, name: e.target.value })}
                        placeholder="e.g. Ananya & Karthik"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#00ab80]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formDetails.phone}
                          onChange={(e) => setFormDetails({ ...formDetails, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#00ab80]"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Event Type</label>
                        <select
                          value={formDetails.eventType}
                          onChange={(e) => setFormDetails({ ...formDetails, eventType: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#00ab80] bg-white"
                        >
                          <option>Royal Wedding</option>
                          <option>Sangeet & Mehendi</option>
                          <option>Traditional Reception</option>
                          <option>Corporate Gala</option>
                          <option>Birthday Milestone</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Target Date</label>
                        <input
                          type="date"
                          value={formDetails.eventDate}
                          onChange={(e) => setFormDetails({ ...formDetails, eventDate: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#00ab80]"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Estimated Guests</label>
                        <select
                          value={formDetails.guestCount}
                          onChange={(e) => setFormDetails({ ...formDetails, guestCount: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#00ab80] bg-white"
                        >
                          <option>Under 200 Guests</option>
                          <option>200 - 500 Guests</option>
                          <option>500 - 1000 Guests</option>
                          <option>1000+ Grand Gathering</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Notes / Preferences</label>
                      <textarea
                        rows={2}
                        value={formDetails.notes}
                        onChange={(e) => setFormDetails({ ...formDetails, notes: e.target.value })}
                        placeholder="Tell us about your preferred venue, theme ideas, or budget..."
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#00ab80]"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#00ab80] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#00966f]"
                    >
                      <Send className="h-3.5 w-3.5" /> Submit Request
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
