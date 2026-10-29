"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0 to 100
  target?: number; // target tick percentage (e.g. 20)
  size?: number; // diameter in px
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  target = 20,
  size = 110,
  strokeWidth = 9,
  className,
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Target tick angle in degrees (starting from top = -90deg)
  const targetAngle = (target / 100) * 360 - 90;
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetX = size / 2 + (radius + strokeWidth * 0.1) * Math.cos(targetRad);
  const targetY = size / 2 + (radius + strokeWidth * 0.1) * Math.sin(targetRad);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border/40"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className={cn(
            "transition-all duration-700 ease-out",
            clamped >= target
              ? "text-emerald-400"
              : "text-amber-400"
          )}
        />
      </svg>

      {/* Target tick marker */}
      {target > 0 && (
        <div
          className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: targetX, top: targetY }}
          title={`Target threshold: ${target}%`}
        />
      )}

      {/* Center label / content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {children || (
          <span className="text-xl font-bold font-sans tabular-nums text-foreground">
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  );
}
