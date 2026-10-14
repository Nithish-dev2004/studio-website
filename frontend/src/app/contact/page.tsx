import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}. Questions, quotes and collaborations are welcome.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Section
      asPageHeading
      eyebrow="Contact"
      title="Get in Touch"
      subtitle="Questions, quotes or just want to say hello? We would love to hear from you."
    >
      <div className="grid gap-12 md:grid-cols-2">
        <ContactForm />

        <address className="space-y-6 not-italic">
          <div className="flex gap-4">
            <MapPin className="text-accent mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Studio</p>
              <p className="text-muted-foreground">{siteConfig.address}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="text-accent mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Phone</p>
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="text-muted-foreground hover:text-accent"
              >
                {siteConfig.phone}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="text-accent mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Email</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-muted-foreground hover:text-accent"
              >
                {siteConfig.email}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Clock className="text-accent mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Opening hours</p>
              <p className="text-muted-foreground">{siteConfig.hours}</p>
            </div>
          </div>
          {/* TODO: add an embedded Google Map of the studio here. */}
        </address>
      </div>
    </Section>
  );
}
