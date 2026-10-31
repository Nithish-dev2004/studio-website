// Full-width opening banner with a big photo, headline and two buttons.

import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/data/site";

const heroBlurDataURL =
  "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgQF/8QAJhAAAgIABAQHAAAAAAAAAAAAAQMCBAAFBhESExUhIkFSVWFxof/EABUBAQEAAAAAAAAAAAAAAAAAAAQF/8QAHhEAAQQBBQAAAAAAAAAAAAAAAQACAxFRBDFBYbH/2gAMAwEAAhEDEQA/AHC9Y5rYr54HWUqs1IsWutXUZloJAEuLbwkHfb7AwQ65qH2nNT8iEu/5iDK7lpOv+Smy5amNsCcITIjIRgCAR57HuMbc3tM5EtmST6jiPJpWPq+OzlNfECd8eL//2Q==";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85svh] sm:min-h-[90svh] items-center overflow-hidden">
      <Image
        src="/images/hero.jpg"
        alt="Sivagangai Stories - Wedding, portrait, and event photography"
        fill
        priority
        placeholder="blur"
        blurDataURL={heroBlurDataURL}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        className="object-cover object-[center_30%]"
      />
      {/* Dark overlay so the white text is easy to read */}
      <div
        className="absolute inset-0 bg-black/45 md:bg-gradient-to-r md:from-black/75 md:via-black/45 md:to-black/30"
        aria-hidden="true"
      />

      <Container className="text-on-image relative py-14 sm:py-20 md:py-24">
        <FadeIn className="max-w-2xl">
          <p className="mb-3 sm:mb-4 text-xs font-medium tracking-[0.25em] sm:tracking-[0.3em] uppercase">
            {siteConfig.tagline}
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight">
            Stories told in <span className="text-accent italic font-serif">light</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-lg text-sm sm:text-base md:text-lg leading-relaxed text-white/90">
            Wedding, portrait, product and event photography, crafted with care and a
            quiet eye for detail.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              href="/portfolio"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto text-center"
            >
              View Portfolio
            </Button>
            <Button
              href="/booking"
              variant="inverse"
              size="lg"
              className="w-full sm:w-auto text-center"
            >
              Book a Session
            </Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
