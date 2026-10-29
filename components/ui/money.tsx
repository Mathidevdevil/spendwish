"use client";

import React from "react";
import { formatCurrency, CurrencyCode } from "@/lib/utils";
import { useCurrency } from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";

interface MoneyProps {
  amount: number | string | null | undefined;
  currency?: CurrencyCode;
  showSign?: boolean;
  type?: "income" | "expense" | "neutral" | "auto";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  showFraction?: boolean;
}

export function Money({
  amount,
  currency: explicitCurrency,
  showSign = false,
  type = "auto",
  size = "md",
  className,
  showFraction,
}: MoneyProps) {
  const context = useCurrency();
  const activeCurrency = explicitCurrency || context?.currency || "INR";

  const num = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  const isPositive = num > 0;
  const isNegative = num < 0;

  let colorClass = "text-foreground";
  if (type === "income" || (type === "auto" && isPositive && showSign)) {
    colorClass = "text-emerald-400 dark:text-emerald-400";
  } else if (type === "expense" || (type === "auto" && isNegative)) {
    colorClass = "text-rose-400 dark:text-rose-400";
  }

  const sizeClasses = {
    xs: "text-xs font-semibold",
    sm: "text-sm font-semibold",
    md: "text-base font-semibold",
    lg: "text-xl font-bold tracking-tight",
    xl: "text-2xl sm:text-3xl font-bold tracking-tight",
    hero: "text-4xl sm:text-5xl font-bold tracking-[-0.02em]",
  };

  const sign = showSign && isPositive ? "+" : "";
  const formatted = formatCurrency(Math.abs(num), activeCurrency, {
    showFraction,
  });

  return (
    <span
      className={cn(
        "num inline-flex items-baseline",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {isNegative ? "-" : sign}
      {formatted}
    </span>
  );
}

