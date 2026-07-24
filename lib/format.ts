/**
 * Nigeria-specific formatting helpers for RopeProperties.
 */

/**
 * Format a price in NGN with full digit grouping.
 * @example formatPrice(450000000) → "₦450,000,000"
 */
export function formatPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * Format a price compactly for cards.
 * @example formatPriceCompact(450000000) → "₦450M"
 * @example formatPriceCompact(1200000000) → "₦1.2B"
 * @example formatPriceCompact(85000000) → "₦85M"
 */
export function formatPriceCompact(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) {
    const b = n / 1_000_000_000;
    return `₦${b % 1 === 0 ? b.toFixed(0) : b.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `₦${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `₦${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * Format a price with its period (total vs per_year).
 * @example formatPriceWithPeriod(12000000, "per_year") → "₦12,000,000/year"
 */
export function formatPriceWithPeriod(
  n: number | null | undefined,
  period: "total" | "per_year" = "total"
): string {
  const formatted = formatPrice(n);
  return period === "per_year" ? `${formatted}/year` : formatted;
}

/**
 * Format a compact price with its period.
 * @example formatPriceCompactWithPeriod(12000000, "per_year") → "₦12M/year"
 */
export function formatPriceCompactWithPeriod(
  n: number | null | undefined,
  period: "total" | "per_year" = "total"
): string {
  const formatted = formatPriceCompact(n);
  return period === "per_year" ? `${formatted}/year` : formatted;
}

/**
 * Format a phone number for display.
 * @example formatPhoneDisplay("08031234567") → "+234 803 123 4567"
 */
export function formatPhoneDisplay(phone: string): string {
  // Strip non-digits
  let digits = phone.replace(/\D/g, "");

  // Convert leading 0 to +234
  if (digits.startsWith("0")) {
    digits = "234" + digits.slice(1);
  }
  // If already starts with 234, keep as is
  if (digits.startsWith("234") && digits.length === 13) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  // Fallback: just return as-is with + prefix
  return phone;
}

/**
 * Convert a phone number to WhatsApp format (digits only, with country code).
 * @example toWhatsAppNumber("08031234567") → "2348031234567"
 */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "234" + digits.slice(1);
  }
  if (!digits.startsWith("234") && digits.length === 11) {
    digits = "234" + digits.slice(1);
  }
  return digits;
}

/**
 * Build a WhatsApp deep link with a pre-filled message.
 */
export function whatsappLink(phone: string, message: string): string {
  const num = toWhatsAppNumber(phone);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/**
 * Format an area in m².
 * @example formatArea(180) → "180 m²"
 */
export function formatArea(sqm: number | null | undefined): string {
  if (sqm == null) return "—";
  return `${sqm} m²`;
}

/**
 * Generate a URL-friendly slug from a title.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}