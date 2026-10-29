"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Minus,
  Percent,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MonthlySummary, SixMonthTrendItem } from "@/hooks/use-dashboard";
import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SummaryCardsProps {
  summary: MonthlySummary;
  trend?: SixMonthTrendItem[];
  isLoading?: boolean;
}

export function SummaryCards({ summary, trend, isLoading }: SummaryCardsProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border bg-card space-y-2.5"
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
      </div>
    );
  }

  const isSavingsPositive = summary.net_savings >= 0;

  // Compute trend metrics vs previous month
  const previousTrend =
    trend && trend.length > 1 ? trend[trend.length - 2] : null;

  let savingsDeltaPercent: number | null = null;
  let savingsDeltaAmount: number | null = null;
  if (previousTrend) {
    const prevNet = previousTrend.total_income - previousTrend.total_expense;
    savingsDeltaAmount = summary.net_savings - prevNet;
    if (prevNet !== 0) {
      savingsDeltaPercent = Math.round(
        ((summary.net_savings - prevNet) / Math.abs(prevNet)) * 100
      );
    }
  }

  let incomeDeltaPercent: number | null = null;
  if (previousTrend && previousTrend.total_income > 0) {
    incomeDeltaPercent = Math.round(
      ((summary.total_income - previousTrend.total_income) /
        previousTrend.total_income) *
        100
    );
  }

  let expenseDeltaPercent: number | null = null;
  if (previousTrend && previousTrend.total_expense > 0) {
    expenseDeltaPercent = Math.round(
      ((summary.total_expense - previousTrend.total_expense) /
        previousTrend.total_expense) *
        100
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Hero Balance / Net Savings Card */}
      <Card className="lg:col-span-5 rounded-2xl border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-xs hover:shadow-sm transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Net Monthly Balance
              </span>
              <Badge
                variant={isSavingsPositive ? "default" : "destructive"}
                className={`text-[10px] px-2 py-0.5 font-bold gap-1 rounded-full ${
                  isSavingsPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {isSavingsPositive ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    <span>Surplus</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    <span>Deficit</span>
                  </>
                )}
              </Badge>
            </div>

            <div
              className={`mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums ${
                isSavingsPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isSavingsPositive ? "+" : ""}
              {format(summary.net_savings)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span>
                {summary.total_income > 0 || summary.total_expense > 0
                  ? isSavingsPositive
                    ? "Retained capital after expenses"
                    : "Expenses exceed monthly income"
                  : "No activity recorded this month"}
              </span>
            </span>

            {savingsDeltaPercent !== null && (
              <span
                className={`font-semibold font-mono tabular-nums inline-flex items-center gap-0.5 ${
                  savingsDeltaPercent >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500"
                }`}
              >
                {savingsDeltaPercent >= 0 ? "+" : ""}
                {savingsDeltaPercent}% vs last mo
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Income / Expense / Savings Rate Summary Cards */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <Card className="rounded-2xl border-border shadow-xs hover:shadow-sm transition-all bg-card">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total Income
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {format(summary.total_income)}
              </div>
            </div>

            <div className="mt-3 flex items-center text-[11px] text-muted-foreground font-medium">
              {incomeDeltaPercent !== null ? (
                <span
                  className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                    incomeDeltaPercent >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500"
                  }`}
                >
                  {incomeDeltaPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {incomeDeltaPercent >= 0 ? "+" : ""}
                  {incomeDeltaPercent}% vs last mo
                </span>
              ) : (
                <span className="text-muted-foreground/80">Monthly inflows</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="rounded-2xl border-border shadow-xs hover:shadow-sm transition-all bg-card">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total Expense
                </span>
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums text-rose-500">
                {format(summary.total_expense)}
              </div>
            </div>

            <div className="mt-3 flex items-center text-[11px] text-muted-foreground font-medium">
              {expenseDeltaPercent !== null ? (
                <span
                  className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                    expenseDeltaPercent <= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500"
                  }`}
                >
                  {expenseDeltaPercent <= 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {expenseDeltaPercent > 0 ? "+" : ""}
                  {expenseDeltaPercent}% vs last mo
                </span>
              ) : (
                <span className="text-muted-foreground/80">Total outflows</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="rounded-2xl border-border shadow-xs hover:shadow-sm transition-all bg-card">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Savings Rate
                </span>
                <div className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums text-foreground">
                {summary.savings_rate.toFixed(1)}%
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <Progress
                value={Math.max(0, Math.min(100, summary.savings_rate))}
                className="h-1.5 bg-secondary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Target: 20%+</span>
                <span className="font-mono tabular-nums">
                  {summary.savings_rate >= 20 ? "On Track" : "Low"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
