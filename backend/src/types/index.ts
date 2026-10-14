// Types for the API requests and responses.
// KEEP IN SYNC with the "Forms and API" part of frontend/src/types/index.ts.

// `website` is the hidden "honeypot" field. Real visitors never see or fill it;
// spam bots often do. The server ignores any submission where it has text.

export type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string; // YYYY-MM-DD
  location: string; // optional (may be "")
  message: string; // optional (may be "")
  website: string; // honeypot
};

export type ContactFormData = {
  name: string;
  email: string;
  phone: string; // optional (may be "")
  message: string;
  website: string; // honeypot
};

/** One error message per field, e.g. { email: "Please enter a valid email." } */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Every API route answers with this shape. */
export type ApiResponse<T> =
  { ok: true; message: string } | { ok: false; message: string; errors?: FieldErrors<T> };
