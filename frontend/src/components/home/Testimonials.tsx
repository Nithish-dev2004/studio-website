// Kind words from clients.
// Queries the 3 latest approved feedback entries with rating 4 or 5 from Supabase,
// falling back to data/testimonials.ts if none are in the database yet.

import Card from "@/components/ui/Card";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { testimonials as defaultTestimonials } from "@/data/testimonials";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { cleanFeedbackMessage } from "@/lib/validation";

export default async function Testimonials() {
  let items = defaultTestimonials;

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("feedback")
      .select("id, name, service, message, rating")
      .eq("status", "approved")
      .gte("rating", 4)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error && data && data.length > 0) {
      items = data.map((d) => ({
        id: d.id,
        name: d.name,
        role: d.service
          ? `${d.service.charAt(0).toUpperCase() + d.service.slice(1)} Client`
          : "Verified Client",
        quote: cleanFeedbackMessage(d.message),
      }));
    }
  } catch {
    // If table doesn't exist yet, gracefully use default testimonials
  }

  return (
    <Section eyebrow="Kind Words" title="What Clients Say">
      <ul className="grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
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
