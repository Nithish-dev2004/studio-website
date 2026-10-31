"use client";

// Floating WhatsApp chat button, shown on public pages.
// Accommodates mobile notches and safe areas (env(safe-area-inset-*))

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";
import { whatsappLink } from "@/lib/utils";

export default function WhatsAppButton() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/account")) {
    return null;
  }

  return (
    <a
      href={whatsappLink(siteConfig.whatsappNumber, siteConfig.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="bg-whatsapp text-white fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
    </a>
  );
}
