// Small helper functions used across the site.

/** Joins class names and skips empty values: cn("a", isActive && "b") -> "a b" */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Placeholder photo from picsum.photos. The same seed always gives the same photo. */
export function placeholderImage(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/** Builds a WhatsApp chat link. `number` = country code + number, digits only. */
export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
