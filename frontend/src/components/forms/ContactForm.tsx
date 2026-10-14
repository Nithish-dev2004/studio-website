"use client";

// Contact form: validates in the browser (same zod rules as the server), sends to
// /api/contact, and shows a loading state, a success message or an error message.

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import FormField, { inputClass } from "@/components/forms/FormField";
import HoneypotField from "@/components/forms/HoneypotField";
import Button from "@/components/ui/Button";
import { postJson } from "@/lib/api";
import { validateContact } from "@/lib/validation";
import type { ContactFormData, FieldErrors } from "@/types";

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
        className="bg-card border-border rounded-lg border p-8 text-center"
      >
        <CheckCircle2 className="text-success mx-auto h-10 w-10" aria-hidden="true" />
        <h2 className="mt-4 text-3xl">Message sent</h2>
        <p className="text-muted-foreground mt-2">{successMessage}</p>
        <Button variant="outline" className="mt-6" onClick={() => setSuccessMessage("")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    // noValidate turns off the browser's own pop-ups so our messages are shown instead.
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField id="contact-name" label="Your name" error={errors.name}>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => handleChange("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={inputClass}
        />
      </FormField>

      <FormField id="contact-email" label="Email" error={errors.email}>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={inputClass}
        />
      </FormField>

      <FormField id="contact-phone" label="Phone" optional error={errors.phone}>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          className={inputClass}
        />
      </FormField>

      <FormField id="contact-message" label="Message" error={errors.message}>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={inputClass}
        />
      </FormField>

      <HoneypotField
        idPrefix="contact"
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
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
