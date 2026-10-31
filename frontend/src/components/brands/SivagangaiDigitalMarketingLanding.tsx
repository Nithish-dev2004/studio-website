"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3,
  Target,
  Video,
  Search,
  Send,
  X,
  Globe,
  MapPin,
  TrendingUp,
  Headphones,
  FileText,
  Music,
  Radio,
  Sliders,
  Award,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import BrandDarkFooter from "@/components/layout/BrandDarkFooter";
import { postJson } from "@/lib/api";
import { validateDigitalBooking } from "@/lib/validation";
import type { DigitalBookingFormData, FieldErrors } from "@/types";

// =========================================================================
// SIVAGANGAI DIGITAL MARKETING - ASSETS & DATA CONFIG
// (You can easily replace the image URLs below with your own photos)
// =========================================================================

export const DIGITAL_MARKETING_ASSETS = {
  heroBanner: "/images/digital-marketing-hero.jpg",
  directorPortrait: "/images/digital-marketing-director.jpg",
  clientAvatar1: "/images/sivagangai-hero-photographer.jpg",
  clientAvatar2: "/images/preset-pack-vol1.jpg",
};

// --- Service Card Data (Image 2) ---
interface ServiceCard {
  id: string;
  title: string;
  description: string;
  iconType: "voice" | "script" | "music";
  tag: string;
}

const serviceCards: ServiceCard[] = [
  {
    id: "meta-google-ads",
    title: "Meta & Google Paid Ads",
    description:
      "We design laser-targeted paid acquisition campaigns across Instagram, Facebook, and Google Search that maximize ROAS and deliver qualified local & global customer inquiries.",
    iconType: "voice",
    tag: "High ROAS Acquisition",
  },
  {
    id: "script-reels",
    title: "Viral Scripting & Reel Production",
    description:
      "From hook-focused scriptwriting to cinematic short-form video editing, our creative lab produces commercial reels and voiceover ads that stop the scroll and build brand recall.",
    iconType: "script",
    tag: "Creative Video Lab",
  },
  {
    id: "seo-funnels",
    title: "SEO & Conversion Web Funnels",
    description:
      "Dominating regional Tamil Nadu Google rankings and Google Maps 3-Pack for high-intent buyer searches, paired with blazing-fast landing page funnels that convert visitors into revenue.",
    iconType: "music",
    tag: "Organic Search & Funnels",
  },
];

// --- Interactive Audio / Ad Campaign Samples Data (Image 2) ---
interface AudioSample {
  id: string;
  title: string;
  duration: string;
  seconds: number;
  category: string;
}

const initialAudioSamples: AudioSample[] = [
  {
    id: "sample-1",
    title: "Commercial Voiceover - Luxury Jewellery Festival Ad",
    duration: "2:54",
    seconds: 174,
    category: "Retail Ad",
  },
  {
    id: "sample-2",
    title: "Meta Reel Voiceover - Chettinad Grand Hotel Promo",
    duration: "1:48",
    seconds: 108,
    category: "Hospitality",
  },
  {
    id: "sample-3",
    title: "YouTube Preroll Audio - Multi-Specialty Clinic Awareness",
    duration: "2:15",
    seconds: 135,
    category: "Healthcare",
  },
  {
    id: "sample-4",
    title: "Radio & Podcast Commercial - Luxury Villa Launch",
    duration: "2:30",
    seconds: 150,
    category: "Real Estate",
  },
  {
    id: "sample-5",
    title: "Instagram Story Ad - Artisan Cafe & Bistro Weekend",
    duration: "1:15",
    seconds: 75,
    category: "Food & Beverage",
  },
  {
    id: "sample-6",
    title: "Corporate B2B Narration - Cloud ERP Software Explainer",
    duration: "3:10",
    seconds: 190,
    category: "Corporate B2B",
  },
];

const extendedAudioSamples: AudioSample[] = [
  {
    id: "sample-7",
    title: "IVR On-Hold Branding - Premium Hospital Customer Care",
    duration: "1:55",
    seconds: 115,
    category: "Brand IVR",
  },
  {
    id: "sample-8",
    title: "Cinema Screen Advertising Voiceover - Silk Saree House",
    duration: "2:40",
    seconds: 160,
    category: "Cinema Commercial",
  },
  {
    id: "sample-9",
    title: "Product Launch Explainer - Automobile Dealership Festival",
    duration: "2:05",
    seconds: 125,
    category: "Automotive",
  },
];

