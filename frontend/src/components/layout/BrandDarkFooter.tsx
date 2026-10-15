"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface FooterLinkItem {
  label: string;
  href?: string;
}

interface BrandFooterConfig {
  tagline: string;
  col2Title: string;
  col2Items: FooterLinkItem[];
  col3Title: string;
  col3Items: FooterLinkItem[];
  col4Title: string;
  col4Items: FooterLinkItem[];
  newsletterText: string;
}

const BRAND_CONFIGS: Record<string, BrandFooterConfig> = {
  "Sivagangai Sign Board": {
    tagline: "SIGN BOARDS, 3D LED ACRYLIC & ARCHITECTURAL DISPLAYS STUDIO",
    col2Title: "SIGNBOARD TYPES",
    col2Items: [
      { label: "3D LED Acrylic Letters", href: "/brands/sign-board#examples" },
      { label: "Exterior ACP Cladding", href: "/brands/sign-board#examples" },
      { label: "Backlit Steel Halo Signs", href: "/brands/sign-board#examples" },
      { label: "Custom Neon Flex Art", href: "/brands/sign-board#examples" },
      { label: "Monolith Pylon Displays", href: "/brands/sign-board#examples" },
      { label: "Solid Brass & Nameplates", href: "/brands/sign-board#examples" },
    ],
    col3Title: "BUSINESS SECTORS",
    col3Items: [
      { label: "Retail & Showrooms", href: "/brands/sign-board#create" },
      { label: "Hospitals & Clinics", href: "/brands/sign-board#create" },
      { label: "Corporate Headquarters", href: "/brands/sign-board#create" },
      { label: "Hotels & Hospitality", href: "/brands/sign-board#create" },
      { label: "Boutiques & Cafes", href: "/brands/sign-board#create" },
    ],
    col4Title: "UTILITY PAGES",
    col4Items: [
      { label: "Free On-Site Measurement", href: "/brands/sign-board#cta" },
      { label: "3D Night Render Preview", href: "/brands/sign-board#features" },
      { label: "3-Year Warranty Policy", href: "/brands/sign-board#features" },
      { label: "Brand Ecosystem", href: "/brands" },
      { label: "Scaffolding & Mounting", href: "/contact" },
    ],
    newsletterText:
      "Subscribe to our newsletter where we share recent commercial installations, lighting innovations, and exclusive corporate offers.",
  },
  "Sivagangai Digital Marketing": {
    tagline: "GROWTH MARKETING, META & GOOGLE ADS & VIRAL CONTENT LAB",
    col2Title: "GROWTH SERVICES",
    col2Items: [
      { label: "Meta & Google Paid Ads", href: "/brands/digital-marketing#services" },
      { label: "Viral Reel Production", href: "/brands/digital-marketing#services" },
      { label: "Regional SEO & Maps", href: "/brands/digital-marketing#services" },
      { label: "Conversion Web Funnels", href: "/brands/digital-marketing#services" },
      { label: "Sonic & Voiceover Ads", href: "/brands/digital-marketing#services" },
    ],
    col3Title: "INDUSTRIES",
    col3Items: [
      { label: "E-Commerce & Retail", href: "/brands/digital-marketing" },
      { label: "Healthcare & Clinics", href: "/brands/digital-marketing" },
      { label: "Real Estate & Builders", href: "/brands/digital-marketing" },
      { label: "Hospitality & Dining", href: "/brands/digital-marketing" },
      { label: "B2B & Corporate", href: "/brands/digital-marketing" },
    ],
    col4Title: "UTILITY PAGES",
    col4Items: [
      { label: "Free Growth Audit", href: "/brands/digital-marketing#pricing" },
      { label: "Pricing & Packages", href: "/brands/digital-marketing#pricing" },
      { label: "Campaign Audio Demos", href: "/brands/digital-marketing" },
      { label: "Brand Ecosystem", href: "/brands" },
      { label: "Client Case Studies", href: "/brands/digital-marketing" },
    ],
    newsletterText:
      "Subscribe to our newsletter where we share revenue growth case studies, ad strategies, and viral video tips.",
  },
  "Sivagangai Events": {
    tagline: "EVENT MANAGEMENT & LUXURY CELEBRATION STUDIO",
    col2Title: "EVENT EXPERIENCES",
    col2Items: [
      { label: "Royal Chettinad Mandap", href: "/brands/events#themes" },
      { label: "Twilight Sangeet Nights", href: "/brands/events#themes" },
      { label: "Grand Imperial Receptions", href: "/brands/events#themes" },
      { label: "Lakeside Vedic Muhurtham", href: "/brands/events#themes" },
      { label: "Corporate Executive Galas", href: "/brands/events#themes" },
    ],
    col3Title: "SERVICES",
    col3Items: [
      { label: "Floral & Theme Decor", href: "/brands/events" },
      { label: "Stage & Truss Lighting", href: "/brands/events" },
      { label: "Live Sound & DJ Systems", href: "/brands/events" },
      { label: "Athangudi Floor Styling", href: "/brands/events" },
      { label: "VIP Hospitality & Dining", href: "/brands/events" },
    ],
    col4Title: "UTILITY PAGES",
    col4Items: [
      { label: "Event Booking Inquiry", href: "/booking" },
      { label: "Pricing & Theme Packages", href: "/brands/events#themes" },
      { label: "Venue Consultation", href: "/contact" },
      { label: "Brand Ecosystem", href: "/brands" },
      { label: "Safety & Permits", href: "/about" },
    ],
    newsletterText:
      "Subscribe to our newsletter where we share decor inspirations, bridal trends, and exclusive event dates.",
  },
  "Sivagangai Capture": {
    tagline: "FINE-ART WEDDINGS, HEIRLOOM PORTRAITURE & CINEMATOGRAPHY",
    col2Title: "PRESET PACKS",
    col2Items: [
      { label: "Sivagangai Preset Pack Vol. 01", href: "/brands/captures#presets" },
      { label: "Heritage Preset Pack Vol. 02", href: "/brands/captures#presets" },
      { label: "Candid Preset Pack Vol. 03", href: "/brands/captures#presets" },
      { label: "Golden Hour LUTs", href: "/brands/captures#presets" },
    ],
    col3Title: "BUSINESS AREAS",
    col3Items: [
      { label: "Wedding Photography", href: "/portfolio" },
      { label: "Chettinad Heritage", href: "/portfolio" },
      { label: "Portrait & Heirlooms", href: "/portfolio" },
      { label: "Pre-Wedding Films", href: "/portfolio" },
      { label: "Artisanal Commercials", href: "/portfolio" },
    ],
    col4Title: "UTILITY PAGES",
    col4Items: [
      { label: "Booking Inquiry", href: "/booking" },
      { label: "Pricing & Guides", href: "/services" },
      { label: "Brand Ecosystem", href: "/brands" },
      { label: "Licenses & Rights", href: "/about" },
      { label: "Changelog", href: "/about" },
    ],
    newsletterText:
      "Subscribe to our newsletter where we share news about upcoming shoots, exhibitions, and exclusive preset drops.",
  },
};

