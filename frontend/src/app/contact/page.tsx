import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/forms/ContactForm";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}. Questions, quotes and collaborations are welcome.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="bg-background py-14 sm:py-20">
      <Container className="max-w-5xl">
        <header className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <p className="text-accent text-[10px] font-semibold tracking-[0.3em] uppercase">
            Contact
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Get in Touch</h1>
          <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
            Questions, quotes or just want to say hello? We would love to hear from you.
          </p>
          <div className="bg-accent mx-auto mt-5 h-px w-10" />
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_15.5rem] lg:gap-7">
          <ContactForm />

          <aside className="space-y-3 lg:sticky lg:top-24">
            <address className="bg-muted rounded-xl p-5 not-italic sm:p-6">
              <h2 className="text-2xl">Find us</h2>
              <div className="mt-5 space-y-5">
                <ContactDetail icon={MapPin} label="Studio">
                  {siteConfig.address}
                </ContactDetail>
                <ContactDetail icon={Phone} label="Phone">
                  <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                    {siteConfig.phone}
                  </a>
                </ContactDetail>
                <ContactDetail icon={Mail} label="Email">
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </ContactDetail>
                <ContactDetail icon={Clock} label="Opening hours">
                  {siteConfig.hours}
                </ContactDetail>
              </div>
            </address>

            <Link
              href="/booking"
              className="border-border bg-card hover:border-accent/50 group flex items-center justify-between rounded-xl border p-4 transition-colors"
            >
              <span>
                <span className="font-heading block text-base">
                  Ready to book a session?
                </span>
                <span className="text-muted-foreground mt-1 block text-[11px]">
                  Request a date in under a minute.
                </span>
              </span>
              <span className="text-accent text-lg transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function ContactDetail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="bg-card text-accent flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
        <Icon className="h-3 w-3" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-xs leading-4">
        <p className="text-foreground font-medium">{label}</p>
        <div className="text-muted-foreground [&_a:hover]:text-accent mt-0.5 break-words [&_a]:transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
}
