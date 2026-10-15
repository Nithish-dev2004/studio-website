// Form validation with zod, shared by the browser forms (instant feedback)
// and the API routes (the real safety check).
// Never trust the browser alone: anyone can call the API directly.

import { z } from "zod";
import { services } from "@/data/services";
import type {
  BookingFormData,
  ContactFormData,
  EventConsultationFormData,
  DigitalBookingFormData,
  SignboardBookingFormData,
  FieldErrors,
} from "@/types";

const MAX_MESSAGE_LENGTH = 1000;

// ---- Reusable field rules ----

// .trim() removes spaces at the start and end before checking.
const nameField = z
  .string()
  .trim()
  .min(2, "Please enter your name.")
  .max(100, "Please keep your name under 100 characters.");

const emailField = z
  .string()
  .trim()
  .max(254, "Please enter a valid email address.")
  .pipe(z.email("Please enter a valid email address."));

const phoneDigitsOk = (value: string) => {
  const digits = value.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
};

// Required phone number (booking form).
const requiredPhoneField = z
  .string()
  .trim()
  .max(30, "Please enter a valid phone number.")
  .refine(phoneDigitsOk, "Please enter a valid phone number.");

// Optional phone number (contact form): empty is fine, but if filled it must look right.
const optionalPhoneField = z
  .string()
  .trim()
  .max(30, "Please enter a valid phone number.")
  .refine(
    (value) => value === "" || phoneDigitsOk(value),
    "Please enter a valid phone number.",
  )
  // Optional means a client may leave the field out completely (e.g. the future mobile app).
  .default("");

// Accepts YYYY-MM-DD and rejects dates in the past (one day of timezone tolerance).
const dateField = z
  .string()
  .trim()
  .refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;
    // Reject impossible dates such as 2027-02-31 (JS would silently roll them over).
    if (date.toISOString().slice(0, 10) !== value) return false;
    return date.getTime() >= Date.now() - 24 * 60 * 60 * 1000;
  }, "Please choose a date that is today or later.");

// The service must be one of the slugs in data/services.ts.
const serviceField = z
  .string()
  .trim()
  .refine(
    (value) => services.some((service) => service.slug === value),
    "Please choose a service.",
  );

// The honeypot field. Any text is "valid" here; the API route checks it separately.
const honeypotField = z.string().max(500).optional().default("");

// ---- The two schemas ----

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: optionalPhoneField,
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(
      MAX_MESSAGE_LENGTH,
      `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
    ),
  website: honeypotField,
});

export const bookingSchema = z.object({
  name: nameField,
  email: emailField,
  phone: requiredPhoneField,
  service: serviceField,
  date: dateField,
  // location and message are optional: if a client leaves them out they become "".
  location: z
    .string()
    .trim()
    .max(200, "Please keep the location under 200 characters.")
    .default(""),
  message: z
    .string()
    .trim()
    .max(
      MAX_MESSAGE_LENGTH,
      `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
    )
    .default(""),
  website: honeypotField,
});

// ---- Helper that turns zod's result into something simple for forms and routes ----

type ValidationResult<T> =
  | { valid: true; errors: FieldErrors<T>; data: T }
  | { valid: false; errors: FieldErrors<T>; data?: undefined };

function parseForm<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { valid: true, errors: {}, data: result.data };

  // Keep only the first error message for each field.
  const errors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field as keyof T]) {
      errors[field as keyof T] = issue.message;
    }
  }
  return { valid: false, errors };
}

export function validateContact(input: unknown) {
  return parseForm<ContactFormData>(contactSchema, input);
}

export function validateBooking(input: unknown) {
  return parseForm<BookingFormData>(bookingSchema, input);
}

export const digitalBookingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Please enter your company or business name.")
    .max(150, "Please keep company name under 150 characters."),
  phone: requiredPhoneField,
  email: z
    .string()
    .trim()
    .max(254, "Please enter a valid email address.")
    .pipe(z.email("Please enter a valid email address."))
    .or(z.literal(""))
    .optional()
    .default(""),
  serviceInterested: z
    .string()
    .trim()
    .max(150)
    .optional()
    .default("Meta & Google Paid Ads"),
  budget: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("₹15,000 - ₹30,000 / mo"),
  websiteUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default(""),
  plan: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("Free Marketing Audit"),
  website: honeypotField,
});

export function validateDigitalBooking(input: unknown) {
  return parseForm<DigitalBookingFormData>(digitalBookingSchema, input);
}

export const signboardBookingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Please enter your business or store name.")
    .max(150, "Please keep business name under 150 characters."),
  phone: requiredPhoneField,
  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("Sivagangai"),
  signType: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("3D LED Acrylic Letters"),
  dimensions: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("10 ft x 3 ft"),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default(""),
  website: honeypotField,
});

export function validateSignboardBooking(input: unknown) {
  return parseForm<SignboardBookingFormData>(signboardBookingSchema, input);
}
