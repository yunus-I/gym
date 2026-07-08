import { format } from "date-fns";

/** Formats an amount as a localized ETB currency string, e.g. `1,000 ETB`. */
export function formatETB(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

/** Formats a date value using date-fns, defaulting to `MMM dd, yyyy`. */
export function formatDate(
  value: Date | string | number,
  pattern = "MMM dd, yyyy"
): string {
  return format(new Date(value), pattern);
}
