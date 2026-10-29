"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { CategoryBreakdownItem } from "@/hooks/use-dashboard";
import { useCurrency } from "@/components/providers/currency-provider";
import { resolveCategoryMeta } from "@/lib/category-registry";
import { Money } from "@/components/ui/money";

interface CategoryDonutChartProps {
  data: CategoryBreakdownItem[];
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  "#34D399",
  "#22D3EE",
  "#F59E0B",
  "#FB7185",
  "#A855F7",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#64748B",
];

export default function CategoryDonutChart({
  data,
  isLoading,
}: CategoryDonutChartProps) {
  const { format } = useCurrency();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => {
      const meta = resolveCategoryMeta(item.category_name);
      return {
        name: item.category_name,
        value: item.total_amount,
        color: item.category_color || meta.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        percentage: item.percentage,
      };
    });
  }, [data]);

  const totalExpense = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (isLoading) {
    return <div className="h-[300px] w-full animate-pulse bg-surface-elevated/40 rounded-xl" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-center p-6">
        <div className="h-12 w-12 rounded-full bg-surface-elevated flex items-center justify-center mb-3 border border-border/80">
          <span className="text-xl">📊</span>
        </div>
        <p className="text-xs font-semibold text-foreground">
          No expense categories recorded
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
          Add transactions this month to see real-time distribution across categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Donut Container with Centered Total */}
      <div className="h-[210px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={86}
              paddingAngle={2.5}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  style={{
                    opacity:
                      activeIndex === null || activeIndex === index ? 1 : 0.45,
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border/80 bg-surface/95 backdrop-blur-md p-2.5 shadow-lg text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="font-bold font-sans tabular-nums text-foreground">
                        {format(item.value)}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-sans tabular-nums">
                        {item.percentage}% of total expenses
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Total Centered in Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Spent
          </span>
          <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-foreground tracking-tight">
            {format(totalExpense)}
          </span>
        </div>
      </div>

      {/* Interactive Legend with Category Color Dots & Percentages */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
        {chartData.slice(0, 6).map((item, idx) => (
          <div
            key={item.name}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
              activeIndex === idx
                ? "bg-surface-elevated border border-border/80"
                : "hover:bg-surface-elevated/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground truncate font-medium text-[11px]">
                {item.name}
              </span>
            </div>
            <div className="font-sans tabular-nums font-semibold text-foreground text-[11px] shrink-0 ml-1">
              {item.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
