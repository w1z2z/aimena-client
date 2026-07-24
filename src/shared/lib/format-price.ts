/** Thin grouping like `1000` → `1 000` (same idea as `toLocaleString("ru-RU")`). */
const PRICE_GROUP_SEPARATOR = "\u00A0";

export function formatPriceWithSpaces(rawDigits: string) {
  const digits = rawDigits.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, PRICE_GROUP_SEPARATOR);
}

export function extractPriceDigits(value: string) {
  return value.replace(/\D/g, "");
}
