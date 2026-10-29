"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-surface border border-border/80 text-muted-foreground",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 font-medium transition-all rounded-lg select-none",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm",
              isSelected
                ? "bg-surface-elevated text-foreground font-semibold shadow-xs border border-border/80"
                : "hover:text-foreground text-muted-foreground/90"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