// --- Pricing Tier Packages (Image 3) ---
interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonLabel: string;
  buttonVariant: "outline" | "solid-white" | "solid-purple";
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: "₹14,999",
    yearlyPrice: "₹11,999",
    description:
      "For emerging businesses seeking consistent organic reach and active social channels.",
    features: [
      "Competitive Local Pricing",
      "Customizable Solutions",
      "High-Quality Ad Creatives",
      "Revisions and Script Edits",
      "Fast 48-Hour Turnaround",
    ],
    buttonLabel: "Choose Plan",
    buttonVariant: "outline",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    monthlyPrice: "₹29,999",
    yearlyPrice: "₹23,999",
    description:
      "For growing brands looking to scale qualified customer inquiries with Meta & Google ads.",
    features: [
      "Competitive Local Pricing",
      "Customizable Solutions",
      "High-Quality Ad Creatives",
      "4 Cinematic Reels Per Month",
      "Fast 24-Hour Turnaround",
    ],
    buttonLabel: "Choose Plan",
    buttonVariant: "outline",
  },
  {
    id: "advanced",
    name: "Advanced",
    monthlyPrice: "₹59,999",
    yearlyPrice: "₹47,999",
    description:
      "Full-funnel domination: Multi-platform paid ads, 8 reels, Google SEO & dedicated manager.",
    features: [
      "Competitive Local Pricing",
      "Customizable Solutions",
      "High-Quality Ad Creatives",
      "Revisions and Script Edits",
      "Fast Turnaround Time",
    ],
    isPopular: true,
    buttonLabel: "Choose Plan",
    buttonVariant: "solid-white",
  },
  {
    id: "custom",
    name: "Custom",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    description:
      "For enterprise brands, multi-location hospital chains, and retail franchises.",
    features: [
      "Competitive Local Pricing",
      "Customizable Solutions",
      "High-Quality Audio & Video",
      "Unlimited Revisions & Edits",
      "Fast Priority Turnaround",
    ],
    buttonLabel: "Contact Sales",
    buttonVariant: "solid-purple",
  },
];

// --- Client Testimonials Data (Image 3) ---
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "Jenny Wilson",
    role: "Marketing Director",
    company: "Saffron Grand Hotel",
    avatar: DIGITAL_MARKETING_ASSETS.clientAvatar1,
    rating: 5,
    quote:
      "Fantastic digital marketing and ad creative service I have ever worked with. Our lead acquisition costs dropped by 45% in the first month and our banquet bookings skyrocketed.",
  },
  {
    id: "test-2",
    name: "Esther Howard",
    role: "Founder & CEO",
    company: "Velavan Silks & Jewellery",
    avatar: DIGITAL_MARKETING_ASSETS.clientAvatar2,
    rating: 5,
    quote:
      "The video reels and voiceover ads they produced for our festival campaign went completely viral across Madurai and Sivagangai. They provide truly exceptional services.",
  },
  {
    id: "test-3",
    name: "Robert Fox",
    role: "Managing Director",
    company: "Chettinad Heritage Estates",
    avatar: DIGITAL_MARKETING_ASSETS.clientAvatar1,
    rating: 5,
    quote:
      "Their Google Search campaign and localized SEO strategy positioned our real estate projects right at the top. The ROI has exceeded all of our quarterly projections.",
  },
];

// --- Regional Dotted Map Client Pins (Image 3) ---
const regionalPins = [
  {
    city: "Sivagangai",
    x: "42%",
    y: "60%",
    clients: "48+ Brands",
    label: "HQ & Production Lab",
  },
  { city: "Madurai", x: "32%", y: "55%", clients: "65+ Brands", label: "Commercial Hub" },
  {
    city: "Karaikudi",
    x: "55%",
    y: "48%",
    clients: "34+ Brands",
    label: "Heritage & Retail",
  },
  {
    city: "Chennai",
    x: "72%",
    y: "22%",
    clients: "28+ Brands",
    label: "Corporate Expansion",
  },
  {
    city: "Coimbatore",
    x: "20%",
    y: "42%",
    clients: "19+ Brands",
    label: "Manufacturing & B2B",
  },
];

