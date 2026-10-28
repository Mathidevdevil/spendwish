"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CategoryBreakdownItem } from "@/hooks/use-dashboard";
import { useCurrency } from "@/components/providers/currency-provider";

interface CategoryDonutChartProps {
  data: CategoryBreakdownItem[];
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  "#f97316",
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
  "#eab308",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#64748b",
];

export default function CategoryDonutChart({
  data,
  isLoading,
}: CategoryDonutChartProps) {
  const { format } = useCurrency();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => ({
      name: item.category_name,
      value: item.total_amount,
      color: item.category_color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      percentage: item.percentage,
    }));
  }, [data]);

  if (isLoading) {
    return <div className="h-[280px] w-full animate-pulse bg-muted/40 rounded-xl" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
        <p className="text-sm font-semibold text-muted-foreground">
          No expense categories recorded
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Add transactions this month to see category breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <div className="font-bold text-foreground">
                      {format(item.value)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.percentage}% of total expenses
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground font-medium">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
