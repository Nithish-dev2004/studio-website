// Client-safe link formatting helpers for phone calls and WhatsApp chats.
// Does NOT import any server-only modules so it can safely be used in Client Components.

/**
 * Formats a phone number for a WhatsApp link (wa.me).
 * Removes non-digits and ensures a 91 country code if 10 digits (standard Indian mobile).
 */
export function formatWhatsAppLink(phone: string, defaultMessage?: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "#";

  // If 10 digits (standard Indian mobile), prepend 91
  const fullNumber = digits.length === 10 ? `91${digits}` : digits;
  const baseUrl = `https://wa.me/${fullNumber}`;
  if (defaultMessage) {
    return `${baseUrl}?text=${encodeURIComponent(defaultMessage)}`;
  }
  return baseUrl;
}

/**
 * Formats a phone number for a tel: link.
 */
export function formatTelLink(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}
