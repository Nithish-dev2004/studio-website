import { ArrowRight, Camera, CalendarDays, Megaphone, Store } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import Container from "@/components/ui/Container";
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
    <section className="bg-background py-14 sm:py-20">
      <Container className="max-w-5xl">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-accent text-[10px] font-semibold tracking-[0.3em] uppercase">
            The Sivagangai Group
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">
            One vision, four specialist brands.
          </h1>
          <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
            Explore the focused services created to help you celebrate, promote and grow.
          </p>
          <div className="bg-accent mx-auto mt-5 h-px w-10" />
        </header>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {subBrands.map((brand, index) => {
            const Icon = brandIcons[index];
            return (
              <FadeIn key={brand.id} delay={index * 0.08}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="border-border bg-card hover:border-accent/40 group relative block min-h-34 rounded-lg border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgb(26_26_26/0.06)] sm:p-6"
                >
                  <span className="bg-muted text-accent flex h-8 w-8 items-center justify-center rounded-full">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-accent absolute top-5 right-5 text-[9px] font-medium tracking-[0.18em] sm:top-6 sm:right-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-accent mt-5 text-[9px] font-semibold tracking-[0.18em] uppercase">
                    {brand.specialty}
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl">{brand.name}</h2>
                  <p className="text-muted-foreground mt-2 text-xs leading-5">
                    {brand.description}
                  </p>
                  <span className="text-foreground mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium">
                    Explore
                    <ArrowRight
                      className="text-accent h-3 w-3 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
