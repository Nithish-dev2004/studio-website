"use client";

import React, { useState } from "react";
import { CheckCircle2, MessageSquarePlus } from "lucide-react";
import StarRating from "./StarRating";
import FormField, { inputClass } from "@/components/forms/FormField";
import HoneypotField from "@/components/forms/HoneypotField";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { postJson } from "@/lib/api";
import { validateFeedback } from "@/lib/validation";
import type { FeedbackFormData, FeedbackService, FieldErrors } from "@/types";

const emptyForm: FeedbackFormData = {
  name: "",
  email: "",
  rating: 5,
  service: "",
  message: "",
  website: "",
};

const serviceOptions: { value: FeedbackService | ""; label: string }[] = [
  { value: "", label: "Select a service (optional)" },
  { value: "wedding", label: "Wedding Photography" },
  { value: "portrait", label: "Portrait Session" },
  { value: "product", label: "Product & Commercial" },
  { value: "events", label: "Events & Celebrations" },
  { value: "studio rental", label: "Studio Rental" },
  { value: "other", label: "Other / General" },
];

export default function FeedbackForm() {
  const [values, setValues] = useState<FeedbackFormData>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<FeedbackFormData>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field: keyof FeedbackFormData, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    // 1. Client-side instant validation
    const result = validateFeedback(values);
    if (!result.valid) {
      setErrors(result.errors);
      const firstInvalid = Object.keys(result.errors)[0];
      const targetElem = document.getElementById(`feedback-${firstInvalid}`);
      if (targetElem) {
        targetElem.focus();
      }
      return;
    }

    // 2. Submit to API route
    setSubmitting(true);
    const response = await postJson<FeedbackFormData>("/api/feedback", result.data);
    setSubmitting(false);

    if (response.ok) {
      setSuccessMessage(response.message || "Thank you! Your feedback will appear after review.");
      setValues(emptyForm);
    } else {
      setErrors(response.errors ?? {});
      setFormError(response.message || "Failed to submit feedback. Please try again.");
    }
  };

  if (successMessage) {
    return (
      <Card className="border-border bg-card p-8 text-center shadow-xs">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
        <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">Feedback Received!</h3>
        <p className="mt-2 text-sm text-muted-foreground">{successMessage}</p>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setSuccessMessage("");
              setValues(emptyForm);
            }}
          >
            Leave Another Review
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card p-6 sm:p-8 shadow-xs">
      <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Share Your Experience</h2>
          <p className="text-xs text-muted-foreground">
            We value your thoughts and use them to make every session even better.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Rating Field */}
        <div>
          <label id="feedback-rating-label" className="mb-1.5 block text-sm font-medium text-foreground">
            Your Rating <span className="text-destructive">*</span>
          </label>
          <StarRating
            id="feedback-rating"
            value={values.rating}
            onChange={(r) => handleChange("rating", r)}
            size="lg"
          />
          {errors.rating && (
            <p id="feedback-rating-error" className="text-destructive mt-1.5 text-sm">
              {errors.rating}
            </p>
          )}
        </div>

        {/* Name Field */}
        <FormField id="feedback-name" label="Your Name" error={errors.name}>
          <input
            id="feedback-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Ananya Ramesh"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "feedback-name-error" : undefined}
            className={inputClass}
          />
        </FormField>

        {/* Email Field (Optional, with privacy assurance note) */}
        <FormField id="feedback-email" label="Email Address" optional error={errors.email}>
          <input
            id="feedback-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. ananya@example.com"
            value={values.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "feedback-email-error" : "feedback-email-hint"}
            className={inputClass}
          />
          <p id="feedback-email-hint" className="mt-1 text-xs text-muted-foreground">
            Your email is kept completely private and will never be shown publicly.
          </p>
        </FormField>

        {/* Service Field (Dropdown) */}
        <FormField id="feedback-service" label="Service Received" optional error={errors.service}>
          <select
            id="feedback-service"
            name="service"
            value={values.service || ""}
            onChange={(e) => handleChange("service", e.target.value as FeedbackService | "")}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? "feedback-service-error" : undefined}
            className={inputClass}
          >
            {serviceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Message Field with Live Character Counter */}
        <FormField id="feedback-message" label="Your Feedback" error={errors.message}>
          <div className="relative">
            <textarea
              id="feedback-message"
              name="message"
              rows={4}
              maxLength={1000}
              placeholder="Tell us what you loved, how your shoot went, or anything we can do better..."
              value={values.message}
              onChange={(e) => handleChange("message", e.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "feedback-message-error" : undefined}
              className={inputClass}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Minimum 10 characters</span>
              <span className={values.message.length >= 950 ? "text-amber-500 font-semibold" : ""}>
                {values.message.length} / 1000
              </span>
            </div>
          </div>
        </FormField>

        {/* Hidden Honeypot Field */}
        <HoneypotField
          idPrefix="feedback"
          value={values.website || ""}
          onChange={(v) => handleChange("website", v)}
        />

        {/* Global Error Banner */}
        {formError && (
          <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Card>
  );
}
