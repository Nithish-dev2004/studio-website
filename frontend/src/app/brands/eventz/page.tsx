import SivagangaiEventsLanding from "@/components/brands/SivagangaiEventsLanding";
import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({
  title: "Sivagangai Events | Royal Weddings & Luxury Event Management",
  description: "Curating extraordinary celebrations, Chettinad royal mandaps, sangeet party production, corporate galas, and bespoke event management.",
  path: "/brands/eventz",
});

export default function EventzPage() {
  return <SivagangaiEventsLanding />;
}
