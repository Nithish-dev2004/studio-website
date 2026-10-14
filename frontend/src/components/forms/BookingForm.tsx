"use client";

// Booking request form: validates in the browser (same zod rules as the server), sends to
// /api/booking, and shows a loading state, a success message or an error message.

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import FormField, { inputClass } from "@/components/forms/FormField";
import HoneypotField from "@/components/forms/HoneypotField";
import Button from "@/components/ui/Button";
import { services } from "@/data/services";
import { postJson } from "@/lib/api";
import { validateBooking } from "@/lib/validation";
import type { BookingFormData, FieldErrors } from "@/types";

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
        className="bg-card border-border rounded-lg border p-8 text-center"
      >
        <CheckCircle2 className="text-success mx-auto h-10 w-10" aria-hidden="true" />
        <h2 className="mt-4 text-3xl">Request received</h2>
        <p className="text-muted-foreground mt-2">{successMessage}</p>
        <Button variant="outline" className="mt-6" onClick={() => setSuccessMessage("")}>
          Make another booking
        </Button>
      </div>
    );
  }

  return (
    // noValidate turns off the browser's own pop-ups so our messages are shown instead.
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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
            className={inputClass}
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
            className={inputClass}
          />
        </FormField>
      </div>

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
          className={inputClass}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="booking-service" label="Service" error={errors.service}>
          <select
            id="booking-service"
            name="service"
            value={values.service}
            onChange={(event) => handleChange("service", event.target.value)}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? "booking-service-error" : undefined}
            className={inputClass}
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
            className={inputClass}
            // "today" can differ slightly between server and browser (timezones), which is harmless.
            suppressHydrationWarning
          />
        </FormField>
      </div>

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
          className={inputClass}
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
          className={inputClass}
        />
      </FormField>

      <HoneypotField
        idPrefix="booking"
        value={values.website}
        onChange={(value) => handleChange("website", value)}
      />

      {/* Error message from the server (or the network) */}
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
        className="w-full sm:w-auto"
      >
        {submitting ? "Sending..." : "Request Booking"}
      </Button>
    </form>
  );
}
