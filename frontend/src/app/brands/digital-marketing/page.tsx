import SivagangaiDigitalMarketingLanding from "@/components/brands/SivagangaiDigitalMarketingLanding";
import { subBrands } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

const brand = subBrands[2];

export const metadata = createMetadata({
  title: `${brand.name} | Performance Meta & Google Ads, Viral Video Reels & SEO`,
  description:
    "Leading digital marketing & growth agency in Sivagangai & Tamil Nadu. High-ROAS paid acquisition, commercial voiceover ads, viral reels, and organic SEO funnels.",
  path: "/brands/digital-marketing",
});

export default function DigitalMarketingPage() {
  return <SivagangaiDigitalMarketingLanding />;
}
