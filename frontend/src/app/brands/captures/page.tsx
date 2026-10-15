import SivagangaiCaptureLanding from "@/components/brands/SivagangaiCaptureLanding";
import { subBrands } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

const brand = subBrands[0];
export const metadata = createMetadata({
  title: "Sivagangai Capture | Visual Storytelling & Photography Studio",
  description: "Rooted in Chettinad heritage. Authentic wedding photography, cultural festivals, candid portraits, architecture, and signature Lightroom presets.",
  path: "/brands/captures",
});

export default function CapturesPage() {
  return <SivagangaiCaptureLanding />;
}
