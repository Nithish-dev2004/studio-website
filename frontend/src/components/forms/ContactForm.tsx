"use client";

// Contact form: validates in the browser (same zod rules as the server), sends to
// /api/contact, and shows a loading state, a success message or an error message.

import { useState } from "react";
import { ArrowRight, Check, Mail, Phone, UserRound } from "lucide-react";
import FormField from "@/components/forms/FormField";
import HoneypotField from "@/components/forms/HoneypotField";
import Button from "@/components/ui/Button";
import { postJson } from "@/lib/api";
import { validateContact } from "@/lib/validation";
import type { ContactFormData, FieldErrors } from "@/types";

const contactInputClass =
  "bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:border-accent w-full min-h-[44px] rounded-lg border py-2.5 pr-3 pl-9 text-base sm:text-sm transition-colors aria-[invalid=true]:border-destructive";

const emptyForm: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "", // honeypot: stays empty for real visitors
};

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormData>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<ContactFormData>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Updates one field and clears its error as soon as the visitor starts fixing it.
  function handleChange(field: keyof ContactFormData, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    // 1) Check the form in the browser first (instant feedback).
    const result = validateContact(values);
    if (!result.valid) {
      setErrors(result.errors);
      const firstInvalid = Object.keys(result.errors)[0];
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    // 2) Send it to the API route.
    setSubmitting(true);
    const response = await postJson<ContactFormData>("/api/contact", result.data);
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
        className="border-border bg-card rounded-2xl border px-6 py-10 text-center shadow-md sm:px-10 sm:py-12 transition-colors"
      >
        <span className="bg-muted text-accent mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <Check className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-accent mt-5 text-[10px] font-semibold tracking-[0.24em] uppercase">
          Thank you
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-heading text-foreground">Message sent</h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          {successMessage}
        </p>
        <div className="bg-accent/40 mx-auto mt-5 h-px w-10" />
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => setSuccessMessage("")}
          >
            Send another message
          </Button>
          <Button href="/booking" size="md" className="w-full sm:w-auto">
            Book a session &rarr;
          </Button>
        </div>
      </div>
    );
  }

  return (
    // noValidate turns off the browser's own pop-ups so our messages are shown instead.
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-border bg-card rounded-2xl border p-5 sm:p-7 shadow-xs transition-colors"
    >
      <h2 className="text-2xl font-heading text-foreground">Send us a message</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="contact-name" label="Your name" error={errors.name}>
          <div className="relative">
            <UserRound
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Full name"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className={contactInputClass}
            />
          </div>
        </FormField>

        <FormField id="contact-email" label="Email" error={errors.email}>
          <div className="relative">
            <Mail
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              className={contactInputClass}
            />
          </div>
        </FormField>
      </div>

      <div className="mt-4">
        <FormField id="contact-phone" label="Phone" optional error={errors.phone}>
          <div className="relative">
            <Phone
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={values.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "contact-phone-error" : undefined}
              className={contactInputClass}
            />
          </div>
        </FormField>
      </div>

      <div className="mt-4">
        <FormField id="contact-message" label="Message" error={errors.message}>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={values.message}
            onChange={(event) => handleChange("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            placeholder="How can we help?"
            className="bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:border-accent aria-[invalid=true]:border-destructive min-h-28 w-full resize-y rounded-lg border px-3 py-2.5 text-base sm:text-sm transition-colors"
          />
        </FormField>
      </div>

      <HoneypotField
        idPrefix="contact"
        value={values.website}
        onChange={(value) => handleChange("website", value)}
      />

      {/* Error message from the server (or the network) */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {formError && (
          <p role="alert" className="text-destructive text-sm font-medium">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full sm:w-auto sm:shrink-0"
        >
          {submitting ? (
            "Sending..."
          ) : (
            <>
              Send Message <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed sm:order-first sm:flex-1">
          We read every message and reply as soon as we can.
        </p>
      </div>
    </form>
  );
}
