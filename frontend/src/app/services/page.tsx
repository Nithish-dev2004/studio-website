import Image from "next/image";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Services",
  description: "Wedding, portrait, product and event photography, plus studio rental.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <Section
      asPageHeading
      eyebrow="Services"
      title="How We Can Help"
      subtitle="Choose a service below, or get in touch for something custom."
    >
      <ul className="space-y-16 md:space-y-24">
        {services.map((service, index) => (
          <li key={service.slug}>
            <FadeIn className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              {/* Alternate the image side on larger screens for a nicer rhythm */}
              <div
                className={cn(
                  "bg-muted relative aspect-[4/3] overflow-hidden rounded-lg",
                  index % 2 === 1 && "md:order-last",
                )}
              >
                <Image
                  src={service.image}
                  alt={`Placeholder photo for ${service.title}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl">{service.title}</h2>
                <p className="text-muted-foreground mt-3">{service.description}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check
                        className="text-accent h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button href="/booking" className="mt-7">
                  Book {service.title}
                </Button>
              </div>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  );
}
