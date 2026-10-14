// Home page: sections appear in this order, top to bottom.

import CallToAction from "@/components/home/CallToAction";
import FeaturedWorks from "@/components/home/FeaturedWorks";
import Hero from "@/components/home/Hero";
import ServicesPreview from "@/components/home/ServicesPreview";
import Testimonials from "@/components/home/Testimonials";
import { siteConfig } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedWorks />
      <ServicesPreview />
      <Testimonials />
      <CallToAction />
    </>
  );
}
