// Floating WhatsApp chat button, shown on every page.
// The number and the pre-filled message come from data/site.ts.

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";
import { whatsappLink } from "@/lib/utils";

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink(siteConfig.whatsappNumber, siteConfig.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="bg-whatsapp text-on-image fixed right-4 bottom-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
