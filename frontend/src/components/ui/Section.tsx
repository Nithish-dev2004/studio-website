// A page section with consistent vertical spacing and an optional heading block.

import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  /** Small gold label above the title, e.g. "Our Work" */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** "muted" gives the section a soft background to separate it from its neighbours. */
  tone?: "default" | "muted";
  /** Render the title as the page's main <h1> (use once per page). */
  asPageHeading?: boolean;
  className?: string;
};

export default function Section({
  children,
  eyebrow,
  title,
  subtitle,
  tone = "default",
  asPageHeading = false,
  className,
}: SectionProps) {
  const Heading = asPageHeading ? "h1" : "h2";

  return (
    <section className={cn("py-section", tone === "muted" && "bg-muted", className)}>
      <Container>
        {(title || subtitle || eyebrow) && (
          <FadeIn className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
            {eyebrow && (
              <p className="text-accent mb-3 text-xs font-medium tracking-[0.25em] uppercase">
                {eyebrow}
              </p>
            )}
            {title && <Heading className="text-4xl md:text-5xl">{title}</Heading>}
            {subtitle && (
              <p className="text-muted-foreground mt-4 text-base md:text-lg">
                {subtitle}
              </p>
            )}
          </FadeIn>
        )}
        {children}
      </Container>
    </section>
  );
}
