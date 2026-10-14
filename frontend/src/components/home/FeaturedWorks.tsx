// A handful of your best photos on the home page, with a link to the full portfolio.
// Photos marked `featured: true` in data/portfolio.ts show up here.

import Image from "next/image";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { portfolio } from "@/data/portfolio";

export default function FeaturedWorks() {
  const featured = portfolio.filter((item) => item.featured).slice(0, 6);

  return (
    <Section
      eyebrow="Selected Work"
      title="Featured Works"
      subtitle="A small selection of recent sessions. Every story is different."
    >
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {featured.map((item, index) => (
          <li key={item.id}>
            <FadeIn delay={(index % 3) * 0.08}>
              <figure className="group bg-muted relative aspect-[4/5] overflow-hidden rounded-lg">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
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
        <Button href="/portfolio" variant="outline" size="lg">
          See Full Portfolio
        </Button>
      </div>
    </Section>
  );
}
