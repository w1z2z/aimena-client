export function formatPriceWithSpaces(rawDigits: string) {
  if (!rawDigits) return "";
  return rawDigits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function extractPriceDigits(value: string) {
  return value.replace(/\D/g, "");
}
