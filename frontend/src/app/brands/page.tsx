import { Camera, CalendarDays, Megaphone, Store } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { subBrands } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Our Brands",
  description:
    "Discover the photography, event management, digital marketing and sign board brands in the Sivagangai group.",
  path: "/brands",
});

const brandIcons = [Camera, CalendarDays, Megaphone, Store];

export default function BrandsPage() {
  return (
    <Section
      asPageHeading
      eyebrow="The Sivagangai Group"
      title="One vision, four specialist brands."
      subtitle="Explore the focused services created to help you celebrate, promote and grow."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {subBrands.map((brand, index) => {
          const Icon = brandIcons[index];
          return (
            <FadeIn key={brand.id} delay={index * 0.08}>
              <Link
                href={`/brands/${brand.slug}`}
                className="bg-card border-border block h-full rounded-lg border p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="bg-accent/15 text-accent flex h-12 w-12 items-center justify-center rounded-full">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="text-accent mt-6 text-xs font-medium tracking-[0.2em] uppercase">
                  {brand.specialty}
                </p>
                <h2 className="mt-2 text-3xl">{brand.name}</h2>
                <p className="text-muted-foreground mt-3 leading-relaxed">{brand.description}</p>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}
