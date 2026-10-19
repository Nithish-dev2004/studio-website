import BookingForm from "@/components/forms/BookingForm";
import Container from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Book a Session",
  description:
    "Request a photography session or studio booking. We reply within one working day.",
  path: "/booking",
});

export default function BookingPage() {
  return (
    <section className="bg-background py-14 sm:py-20">
      <Container className="max-w-5xl">
        <header className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <p className="text-accent text-[10px] font-semibold tracking-[0.3em] uppercase">
            Booking
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Book a Session</h1>
          <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
            Share a few details and we will confirm your booking within one working day.
          </p>
          <div className="bg-accent mx-auto mt-5 h-px w-10" />
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_15.5rem] lg:gap-7">
          <BookingForm />

          <aside className="space-y-3 lg:sticky lg:top-24">
            <div className="bg-muted rounded-xl p-5 sm:p-6">
              <p className="text-accent text-[9px] font-semibold tracking-[0.2em] uppercase">
                Reply within 1 working day
              </p>
              <h2 className="mt-3 text-2xl">What happens next</h2>
              <ol className="mt-5 space-y-4">
                <li className="flex gap-3">
                  <span className="bg-foreground text-background flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                    1
                  </span>
                  <p className="text-muted-foreground text-xs leading-4">
                    <strong className="text-foreground block font-medium">
                      Send your request
                    </strong>
                    Tell us the service, date and where it will take place.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="border-border bg-card flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold">
                    2
                  </span>
                  <p className="text-muted-foreground text-xs leading-4">
                    <strong className="text-foreground block font-medium">
                      We confirm availability
                    </strong>
                    You will hear back by phone, WhatsApp or email.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="border-border bg-card flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold">
                    3
                  </span>
                  <p className="text-muted-foreground text-xs leading-4">
                    <strong className="text-foreground block font-medium">
                      Your session is set
                    </strong>
                    Once confirmed, we share the final details with you.
                  </p>
                </li>
              </ol>
            </div>

            <div className="border-border bg-card rounded-xl border p-4">
              <p className="text-foreground text-xs font-medium">Prefer to chat?</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-4">
                WhatsApp us at your convenience.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
