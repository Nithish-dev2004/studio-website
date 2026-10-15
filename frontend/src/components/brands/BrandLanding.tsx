import type { CSSProperties } from "react";
import {
  AtSign,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Clapperboard,
  Globe2,
  Heart,
  ImageIcon,
  LayoutPanelTop,
  Megaphone,
  MonitorUp,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { subBrands } from "@/data/site";

type Brand = (typeof subBrands)[number];

const iconSets = {
  captures: [Camera, ImageIcon, Clapperboard],
  eventz: [Heart, BriefcaseBusiness, CalendarDays, Megaphone],
  "digital-marketing": [AtSign, Megaphone, Search, Globe2],
  "sign-board": [Sparkles, LayoutPanelTop, MonitorUp, BadgeCheck],
} as const;

function BrandVisual({ brand }: { brand: Brand }) {
  if (brand.slug === "captures") {
    return <div className="border-[var(--brand-color)]/70 relative flex min-h-52 items-center justify-center border bg-black/15"><span className="absolute left-4 top-3 flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-red-400" /> REC</span><Play className="h-12 w-12 text-[var(--brand-color)]" strokeWidth={1.5} aria-hidden="true" /><span className="absolute bottom-3 right-4 font-mono text-xs text-white/60">00:12:04</span></div>;
  }
  if (brand.slug === "eventz") {
    return <div className="space-y-3 rounded-xl bg-[color-mix(in_srgb,var(--brand-color)_22%,transparent)] p-5">{["Plan · budget, venue, vendors", "Design · theme, stage, decor", "Celebrate · we handle the day"].map((step, index) => <p className="flex items-center gap-3 font-medium" key={step}><span className="bg-[var(--brand-color)] flex h-8 w-8 items-center justify-center rounded-full text-sm text-white">{index + 1}</span>{step}</p>)}</div>;
  }
  if (brand.slug === "digital-marketing") {
    return <div className="rounded-xl bg-black/20 p-6"><div className="grid grid-cols-3 gap-4 text-sm"><p>Reach<strong className="block text-2xl text-white">48k</strong></p><p>Leads<strong className="block text-2xl text-white">312</strong></p><p>Return<strong className="block text-2xl text-[var(--brand-color)]">3.4x</strong></p></div><div className="mt-10 flex h-16 items-end gap-2">{[25, 34, 47, 72, 86].map((height) => <span key={height} style={{ height: `${height}%` }} className="bg-[var(--brand-color)] flex-1 rounded-t-sm opacity-80" />)}</div></div>;
  }
  return <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border-4 border-white/90 text-center"><span className="text-sm text-white/70">Your shop name</span><strong className="font-heading mt-1 text-4xl text-[var(--brand-color)]">Your Brand Here</strong><span className="mt-1 text-sm text-white/70">LED backlit · 6 ft × 2 ft</span></div>;
}

import BrandDarkFooter from "@/components/layout/BrandDarkFooter";

export default function BrandLanding({ brand }: { brand: Brand }) {
  const icons = iconSets[brand.slug];
  const [firstWord, ...rest] = brand.headline.split(" ");

  return (
    <>
      <section style={{ "--brand-color": brand.accent } as CSSProperties} className="bg-[#111210] px-4 py-8 text-[#f7f5ef] sm:px-6 md:py-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-[#191a18] shadow-2xl">
          <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 px-6 py-5 md:px-8">
            <Link href="/brands" className="font-heading text-2xl font-semibold tracking-tight">{brand.name}</Link>
            <nav aria-label={`${brand.name} navigation`} className="hidden gap-5 text-sm text-white/70 md:flex"><a href="#services">Services</a><a href="#details">Details</a><a href="#contact">Contact</a></nav>
            <a href="#contact" className="rounded-xl bg-[var(--brand-color)] px-4 py-2 text-sm font-semibold text-black">{brand.action}</a>
          </header>
          <div className="grid gap-10 px-6 py-10 md:grid-cols-2 md:px-8 md:py-12">
            <div className="flex flex-col justify-center"><p className="text-[var(--brand-color)] text-xs font-semibold tracking-[0.22em] uppercase">{brand.specialty}</p><h1 className="font-heading mt-4 text-5xl leading-[0.95] md:text-6xl">{firstWord} <em className="text-[var(--brand-color)]">{rest.join(" ")}</em></h1><p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">{brand.description}</p><div className="mt-7 flex flex-wrap gap-3"><a href="#contact" className="rounded-xl bg-[var(--brand-color)] px-5 py-3 font-semibold text-black">{brand.action}</a><a href="#services" className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/5">{brand.secondaryAction}</a></div></div>
            <BrandVisual brand={brand} />
          </div>
          <div id="services" className="grid gap-3 px-6 pb-6 sm:grid-cols-2 md:grid-cols-4 md:px-8 md:pb-8">{brand.services.map((service, index) => { const Icon = icons[index]; return <article key={service} className="rounded-xl bg-black/20 p-5"><Icon className="h-5 w-5 text-[var(--brand-color)]" aria-hidden="true" /><h2 className="mt-3 font-semibold">{service}</h2></article>; })}</div>
          <div id="details" className="border-t border-white/10 px-6 py-7 text-white/65 md:px-8"><p>Part of the Sivagangai group — focused work, clear communication and dependable delivery.</p></div>
          <div id="contact" className="border-t border-white/10 px-6 py-7 md:px-8"><Link href="/contact" className="text-[var(--brand-color)] font-semibold hover:underline">Start a conversation with {brand.name} →</Link></div>
        </div>
      </section>
      <BrandDarkFooter
        brandName={brand.name}
        tagline={`${brand.specialty.toUpperCase()} & STUDIO`}
      />
    </>
  );
}
