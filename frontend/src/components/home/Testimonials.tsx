// Kind words from clients. Edit the text in data/testimonials.ts.

import Card from "@/components/ui/Card";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <Section eyebrow="Kind Words" title="What Clients Say">
      <ul className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <li key={item.id}>
            <FadeIn delay={index * 0.08} className="h-full">
              <Card className="h-full">
                <figure className="flex h-full flex-col justify-between gap-6">
                  <blockquote className="font-heading text-xl leading-snug">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground"> &middot; {item.role}</span>
                  </figcaption>
                </figure>
              </Card>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  );
}
