import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { locale: string; symbol: string; label: string }
> = {
  INR: { locale: "en-IN", symbol: "₹", label: "Indian Rupee (₹)" },
  USD: { locale: "en-US", symbol: "$", label: "US Dollar ($)" },
  EUR: { locale: "en-IE", symbol: "€", label: "Euro (€)" },
  GBP: { locale: "en-GB", symbol: "£", label: "British Pound (£)" },
};

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: CurrencyCode = "INR",
  options?: { showFraction?: boolean }
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  if (isNaN(numericAmount)) return "₹0";

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  const showFraction =
    options?.showFraction ??
    (Math.abs(numericAmount % 1) > 0.001 ? true : false);

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: showFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    // Fallback Indian format
    const parts = numericAmount.toFixed(2).split(".");
    let intPart = parts[0];
    const isNegative = intPart.startsWith("-");
    if (isNegative) intPart = intPart.slice(1);

    const lastThree = intPart.slice(-3);
    const otherNumbers = intPart.slice(0, -3);
    const formattedInt =
      otherNumbers !== ""
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
        : lastThree;

    const result = `${config.symbol}${isNegative ? "-" : ""}${formattedInt}${
      showFraction ? "." + parts[1] : ""
    }`;
    return result;
  }
}

export function formatDate(
  dateString: string | Date | null | undefined,
  formatStyle: "short" | "medium" | "long" = "medium"
): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";

  if (formatStyle === "short") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  }

  if (formatStyle === "long") {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Validates and sanitizes a redirect path to prevent open-redirect vulnerabilities.
 * Only allows relative paths starting with a single '/' and rejects protocol-relative,
 * backslash-escaped, or absolute URLs.
 */
export function sanitizeRedirectPath(
  path?: string | null,
  fallback = "/dashboard"
): string {
  if (!path || typeof path !== "string") {
    return fallback;
  }

  const trimmed = path.trim();

  // Must start with '/' and must not start with '//' or contain '\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }

  // Reject newlines or control characters
  if (/[\r\n\0]/.test(trimmed)) {
    return fallback;
  }

  // Ensure it doesn't parse as an absolute URL with an external protocol
  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