export default function BrandDarkFooter({
  brandName = "Sivagangai Events",
  tagline,
  col2Title,
  col2Items,
  col3Title,
  col3Items,
  col4Title,
  col4Items,
  newsletterText,
}: {
  brandName?: string;
  tagline?: string;
  col2Title?: string;
  col2Items?: FooterLinkItem[];
  col3Title?: string;
  col3Items?: FooterLinkItem[];
  col4Title?: string;
  col4Items?: FooterLinkItem[];
  newsletterText?: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Auto-detect config for known brand, fallback to generic
  const matchedConfig =
    BRAND_CONFIGS[brandName] || BRAND_CONFIGS["Sivagangai Capture"];

  const effectiveTagline =
    tagline || matchedConfig.tagline;
  const effectiveCol2Title =
    col2Title || matchedConfig.col2Title;
  const effectiveCol2Items =
    col2Items || matchedConfig.col2Items;
  const effectiveCol3Title =
    col3Title || matchedConfig.col3Title;
  const effectiveCol3Items =
    col3Items || matchedConfig.col3Items;
  const effectiveCol4Title =
    col4Title || matchedConfig.col4Title;
  const effectiveCol4Items =
    col4Items || matchedConfig.col4Items;
  const effectiveNewsletter =
    newsletterText || matchedConfig.newsletterText;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="relative z-20 bg-[#1c2225] pt-20 pb-12 text-[#f3f1ed] border-t border-black/40">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Centered Brand Title matching the exact image */}
        <div className="text-center">
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-white">
            {brandName}
          </h2>
          <p className="mt-3 text-xs sm:text-sm tracking-[0.25em] uppercase text-white/70 font-medium">
            {effectiveTagline}
          </p>
        </div>

        {/* 5-Column Navigation Grid matching the exact image */}
        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-14 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">
          {/* Column 1: PAGES */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
              PAGES
            </p>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition-colors hover:text-white">
                  Store
                </Link>
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

          {/* Column 2: Individual Category / Brand Specialty */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
              {effectiveCol2Title}
            </p>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75">
              {effectiveCol2Items.map((item, idx) => (
                <li key={idx}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="cursor-default hover:text-white transition-colors">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Business Areas / Sectors / Industries */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
              {effectiveCol3Title}
            </p>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75">
              {effectiveCol3Items.map((item, idx) => (
                <li key={idx}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="cursor-default hover:text-white transition-colors">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: UTILITY PAGES */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
              {effectiveCol4Title}
            </p>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75">
              {effectiveCol4Items.map((item, idx) => (
                <li key={idx}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="cursor-default hover:text-white transition-colors">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: NEWSLETTER */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <p className="text-xs font-semibold tracking-wider text-[#d59a72] uppercase">
              NEWSLETTER
            </p>
            <p className="mt-4 text-xs text-white/75 leading-relaxed">
              {effectiveNewsletter}
            </p>

            {submitted ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Thank you! You are subscribed to our updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex items-center rounded-xl bg-white p-1 shadow-inner">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    aria-label="Newsletter email address"
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-[#1c2225] placeholder-[#8b958f] outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2b3337] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1f2528] cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {brandName} · Part of the Sivagangai Media Group.
            All rights reserved.
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
  );
}
