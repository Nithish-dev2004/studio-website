// Final banner at the bottom of the home page that nudges visitors to book.

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";

export default function CallToAction() {
  return (
    <section className="bg-primary text-primary-foreground py-section">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl">Let&apos;s create something beautiful</h2>
          <p className="mt-4 opacity-80">
            Tell us about your day, your product or your idea. We&apos;ll get back to you
            within one working day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/booking" variant="accent" size="lg">
              Book a Session
            </Button>
            <Button href="/contact" variant="inverse" size="lg">
              Get in Touch
            </Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
