"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number | string;
  height?: number;
  color?: string; // hex e.g. #34D399 or #FB7185
  gradientId?: string;
  className?: string;
  showFill?: boolean;
}

export function Sparkline({
  data,
  width = "100%",
  height = 36,
  color = "#34D399",
  className,
  showFill = true,
}: SparklineProps) {
  const generatedId = useId().replace(/:/g, "");
  const id = `sparkline-${generatedId}`;

  if (!data || data.length < 2) {
    return (
      <div
        className={cn("h-9 flex items-center justify-center opacity-30", className)}
        style={{ height }}
      >
        <div className="h-0.5 w-full bg-border" />
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80 - 10; // 10% padding top and bottom
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L 100,100 L 0,100 Z`;

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        style={{ width }}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {showFill && <path d={areaPath} fill={`url(#${id})`} />}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