export default function SivagangaiDigitalMarketingLanding() {
  // Billing cycle toggle
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Show more audio samples
  const [showMoreAudio, setShowMoreAudio] = useState(false);

  // Active audio player simulator
  const [activeTrack, setActiveTrack] = useState<string | null>("sample-2");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playProgress, setPlayProgress] = useState<{ [key: string]: number }>({
    "sample-1": 13,
    "sample-2": 38,
    "sample-3": 4,
    "sample-4": 13,
    "sample-5": 22,
    "sample-6": 8,
  });

  // Testimonials carousel index
  const [testiIndex, setTestiIndex] = useState(0);

  // Interactive consultation / audit modal
  const initialFormData: DigitalBookingFormData = {
    businessName: "",
    phone: "",
    email: "",
    websiteUrl: "",
    serviceInterested: "Meta & Google Paid Ads",
    budget: "₹15,000 - ₹30,000 / mo",
    plan: "Free Marketing Audit",
    website: "", // honeypot
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState<string>("Free Digital Growth Audit");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<DigitalBookingFormData>>({});
  const [formData, setFormData] = useState<DigitalBookingFormData>(initialFormData);

  // Helper for safe client masking
  const maskDisplayPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 7) {
      return digits.slice(0, 2) + "•••••" + digits.slice(-3);
    }
    return raw;
  };

  // Simulated audio progress ticker when playing
  useEffect(() => {
    if (!isPlaying || !activeTrack) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => {
        const curr = prev[activeTrack] || 0;
        const next = curr >= 100 ? 0 : curr + 1.5;
        return { ...prev, [activeTrack]: next };
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack]);

  const togglePlayTrack = (trackId: string) => {
    if (activeTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(trackId);
      setIsPlaying(true);
    }
  };

  const handleOpenModal = (planName: string) => {
    setModalPlan(planName);
    setSubmitError("");
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

    // Validate inputs client-side
    const validation = validateDigitalBooking({
      ...formData,
      plan: modalPlan,
    });

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setSubmitError("Please fill in the required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await postJson<DigitalBookingFormData>(
        "/api/digital-booking",
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

  const displayedAudioSamples = showMoreAudio
    ? [...initialAudioSamples, ...extendedAudioSamples]
    : initialAudioSamples;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0e0e0e] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#8525e3] selection:text-white">
      {/* -------------------------------------------------------------
          TOP BRAND STRIP & BREADCRUMB
          ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <span>←</span>
              <span>All Brands</span>
            </Link>
            <span className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#8525e3]" />
              <span className="font-heading text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                Sivagangai Digital Marketing
              </span>
              <span className="hidden rounded-full bg-[#8525e3]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#8525e3] sm:inline-block">
                Growth &amp; Creative Agency
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+919489246890"
              className="hidden items-center gap-1 text-xs text-slate-600 transition-colors hover:text-[#8525e3] md:inline-flex"
            >
              <span>Hotline:</span>
              <span className="font-semibold text-slate-900">+91 94892 46890</span>
            </a>
            <button
              onClick={() => handleOpenModal("Free Marketing Audit")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#8525e3] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#731ec4]"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Get Free Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          IMAGE 1: HERO SECTION
          "Captivate Your Audience With Exceptional Voiceovers"
          Split/Hero background image with bold white typography & purple CTA
          ------------------------------------------------------------- */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-slate-950 text-white sm:min-h-[90vh]">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={DIGITAL_MARKETING_ASSETS.heroBanner}
            alt="Sivagangai Digital Marketing - Creative Director & Strategist"
            fill
            className="object-cover object-center brightness-[0.70] contrast-110"
            priority
            sizes="100vw"
          />
          {/* Subtle gradient overlay to match Image 1 lighting */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent sm:via-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Main Headline matching Image 1 format */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Captivate Your <br />
              Audience With <br />
              Exceptional <br />
              <span className="inline-flex items-center gap-3">
                <span>Marketing</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md sm:h-12 sm:w-12">
                  <Radio className="h-5 w-5 animate-pulse text-white sm:h-6 sm:w-6" />
                </span>
              </span>
            </motion.h1>

            {/* Subtitle text matching Image 1 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-xl text-sm leading-relaxed font-normal text-white/90 sm:text-base md:text-lg"
            >
              We Are A Full-Service Growth Agency Providing Proven Results To{" "}
              <strong className="font-semibold text-white">Fast-Growing Companies</strong>
              . We Specialize In Meta Ads, High-Converting Video Reels, Regional Tamil
              Nadu SEO, And End-To-End Sales Funnels.
            </motion.p>

            {/* Two Action Buttons matching Image 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {/* Primary Purple Button */}
              <button
                onClick={() => handleOpenModal("Hero - Get Started Now")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#8525e3] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-all duration-200 hover:scale-[1.02] hover:bg-[#731ec4]"
              >
                <span>Get Started Now</span>
                <span className="font-sans text-base">›</span>
              </button>

              {/* Glass Outlined Button */}
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:bg-white/20"
              >
                <span>Explore Demo</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 1: "Who Is Mohammad Jabel?" (About & Director Section)
          2-Column: Left Purple Heading + Long Copy | Right Photo with Thick Purple Border
          ------------------------------------------------------------- */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Heading in Purple + Editorial Story */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              {/* Purple Title matching Image 1 */}
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[#8525e3] sm:text-4xl md:text-5xl">
                Who We Are &amp; What Drives Us?
              </h2>

              <div className="mt-6 space-y-4 text-justify text-xs leading-relaxed text-slate-600 sm:text-sm">
                <p>
                  At Sivagangai Digital Marketing, we are passionate about the power of
                  creative storytelling combined with razor-sharp data. We are a dedicated
                  growth marketing and ad production studio crafting high-converting paid
                  advertising, cinematic video commercials, and organic search strategies
                  for ambitious regional and national enterprises.
                </p>
                <p>
                  With an experienced roster of media buyers, scriptwriters, and creative
                  video directors, we bring your brand vision to life, captivating your
                  target audience and adding a measurable revenue dimension to your
                  business. Our mission is simple: to deliver exceptional customer
                  acquisition metrics that consistently exceed your quarterly
                  expectations.
                </p>
                <p>
                  Whether you need performance ads for retail showrooms, e-commerce
                  launches, corporate explainers, high-end hospitality promos, or local
                  healthcare awareness, we have the specialized talent to engineer your
                  success. What sets us apart is our relentless attention to detail,
                  transparent ROAS reporting, and deep regional market intuition. We
                  understand that each client is unique, and we take the time to craft
                  tailored strategies where every single campaign dollar is accounted for.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleOpenModal("Who We Are - Learn More")}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#8525e3] hover:text-[#731ec4] hover:underline sm:text-sm"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Right Column: Founder/Director Photo with Thick Purple Border matching Image 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:col-span-5"
            >
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* The Signature Thick Purple Border exactly matching Image 1 */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2.5rem] border-[5px] border-[#8525e3] shadow-2xl shadow-purple-500/15">
                  <Image
                    src={DIGITAL_MARKETING_ASSETS.directorPortrait}
                    alt="Sivagangai Digital Marketing - Growth Director"
                    fill
                    className="object-cover object-top transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  {/* Subtle inner gradient shadow */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute right-5 bottom-5 left-5 text-white">
                    <p className="text-xs font-semibold tracking-widest text-purple-200 uppercase">
                      Growth Director
                    </p>
                    <p className="font-heading text-lg font-bold">
                      Sivagangai Strategy Lab
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 2: "Our Voiceover Services" / Digital Marketing Services
          3 Cards with colorful 3D-style icons
          ------------------------------------------------------------- */}
      <section
        id="services"
        className="border-t border-slate-100 bg-[#faf9fc] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Section Header matching Image 2 */}
          <div className="text-left">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              Our Digital Marketing Services
            </h2>
            <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
              Versatile and High-Quality
            </p>
          </div>

          {/* 3 Service Cards matching Image 2 layout */}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1: Meta & Google Ads (Headset icon) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-purple-100 hover:shadow-xl sm:p-10"
            >
              {/* Colorful Flat 3D-style Icon matching Image 2 */}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3 shadow-inner">
                <div className="relative flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8525e3] text-white shadow-md">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                    ✓
                  </span>
                </div>
              </div>

              <h3 className="font-heading mt-8 text-lg font-bold tracking-tight text-slate-900">
                Male / Female Voice &amp; Ads
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                We offer a comprehensive voiceover and ad management service that covers
                both male and female voices. We understand the importance of having the
                right voice to effectively convey your message and capture your target
                audience&apos;s attention.
              </p>
            </motion.div>

            {/* Card 2: Professional Script Writing (Document & Pencil icon) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-purple-100 hover:shadow-xl sm:p-10"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3 shadow-inner">
                <div className="relative flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                    ✎
                  </span>
                </div>
              </div>

              <h3 className="font-heading mt-8 text-lg font-bold tracking-tight text-slate-900">
                Professional Script Writing
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                We specialize in professional commercial script writing services that
                bring your ideas to life. Our team of experienced scriptwriters
                understands the power of effective storytelling, hook structures, and
                psychology-driven conversions.
              </p>
            </motion.div>

            {/* Card 3: Music Selections / Creative Audio (Musical notes icon) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-purple-100 hover:shadow-xl sm:p-10"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 shadow-inner">
                <div className="relative flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                    <Music className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    ♫
                  </span>
                </div>
              </div>

              <h3 className="font-heading mt-8 text-lg font-bold tracking-tight text-slate-900">
                Music &amp; Sonic Selections
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                We offer a wide range of royalty-cleared music selections to enhance your
                projects and create an unforgettable auditory experience. Our extensive
                library features diverse genres, moods, and regional instruments to suit
                any commercial campaign.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 2: "Voiceover Samples" / Audio & Ad Campaign Samples
          6 Audio Player bars with Play/Pause, timestamps & waveform scrubbers
          ------------------------------------------------------------- */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Header Row with "Show more" button matching Image 2 */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                Voiceover Samples
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Hear Our Artists in Action
              </p>
            </div>

            <button
              onClick={() => setShowMoreAudio(!showMoreAudio)}
              className="cursor-pointer self-start text-xs font-semibold text-slate-500 transition-colors hover:text-[#8525e3] sm:self-auto sm:text-sm"
            >
              {showMoreAudio ? "Show less" : "Show more"}
            </button>
          </div>

          {/* 6-Grid Media Player bars matching Image 2 layout */}
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {displayedAudioSamples.map((sample, index) => {
                const isThisPlaying = activeTrack === sample.id && isPlaying;
                const progress = playProgress[sample.id] || (index % 2 === 0 ? 15 : 45);

                return (
                  <motion.div
                    key={sample.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                    className="flex flex-col"
                  >
                    {/* Track Title */}
                    <p className="truncate text-xs font-semibold tracking-tight text-slate-800">
                      {sample.title}
                    </p>

                    {/* Custom Audio Player Bar matching Image 2 */}
                    <div
                      className={`mt-2.5 flex items-center gap-3 rounded-full border px-4 py-2.5 transition-all duration-200 ${
                        isThisPlaying
                          ? "border-purple-300 bg-purple-50/70 shadow-sm"
                          : "border-slate-200 bg-slate-100/80 hover:border-slate-300"
                      }`}
                    >
                      {/* Play / Pause Toggle Button */}
                      <button
                        onClick={() => togglePlayTrack(sample.id)}
                        className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                          isThisPlaying
                            ? "bg-[#8525e3] text-white"
                            : "bg-slate-800 text-white hover:bg-slate-900"
                        }`}
                        aria-label={isThisPlaying ? "Pause audio" : "Play audio"}
                      >
                        {isThisPlaying ? (
                          <Pause className="h-3 w-3 fill-current" />
                        ) : (
                          <Play className="ml-0.5 h-3 w-3 fill-current" />
                        )}
                      </button>

                      {/* Timestamp */}
                      <span className="shrink-0 font-mono text-[11px] text-slate-600">
                        0:
                        {progress < 10
                          ? `0${Math.floor(progress)}`
                          : Math.floor(progress)}{" "}
                        / {sample.duration}
                      </span>

                      {/* Scrubber Progress Bar */}
                      <div
                        className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-slate-300"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const newProgress = Math.max(
                            0,
                            Math.min(100, (clickX / rect.width) * 100),
                          );
                          setPlayProgress({ ...playProgress, [sample.id]: newProgress });
                          setActiveTrack(sample.id);
                          setIsPlaying(true);
                        }}
                      >
                        <div
                          className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-150 ${
                            isThisPlaying ? "bg-[#8525e3]" : "bg-slate-800"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Speaker Volume Icon */}
                      <Volume2 className="h-4 w-4 shrink-0 text-slate-500" />

                      {/* 3-dots Menu */}
                      <button
                        onClick={() => handleOpenModal(`Audio Demo - ${sample.title}`)}
                        className="cursor-pointer text-slate-400 transition-colors hover:text-slate-700"
                        title="Download sample or request custom voice"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 3: "Pricing And Packages"
          Toggle (Monthly / Yearly) + 4 Cards (Starter, Intermediate, Advanced [Most Popular Solid Purple], Custom)
          ------------------------------------------------------------- */}
      <section
        id="pricing"
        className="border-t border-slate-100 bg-[#faf9fc] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Header & Monthly/Yearly Toggle matching Image 3 */}
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                Pricing And Packages
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Transparent and Affordable Options
              </p>
            </div>

            {/* Monthly / Yearly Pill Toggle Switcher matching Image 3 */}
            <div className="inline-flex items-center self-start rounded-full bg-slate-200/80 p-1 shadow-inner sm:self-auto">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`cursor-pointer rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[#8525e3] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`cursor-pointer rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${
                  billingCycle === "yearly"
                    ? "bg-[#8525e3] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Yearly <span className="text-[10px] opacity-80">(20% OFF)</span>
              </button>
            </div>
          </div>

          {/* 4 Pricing Cards matching Image 3 layout */}
          <div className="mt-14 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan, index) => {
              const isPopular = plan.isPopular;
              const price =
                billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all duration-300 sm:p-8 ${
                    isPopular
                      ? "bg-gradient-to-b from-[#8a2be2] via-[#8525e3] to-[#6b21a8] text-white shadow-2xl shadow-purple-900/30 lg:-translate-y-2"
                      : "border border-slate-100 bg-white text-slate-900 shadow-sm hover:border-purple-200 hover:shadow-xl"
                  }`}
                >
                  {/* "Most Popular" Top Magenta Pill Badge matching Image 3 */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-md bg-[#ff007a] px-3.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Plan Name */}
                    <h3
                      className={`text-sm font-semibold tracking-tight sm:text-base ${
                        isPopular ? "text-purple-100" : "text-slate-600"
                      }`}
                    >
                      {plan.name}
                    </h3>

                    {/* Price matching Image 3 format */}
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                        {price}
                      </span>
                      {price !== "Custom" && (
                        <span
                          className={`text-xs ${
                            isPopular ? "text-purple-200" : "text-slate-500"
                          }`}
                        >
                          / Month
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p
                      className={`mt-3 text-xs leading-relaxed ${
                        isPopular ? "text-purple-100" : "text-slate-500"
                      }`}
                    >
                      {plan.description}
                    </p>

                    {/* Feature Checklist matching Image 3 */}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-xs">
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              isPopular
                                ? "fill-white/20 text-purple-200"
                                : "text-[#8525e3]"
                            }`}
                          />
                          <span
                            className={
                              isPopular ? "text-white" : "font-medium text-slate-700"
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Plan Button matching Image 3 */}
                  <div className="mt-8 pt-4">
                    {plan.buttonVariant === "solid-white" ? (
                      <button
                        onClick={() => handleOpenModal(`Pricing Plan: ${plan.name}`)}
                        className="w-full cursor-pointer rounded-xl bg-white py-3 text-xs font-bold text-[#8525e3] shadow-md transition-all hover:bg-slate-100"
                      >
                        {plan.buttonLabel}
                      </button>
                    ) : plan.buttonVariant === "solid-purple" ? (
                      <button
                        onClick={() => handleOpenModal(`Pricing Plan: ${plan.name}`)}
                        className="w-full cursor-pointer rounded-xl bg-[#8525e3] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#731ec4]"
                      >
                        {plan.buttonLabel}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(`Pricing Plan: ${plan.name}`)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-200"
                      >
                        {plan.buttonLabel}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          IMAGE 3: "What Clients Are Saying" & Dotted Map Graphic
          2-Column: Left Testimonials + Star Ratings + Arrows | Right Dotted Regional Map
          ------------------------------------------------------------- */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Testimonials matching Image 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                What Clients Are Saying
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                We are always dedicated to client happiness and revenue results.
              </p>

              {/* Testimonial Cards matching Image 3 */}
              <div className="mt-10 space-y-6">
                {testimonials.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="border-b border-slate-100 pb-6 last:border-b-0"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 shadow-sm">
                        <Image
                          src={t.avatar}
                          alt={t.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        <div className="mt-0.5 flex items-center gap-1 text-amber-400">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3.5 w-3.5 fill-current text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed font-normal text-slate-600 sm:text-sm">
                      {t.quote}
                    </p>
                  </div>
                ))}
              </div>

              {/* Prev / Next Circular Arrows matching Image 3 */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() =>
                    setTestiIndex((prev) =>
                      prev === 0 ? testimonials.length - 1 : prev - 1,
                    )
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={() =>
                    setTestiIndex((prev) => (prev + 1) % testimonials.length)
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#8525e3] text-white shadow-md transition-all hover:bg-[#731ec4]"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* Right Column: Dotted Regional Map with Glowing Purple Pins matching Image 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:col-span-6"
            >
              <div className="relative flex aspect-[4/3] w-full max-w-lg items-center justify-center overflow-hidden rounded-3xl border border-purple-100/60 bg-gradient-to-br from-purple-50/40 via-white to-slate-50 p-6 shadow-lg sm:p-8">
                {/* Stylized Dotted Map Grid SVG matching Image 3 */}
                <div className="absolute inset-0 flex items-center justify-center p-8 opacity-85">
                  <svg
                    viewBox="0 0 400 300"
                    className="h-full w-full fill-[#8525e3]/20"
                    aria-hidden="true"
                  >
                    {/* Dotted pattern matrix resembling regional territory */}
                    {Array.from({ length: 18 }).map((_, r) =>
                      Array.from({ length: 24 }).map((_, c) => {
                        // Create district shape density
                        const inside =
                          (r > 2 && r < 15 && c > 4 && c < 20) ||
                          (r >= 6 && r <= 17 && c >= 6 && c <= 18);
                        if (!inside) return null;
                        return (
                          <circle
                            key={`${r}-${c}`}
                            cx={c * 16 + 10}
                            cy={r * 16 + 10}
                            r={3}
                            className="fill-[#a855f7]/40 transition-colors hover:fill-[#8525e3]"
                          />
                        );
                      }),
                    )}
                  </svg>
                </div>

                {/* Glowing Regional Purple Pins matching Image 3 */}
                {regionalPins.map((pin, pIdx) => (
                  <div
                    key={pin.city}
                    className="group absolute z-10 cursor-pointer"
                    style={{ left: pin.x, top: pin.y }}
                  >
                    {/* Ripple animation */}
                    <div className="absolute -inset-2 animate-ping rounded-full bg-[#8525e3]/30 opacity-60" />
                    {/* The Purple Pin */}
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#8525e3] text-white shadow-xl shadow-purple-900/40 transition-transform group-hover:scale-125">
                      <MapPin className="h-4 w-4 fill-white" />
                    </div>

                    {/* Hover Tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 flex-col items-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] whitespace-nowrap text-white shadow-xl group-hover:flex">
                      <span className="font-bold">{pin.city}</span>
                      <span className="text-[10px] text-purple-300">
                        {pin.clients} • {pin.label}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Bottom Map Badge */}
                <div className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-md">
                  <Globe className="h-3 w-3 text-[#8525e3]" />
                  <span>Tamil Nadu Active Client Network</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          BOTTOM CLIENT TICKER: "We Have Worked With"
          ------------------------------------------------------------- */}
      <section className="border-t border-slate-100 bg-[#faf9fc] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center sm:px-8">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            We Have Scaled Revenue For
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-75 grayscale transition-all hover:grayscale-0 sm:gap-14">
            <span className="font-heading text-lg font-bold tracking-wider text-slate-700">
              CHETTINAD HERITAGE
            </span>
            <span className="font-heading text-lg font-bold tracking-wider text-slate-700">
              SAFFRON GRAND
            </span>
            <span className="font-heading text-lg font-bold tracking-wider text-slate-700">
              VELAVAN SILKS
            </span>
            <span className="font-heading text-lg font-bold tracking-wider text-slate-700">
              APEX HEALTHCARE
            </span>
            <span className="font-heading text-lg font-bold tracking-wider text-slate-700">
              KARPAGAM JEWELLERY
            </span>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          SIGNATURE DARK BRAND FOOTER
          5-column grid + pill newsletter + brand links
          ------------------------------------------------------------- */}
      <BrandDarkFooter
        brandName="Sivagangai Digital Marketing"
        tagline="GROWTH MARKETING, META & GOOGLE ADS & VIRAL CONTENT LAB"
      />

      {/* -------------------------------------------------------------
          INTERACTIVE AUDIT & GROWTH CONSULTATION MODAL
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex [scrollbar-width:none] items-center justify-center overflow-y-auto p-4 sm:p-6 [&::-webkit-scrollbar]:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-2xl [scrollbar-width:none] overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-10 [&::-webkit-scrollbar]:hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {formSubmitted ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading mt-4 text-2xl font-bold">
                    Audit Request Received!
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Thank you,{" "}
                    <span className="font-semibold text-slate-900">
                      {formData.businessName}
                    </span>
                    . Our Senior Growth Strategist will contact you at{" "}
                    <span className="font-semibold text-[#8525e3]">
                      {maskDisplayPhone(formData.phone)}
                    </span>{" "}
                    within 2 business hours with your personalized competitive audit
                    report.
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="mt-6 inline-flex cursor-pointer rounded-full bg-[#8525e3] px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#731ec4]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-[#8525e3]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{modalPlan}</span>
                    </div>
                    <h3 className="font-heading mt-3 text-3xl font-medium text-slate-900 sm:text-4xl">
                      Accelerate Your Customer Growth
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-5 text-slate-500">
                      Fill out your details below and we&apos;ll prepare a customized
                      revenue growth roadmap for your business.
                    </p>
                  </div>

                  {submitError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
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
                      <label className="block text-xs font-semibold text-slate-700">
                        Company / Business Name *
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
                            : "border-slate-300 bg-white"
                        } px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#8525e3]`}
                      />
                      {fieldErrors.businessName && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">
                          {fieldErrors.businessName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
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
                              : "border-slate-300 bg-white"
                          } px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#8525e3]`}
                        />
                        {fieldErrors.phone && (
                          <p className="mt-1 text-[11px] font-medium text-red-600">
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Email Address{" "}
                          <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="growth@company.com"
                          className={`mt-1.5 w-full rounded-xl border ${
                            fieldErrors.email
                              ? "border-red-400 bg-red-50/20"
                              : "border-slate-300 bg-white"
                          } px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#8525e3]`}
                        />
                        {fieldErrors.email && (
                          <p className="mt-1 text-[11px] font-medium text-red-600">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Service of Interest
                        </label>
                        <select
                          value={formData.serviceInterested}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              serviceInterested: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#8525e3]"
                        >
                          <option>Meta &amp; Google Paid Ads</option>
                          <option>Viral Reels &amp; Scriptwriting</option>
                          <option>Regional SEO &amp; Google Maps</option>
                          <option>Full-Funnel Digital Growth</option>
                          <option>Voiceover &amp; Ad Production</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Monthly Ad Budget
                        </label>
                        <select
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({ ...formData, budget: e.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#8525e3]"
                        >
                          <option>₹15,000 - ₹30,000 / mo</option>
                          <option>₹30,000 - ₹60,000 / mo</option>
                          <option>₹60,000 - ₹1,50,000 / mo</option>
                          <option>₹1,50,000+ / mo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Website or Instagram Page URL{" "}
                        <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.websiteUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, websiteUrl: e.target.value })
                        }
                        placeholder="e.g. instagram.com/yourbrand or yourwebsite.com"
                        className={`mt-1.5 w-full rounded-xl border ${
                          fieldErrors.websiteUrl
                            ? "border-red-400 bg-red-50/20"
                            : "border-slate-300 bg-white"
                        } px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-[#8525e3]`}
                      />
                      {fieldErrors.websiteUrl && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">
                          {fieldErrors.websiteUrl}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-purple-100 bg-purple-50/70 px-4 py-3">
                      <div className="flex flex-col gap-2 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#8525e3]" /> Competitive
                          audit report
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#8525e3]" /> Revenue growth
                          roadmap
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#8525e3]" /> Reply within 2
                          business hours
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8525e3] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#731ec4] disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Submitting Request...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Submit Free Audit Request</span>
                          </>
                        )}
                      </button>
                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        🔒 100% confidential. Customer phone numbers encrypted with
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
