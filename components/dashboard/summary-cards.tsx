"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MonthlySummary } from "@/hooks/use-dashboard";
import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  summary: MonthlySummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const isSavingsPositive = summary.net_savings >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Income */}
      <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Income
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {format(summary.total_income)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-muted-foreground font-medium">
            <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
            <span>Monthly Credits</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Expense */}
      <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Expense
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-rose-500">
            {format(summary.total_expense)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-muted-foreground font-medium">
            <TrendingDown className="h-3 w-3 mr-1 text-rose-500" />
            <span>Outflows & Spends</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Net Savings */}
      <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Net Savings
            </span>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isSavingsPositive
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-xl sm:text-2xl font-bold tracking-tight ${
              isSavingsPositive
                ? "text-primary"
                : "text-destructive"
            }`}
          >
            {format(summary.net_savings)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">
            {isSavingsPositive ? "Retained Surplus" : "Deficit (Overspent)"}
          </div>
        </CardContent>
      </Card>

      {/* 4. Savings Rate */}
      <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Savings Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {summary.savings_rate.toFixed(1)}%
          </div>
          <div className="mt-2">
            <Progress
              value={Math.max(0, Math.min(100, summary.savings_rate))}
              className="h-1.5"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
