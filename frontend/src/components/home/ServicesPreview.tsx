// A short overview of the services, linking to the full Services page.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { services } from "@/data/services";

export default function ServicesPreview() {
  return (
    <Section
      tone="muted"
      eyebrow="What We Do"
      title="Our Services"
      subtitle="From intimate portraits to full-day weddings, we have you covered."
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <li key={service.slug}>
              <FadeIn delay={(index % 3) * 0.08} className="h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                  <Icon className="text-accent mb-4 h-7 w-7 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  <h3 className="text-2xl font-normal">{service.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {service.shortDescription}
                  </p>
                </Card>
              </FadeIn>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 sm:mt-10 text-center">
        <Link
          href="/services"
          className="group inline-flex items-center gap-3 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-foreground hover:bg-foreground hover:text-background hover:shadow-lg active:translate-y-0 active:scale-95 cursor-pointer"
        >
          <span>Explore Services</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted transition-all duration-300 ease-out group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </Section>
  );
}
