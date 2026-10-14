// The services a visitor may choose when booking. The backend only needs the slugs, to check
// that a booking names a real service.
//
// KEEP IN SYNC with frontend/src/data/services.ts: when you add or rename a service there,
// add or rename its slug here too.

export const services = [
  { slug: "wedding" },
  { slug: "portrait" },
  { slug: "product" },
  { slug: "events" },
  { slug: "studio-rental" },
];
