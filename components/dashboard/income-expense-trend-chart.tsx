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
import { Money } from "@/components/ui/money";

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
    return <div className="h-[280px] w-full animate-pulse bg-surface-elevated/40 rounded-xl" />;
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
          margin={{ top: 12, right: 10, left: -16, bottom: 0 }}
          barGap={6}
        >
          <defs>
            <linearGradient id="incomeTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#34D399" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="expenseTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB7185" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#FB7185" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-border/40"
          />

          <XAxis
            dataKey="month_label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground font-medium"
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground font-sans tabular-nums"
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const income = payload.find((p) => p.dataKey === "total_income")?.value || 0;
                const expense = payload.find((p) => p.dataKey === "total_expense")?.value || 0;
                const net = Number(income) - Number(expense);

                return (
                  <div className="rounded-xl border border-border/80 bg-surface/95 backdrop-blur-md p-3 shadow-lg text-xs space-y-1.5 min-w-[150px]">
                    <p className="font-semibold text-foreground text-xs">{label}</p>
                    <div className="flex items-center justify-between gap-4 text-emerald-400">
                      <span className="text-[11px] text-muted-foreground">Inflow:</span>
                      <span className="font-bold font-sans tabular-nums">{format(Number(income))}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-rose-400">
                      <span className="text-[11px] text-muted-foreground">Outflow:</span>
                      <span className="font-bold font-sans tabular-nums">{format(Number(expense))}</span>
                    </div>
                    <div className="pt-1 border-t border-border/50 flex items-center justify-between gap-4">
                      <span className="text-[11px] text-muted-foreground">Net:</span>
                      <span className={`font-bold font-sans tabular-nums ${net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {net >= 0 ? "+" : ""}{format(net)}
                      </span>
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
              <span className="text-[11px] text-muted-foreground font-medium capitalize">
                {value === "total_income" ? "Inflows" : "Outflows"}
              </span>
            )}
          />

          <Bar
            dataKey="total_income"
            name="total_income"
            fill="url(#incomeTrendGrad)"
            radius={[6, 6, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="total_expense"
            name="total_expense"
            fill="url(#expenseTrendGrad)"
            radius={[6, 6, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
