// A short overview of the services, linking to the full Services page.

import Button from "@/components/ui/Button";
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
                <Card className="h-full">
                  <Icon className="text-accent mb-4 h-7 w-7" aria-hidden="true" />
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
        <Button href="/services" variant="outline" size="lg">
          Explore Services
        </Button>
      </div>
    </Section>
  );
}
