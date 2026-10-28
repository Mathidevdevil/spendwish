"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SixMonthTrendItem } from "@/hooks/use-dashboard";
import { useCurrency } from "@/components/providers/currency-provider";

interface IncomeExpenseTrendChartProps {
  data: SixMonthTrendItem[];
  isLoading?: boolean;
}

export default function IncomeExpenseTrendChart({
  data,
  isLoading,
}: IncomeExpenseTrendChartProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return <div className="h-[280px] w-full animate-pulse bg-muted/40 rounded-xl" />;
  }

  const formatYAxis = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-muted/40"
          />
          <XAxis
            dataKey="month_label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const income = payload.find((p) => p.dataKey === "total_income")?.value || 0;
                const expense = payload.find((p) => p.dataKey === "total_expense")?.value || 0;
                return (
                  <div className="rounded-xl border border-border bg-popover p-3 shadow-md text-xs space-y-1">
                    <p className="font-semibold text-foreground mb-1">{label}</p>
                    <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                      <span>Income:</span>
                      <span className="font-bold">{format(Number(income))}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-rose-500">
                      <span>Expense:</span>
                      <span className="font-bold">{format(Number(expense))}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={32}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground font-medium capitalize">
                {value === "total_income" ? "Income" : "Expense"}
              </span>
            )}
          />
          <Bar
            dataKey="total_income"
            name="total_income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="total_expense"
            name="total_expense"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
