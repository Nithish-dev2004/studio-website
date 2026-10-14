import Image from "next/image";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { createMetadata } from "@/lib/metadata";
import { placeholderImage } from "@/lib/utils";

export const metadata = createMetadata({
  title: "About",
  description: `Meet the photographer behind ${siteConfig.name} and learn how we work.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <Section asPageHeading eyebrow="About" title={`The story behind ${siteConfig.name}`}>
      <FadeIn className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-lg">
          {/* TODO: replace with a photo of the photographer or the studio. */}
          <Image
            src={placeholderImage("about-photographer", 800, 1000)}
            alt="Placeholder portrait of the photographer"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-4">
          {/* TODO: replace this sample text with your own story. */}
          <p className="text-lg">
            Hello, we are {siteConfig.name}, a photography studio built around honest,
            unhurried storytelling.
          </p>
          <p className="text-muted-foreground">
            We believe the best photographs come from comfort and trust. Whether it is a
            wedding, a family portrait or a product launch, we take the time to understand
            what matters to you, then capture it in natural light with a calm, minimal
            style.
          </p>
          <p className="text-muted-foreground">
            Our studio is open for sessions and for rent by the hour, with lighting,
            backdrops and props ready for your next idea.
          </p>
          <div className="pt-3">
            <Button href="/contact">Say Hello</Button>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
