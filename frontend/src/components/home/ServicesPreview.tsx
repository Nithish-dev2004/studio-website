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
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <li key={service.slug}>
              <FadeIn delay={(index % 3) * 0.08} className="h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-[#C5923A]/40 hover:shadow-md">
                  <Icon className="text-accent mb-4 h-7 w-7 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  <h3 className="text-2xl">{service.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {service.shortDescription}
                  </p>
                </Card>
              </FadeIn>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 text-center">
        <Link
          href="/services"
          className="group inline-flex items-center gap-3 rounded-full border border-[#17120D]/20 bg-white px-7 py-3.5 text-sm font-semibold tracking-wide text-[#17120D] shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#17120D] hover:bg-[#17120D] hover:text-[#F4EDE2] hover:shadow-xl hover:shadow-[#17120D]/12 active:translate-y-0 active:scale-95 cursor-pointer"
        >
          <span>Explore Services</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17120D]/5 transition-all duration-300 ease-out group-hover:bg-[#C5923A] group-hover:text-white">
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </Section>
  );
}
