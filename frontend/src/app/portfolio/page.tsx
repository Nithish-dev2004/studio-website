import PhotoGrid from "@/components/gallery/PhotoGrid";
import Section from "@/components/ui/Section";
import { portfolio } from "@/data/portfolio";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Portfolio",
  description: "Browse our wedding, portrait, product and event photography.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <Section
      asPageHeading
      eyebrow="Portfolio"
      title="Our Work"
      subtitle="A closer look at the stories we have had the joy of telling."
    >
      {/* TODO: add category filter buttons (Wedding, Portrait...) once you have real photos. */}
      <PhotoGrid items={portfolio} />
    </Section>
  );
}
