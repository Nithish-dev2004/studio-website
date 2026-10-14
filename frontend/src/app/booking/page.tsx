import BookingForm from "@/components/forms/BookingForm";
import Section from "@/components/ui/Section";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Book a Session",
  description:
    "Request a photography session or studio booking. We reply within one working day.",
  path: "/booking",
});

export default function BookingPage() {
  return (
    <Section
      asPageHeading
      eyebrow="Booking"
      title="Book a Session"
      subtitle="Share a few details and we will confirm your booking within one working day."
    >
      <div className="mx-auto max-w-2xl">
        <BookingForm />
      </div>
    </Section>
  );
}
