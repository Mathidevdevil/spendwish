"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailySpendItem } from "@/hooks/use-dashboard";
import { useCurrency } from "@/components/providers/currency-provider";
import { formatDate } from "@/lib/utils";

interface DailySpendBarChartProps {
  data: DailySpendItem[];
  isLoading?: boolean;
}

export default function DailySpendBarChart({
  data,
  isLoading,
}: DailySpendBarChartProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return <div className="h-[220px] w-full animate-pulse bg-muted/40 rounded-xl" />;
  }

  const formatYAxis = (val: number) => {
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-muted/40"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            interval={2}
            tick={{ fontSize: 10, fill: "currentColor", fontFamily: "var(--font-sans)" }}
            className="text-muted-foreground"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fill: "currentColor", fontFamily: "var(--font-sans)" }}
            className="text-muted-foreground num"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs">
                    <p className="text-muted-foreground text-[11px] mb-0.5">
                      {formatDate(item.date, "medium")}
                    </p>
                    <p className="font-bold text-foreground num">
                      {format(item.total_expense)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="total_expense"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
