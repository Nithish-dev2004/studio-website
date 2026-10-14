// Full-width opening banner with a big photo, headline and two buttons.

import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/data/site";
import { placeholderImage } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      {/* TODO: replace with your best photo (put it in /public/images and use "/images/hero.jpg"). */}
      <Image
        src={placeholderImage("hero-photo", 1600, 1000)}
        alt="Placeholder hero photo: a photographer's best work goes here"
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      {/* Dark overlay so the white text is easy to read */}
      <div className="bg-scrim absolute inset-0" aria-hidden="true" />

      <Container className="text-on-image relative py-24">
        <FadeIn className="max-w-2xl">
          <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase">
            {siteConfig.tagline}
          </p>
          <h1 className="text-5xl leading-tight md:text-7xl">
            Stories told in <span className="text-accent italic">light</span>
          </h1>
          <p className="mt-6 max-w-lg text-base md:text-lg">
            Wedding, portrait, product and event photography, crafted with care and a
            quiet eye for detail.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/portfolio" variant="accent" size="lg">
              View Portfolio
            </Button>
            <Button href="/booking" variant="inverse" size="lg">
              Book a Session
            </Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
