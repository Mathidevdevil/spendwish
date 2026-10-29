"use client";

import React from "react";
import { resolveCategoryMeta } from "@/lib/category-registry";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  categoryName?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}

export function CategoryIcon({
  categoryName,
  color,
  size = "md",
  className,
  iconClassName,
}: CategoryIconProps) {
  const meta = resolveCategoryMeta(categoryName, color);
  const IconComponent = meta.icon;

  const sizeClasses = {
    sm: "h-7 w-7 rounded-full text-xs",
    md: "h-9 w-9 rounded-full text-sm",
    lg: "h-11 w-11 rounded-full text-base",
  };

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 20,
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 transition-transform",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: meta.bgTint,
        color: meta.color,
      }}
      aria-hidden="true"
    >
      <IconComponent
        size={iconSizes[size]}
        strokeWidth={1.75}
        className={iconClassName}
      />
    </div>
  );
}

