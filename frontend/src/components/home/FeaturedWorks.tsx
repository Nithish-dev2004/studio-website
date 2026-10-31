// A handful of your best photos on the home page, with a link to the full portfolio.
// Photos marked `featured: true` in data/portfolio.ts show up here.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { portfolio } from "@/data/portfolio";

export default function FeaturedWorks() {
  const featured = portfolio.filter((item) => item.featured).slice(0, 4);

  return (
    <Section
      eyebrow="Selected Work"
      title="Featured Works"
      subtitle="A small selection of recent sessions. Every story is different."
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {featured.map((item, index) => (
          <li key={item.id}>
            <FadeIn delay={(index % 4) * 0.08} className="h-full">
              <figure className="group bg-muted relative aspect-[4/5] overflow-hidden rounded-xl border border-border/60 shadow-xs transition-all duration-300 hover:shadow-md">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  quality={75}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Touch-friendly caption: visible by default on mobile touch, hover-revealed on pointer screens */}
                <figcaption className="bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white absolute inset-x-0 bottom-0 p-4 text-sm font-medium transition-all duration-300 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <span className="block font-heading text-base leading-tight text-white">{item.title}</span>
                  <span className="block text-[11px] font-sans uppercase tracking-widest text-accent mt-0.5">
                    {item.category}
                  </span>
                </figcaption>
              </figure>
            </FadeIn>
          </li>
        ))}
      </ul>
      <div className="mt-8 sm:mt-10 text-center">
        <Link
          href="/portfolio"
          className="group inline-flex items-center gap-3 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-foreground hover:bg-foreground hover:text-background hover:shadow-lg active:translate-y-0 active:scale-95 cursor-pointer"
        >
          <span>See Full Portfolio</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted transition-all duration-300 ease-out group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </Section>
  );
}
