"use client";

// Booking request form: validates in the browser (same zod rules as the server), sends to
// /api/booking, and shows a loading state, a success message or an error message.

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import FormField from "@/components/forms/FormField";
import HoneypotField from "@/components/forms/HoneypotField";
import Button from "@/components/ui/Button";
import { services } from "@/data/services";
import { postJson } from "@/lib/api";
import { validateBooking } from "@/lib/validation";
import type { BookingFormData, FieldErrors } from "@/types";

const bookingInputClass =
  "bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:border-accent w-full rounded-md border px-3 py-2.5 text-sm aria-[invalid=true]:border-destructive";

const emptyForm: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  service: "",
  date: "",
  location: "",
  message: "",
  website: "", // honeypot: stays empty for real visitors
};

export default function BookingForm() {
  const [values, setValues] = useState<BookingFormData>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<BookingFormData>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Today's date as YYYY-MM-DD, so the date picker can't select the past.
  const today = new Date().toLocaleDateString("en-CA");

  // Updates one field and clears its error as soon as the visitor starts fixing it.
  function handleChange(field: keyof BookingFormData, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    // 1) Check the form in the browser first (instant feedback).
    const result = validateBooking(values);
    if (!result.valid) {
      setErrors(result.errors);
      const firstInvalid = Object.keys(result.errors)[0];
      document.getElementById(`booking-${firstInvalid}`)?.focus();
      return;
    }

    // 2) Send it to the API route.
    setSubmitting(true);
    const response = await postJson<BookingFormData>("/api/booking", result.data);
    setSubmitting(false);

    if (response.ok) {
      setSuccessMessage(response.message);
      setValues(emptyForm);
    } else {
      setErrors(response.errors ?? {});
      setFormError(response.message);
    }
  }

  // After a successful send, replace the form with a friendly message.
  if (successMessage) {
    return (
      <div
        role="status"
        className="border-border bg-card  rounded-xl border px-6 py-10 text-center shadow-[0_16px_40px_rgb(26_26_26/0.08)] sm:px-10 sm:py-12"
      >
        <span className="bg-muted text-accent mx-auto flex h-10 w-10 items-center justify-center rounded-full">
          <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="text-accent mt-5 text-[9px] font-semibold tracking-[0.24em] uppercase">
          Thank you 
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Request received</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xs text-sm leading-5">
          {successMessage}
        </p>
        <div className="bg-accent mx-auto mt-5 h-px w-8" />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <Button size="md" onClick={() => setSuccessMessage("")}>
            Make another request
          </Button>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    // noValidate turns off the browser's own pop-ups so our messages are shown instead.
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-border bg-card rounded-xl border p-5 shadow-[0_12px_36px_rgb(26_26_26/0.04)] sm:p-7"
    >
      <section aria-labelledby="booking-about-heading">
        <p className="text-accent text-[10px] font-semibold tracking-[0.18em] uppercase">
          01
        </p>
        <h2 id="booking-about-heading" className="mt-1 text-2xl">
          About you
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField id="booking-name" label="Your name" error={errors.name}>
            <input
              id="booking-name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "booking-name-error" : undefined}
              className={bookingInputClass}
            />
          </FormField>

          <FormField id="booking-phone" label="Phone / WhatsApp" error={errors.phone}>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "booking-phone-error" : undefined}
              className={bookingInputClass}
            />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField id="booking-email" label="Email" error={errors.email}>
            <input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "booking-email-error" : undefined}
              className={bookingInputClass}
            />
          </FormField>
        </div>
      </section>

      <section
        aria-labelledby="booking-session-heading"
        className="border-border mt-7 border-t pt-7"
      >
        <p className="text-accent text-[10px] font-semibold tracking-[0.18em] uppercase">
          02
        </p>
        <h2 id="booking-session-heading" className="mt-1 text-2xl">
          Your session
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField id="booking-service" label="Service" error={errors.service}>
            <select
              id="booking-service"
              name="service"
              value={values.service}
              onChange={(event) => handleChange("service", event.target.value)}
              aria-invalid={Boolean(errors.service)}
              aria-describedby={errors.service ? "booking-service-error" : undefined}
              className={bookingInputClass}
            >
              <option value="">Choose a service...</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="booking-date" label="Preferred date" error={errors.date}>
            <input
              id="booking-date"
              name="date"
              type="date"
              min={today}
              value={values.date}
              onChange={(event) => handleChange("date", event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "booking-date-error" : undefined}
              className={bookingInputClass}
              // "today" can differ slightly between server and browser (timezones), which is harmless.
              suppressHydrationWarning
            />
          </FormField>
        </div>
        <p className="text-muted-foreground mt-2 text-[11px] sm:pl-[calc(50%+0.5rem)]">
          We will confirm availability for this date.
        </p>
      </section>

      <section
        aria-labelledby="booking-details-heading"
        className="border-border mt-7 border-t pt-7"
      >
        <p className="text-accent text-[10px] font-semibold tracking-[0.18em] uppercase">
          03
        </p>
        <h2 id="booking-details-heading" className="mt-1 text-2xl">
          The details
        </h2>
        <div className="mt-5 space-y-4">
          <FormField
            id="booking-location"
            label="Event location"
            optional
            error={errors.location}
          >
            <input
              id="booking-location"
              name="location"
              type="text"
              autoComplete="off"
              value={values.location}
              onChange={(event) => handleChange("location", event.target.value)}
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? "booking-location-error" : undefined}
              className={bookingInputClass}
            />
          </FormField>

          <FormField
            id="booking-message"
            label="Tell us more"
            optional
            error={errors.message}
          >
            <textarea
              id="booking-message"
              name="message"
              rows={4}
              value={values.message}
              onChange={(event) => handleChange("message", event.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "booking-message-error" : undefined}
              className={bookingInputClass}
            />
          </FormField>
        </div>
      </section>

      <HoneypotField
        idPrefix="booking"
        value={values.website}
        onChange={(value) => handleChange("website", value)}
      />

      {/* Error message from the server (or the network) */}
      <div className="border-border mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center">
        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        )}

        {/* Loading state: the button is disabled and shows "Sending..." while we wait. */}
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full sm:w-auto sm:shrink-0"
        >
          {submitting ? "Sending..." : "Request Booking"}
        </Button>
        <p className="text-muted-foreground text-[11px] leading-4 sm:order-first sm:flex-1">
          This is a request, not a confirmed booking. We will reply within one working
          day.
        </p>
      </div>
    </form>
  );
}
