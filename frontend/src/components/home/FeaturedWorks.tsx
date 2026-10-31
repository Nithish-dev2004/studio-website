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

  const gridClasses =
    featured.length === 4
      ? "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-5"
      : "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5";

  return (
    <Section
      eyebrow="Selected Work"
      title="Featured Works"
      subtitle="A small selection of recent sessions. Every story is different."
    >
      <ul className={gridClasses}>
        {featured.map((item, index) => (
          <li key={item.id}>
            <FadeIn delay={(index % 4) * 0.08}>
              <figure className="group bg-muted relative aspect-[4/5] overflow-hidden rounded-xl border border-border/40 shadow-xs">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={
                    featured.length === 4
                      ? "(min-width: 1024px) 25vw, 50vw"
                      : "(min-width: 768px) 33vw, 50vw"
                  }
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="bg-scrim text-on-image absolute inset-x-0 bottom-0 p-3 text-sm opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  {item.title}
                </figcaption>
              </figure>
            </FadeIn>
          </li>
        ))}
      </ul>
      <div className="mt-10 text-center">
        <Link
          href="/portfolio"
          className="group inline-flex items-center gap-3 rounded-full border border-[#17120D]/20 bg-background px-7 py-3.5 text-sm font-semibold tracking-wide text-[#17120D] shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#17120D] hover:bg-[#17120D] hover:text-[#F4EDE2] hover:shadow-xl hover:shadow-[#17120D]/12 active:translate-y-0 active:scale-95 cursor-pointer"
        >
          <span>See Full Portfolio</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17120D]/5 transition-all duration-300 ease-out group-hover:bg-[#C5923A] group-hover:text-white">
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </Section>
  );
}
