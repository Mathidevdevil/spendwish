"use client";

import { useEffect, useState } from "react";
import { formatCurrency, CurrencyCode } from "@/lib/utils";
import { useCurrency } from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  currency?: CurrencyCode;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  durationMs = 800,
  currency,
  isCurrency = true,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const { currency: contextCurrency } = useCurrency();
  const activeCurrency = currency || contextCurrency || "INR";

  useEffect(() => {
    // Check prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  const formatted = isCurrency
    ? formatCurrency(displayValue, activeCurrency)
    : displayValue.toLocaleString("en-IN");

  return (
    <span className={cn("num", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

