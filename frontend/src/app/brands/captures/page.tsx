import SivagangaiCaptureLanding from "@/components/brands/SivagangaiCaptureLanding";
import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({
  title: "Sivagangai Capture | Visual Storytelling & Photography Studio",
  description: "Rooted in Chettinad heritage. Authentic wedding photography, cultural festivals, candid portraits, architecture, and signature Lightroom presets.",
  path: "/brands/captures",
});

export default function CapturesPage() {
  return <SivagangaiCaptureLanding />;
}
