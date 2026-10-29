"use client";

import React, { useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  MonthlySummary,
  SixMonthTrendItem,
  DailySpendItem,
} from "@/hooks/use-dashboard";
import { Money } from "@/components/ui/money";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  summary: MonthlySummary;
  trend?: SixMonthTrendItem[];
  dailySpend?: DailySpendItem[];
  isLoading?: boolean;
}

export function SummaryCards({
  summary,
  trend,
  dailySpend,
  isLoading,
}: SummaryCardsProps) {
  // Compute previous month deltas
  const {
    previousTrend,
    savingsDeltaPercent,
    incomeDeltaPercent,
    expenseDeltaPercent,
    incomeSparkData,
    expenseSparkData,
    heroSparkData,
  } = useMemo(() => {
    const prev = trend && trend.length > 1 ? trend[trend.length - 2] : null;

    let sDelta: number | null = null;
    let iDelta: number | null = null;
    let eDelta: number | null = null;

    if (prev) {
      const prevNet = prev.total_income - prev.total_expense;
      if (prevNet !== 0) {
        sDelta = Math.round(
          ((summary.net_savings - prevNet) / Math.abs(prevNet)) * 100
        );
      } else if (summary.net_savings === 0) {
        sDelta = 0;
      }

      if (prev.total_income > 0) {
        iDelta = Math.round(
          ((summary.total_income - prev.total_income) / prev.total_income) * 100
        );
      }

      if (prev.total_expense > 0) {
        eDelta = Math.round(
          ((summary.total_expense - prev.total_expense) / prev.total_expense) * 100
        );
      }
    }

    // Sparkline history arrays
    const iSpark =
      trend && trend.length > 0
        ? trend.map((t) => t.total_income)
        : [0, summary.total_income];

    const eSpark =
      trend && trend.length > 0
        ? trend.map((t) => t.total_expense)
        : [0, summary.total_expense];

    // Compute 30-day cumulative balance trajectory for Hero
    let hSpark: number[] = [];
    if (dailySpend && dailySpend.length > 1) {
      let runExpense = 0;
      const dailyIncomeShare = summary.total_income / dailySpend.length;
      hSpark = dailySpend.map((d, idx) => {
        runExpense += d.total_expense;
        const cumulativeIncome = dailyIncomeShare * (idx + 1);
        return Math.round(cumulativeIncome - runExpense);
      });
    } else if (trend && trend.length > 0) {
      hSpark = trend.map((t) => t.total_income - t.total_expense);
    } else {
      hSpark = [0, summary.net_savings];
    }

    return {
      previousTrend: prev,
      savingsDeltaPercent: sDelta,
      incomeDeltaPercent: iDelta,
      expenseDeltaPercent: eDelta,
      incomeSparkData: iSpark,
      expenseSparkData: eSpark,
      heroSparkData: hSpark,
    };
  }, [summary, trend, dailySpend]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 p-6 rounded-[24px] border border-border/80 bg-card space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-[20px] border border-border/80 bg-card space-y-2"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isNetZero = summary.net_savings === 0;
  const isNetPositive = summary.net_savings > 0;
  const isNetNegative = summary.net_savings < 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Hero Card: Net Balance This Month (Span 8 Cols) */}
      <Card
        className="lg:col-span-8 rounded-[24px] border-border/80 bg-surface p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-xs"
        style={{
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
        }}
      >
        {/* Subtle radial glow background */}
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 transition-opacity ${
            isNetPositive
              ? "bg-emerald-500/10"
              : isNetNegative
              ? "bg-rose-500/10"
              : "bg-cyan-500/5"
          }`}
        />

        <div className="relative z-10 space-y-4">
          {/* Header Row: Label + Delta Chip */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-surface-elevated border border-border/80 flex items-center justify-center text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                Net Balance
              </span>
            </div>

            {/* Delta Chip: green up / red down / neutral "No change" when 0, never a "Surplus" badge on ₹0 */}
            {isNetZero ? (
              <Badge
                variant="outline"
                className="text-xs font-semibold px-2.5 py-0.5 gap-1.5 rounded-full border-border/80 text-muted-foreground bg-surface-elevated/60"
              >
                <Minus className="h-3 w-3" />
                <span>No change (₹0)</span>
              </Badge>
            ) : isNetPositive ? (
              <Badge className="text-xs font-semibold px-2.5 py-0.5 gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {savingsDeltaPercent !== null && savingsDeltaPercent !== 0
                    ? `${savingsDeltaPercent > 0 ? "+" : ""}${savingsDeltaPercent}% vs last mo`
                    : "Surplus"}
                </span>
              </Badge>
            ) : (
              <Badge className="text-xs font-semibold px-2.5 py-0.5 gap-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25">
                <TrendingDown className="h-3 w-3" />
                <span>
                  {savingsDeltaPercent !== null && savingsDeltaPercent !== 0
                    ? `${savingsDeltaPercent}% vs last mo`
                    : "Deficit"}
                </span>
              </Badge>
            )}
          </div>

          {/* Huge Animated Count-Up Number */}
          <div className="pt-1">
            <AnimatedNumber
              value={summary.net_savings}
              isCurrency
              prefix={isNetPositive ? "+" : ""}
              className={`text-4xl sm:text-5xl lg:text-[46px] font-bold tracking-display num ${
                isNetPositive
                  ? "text-emerald-400"
                  : isNetNegative
                  ? "text-rose-400"
                  : "text-foreground"
              }`}
            />
          </div>

          {/* 30-Day Area Sparkline with Gradient Fill */}
          <div className="py-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium mb-1">
              <span>Monthly trajectory</span>
              <span>{heroSparkData.length} data points</span>
            </div>
            <Sparkline
              data={heroSparkData}
              height={52}
              color={isNetPositive ? "#34D399" : isNetNegative ? "#FB7185" : "#38BDF8"}
              showFill
            />
          </div>
        </div>

        {/* Bottom Strip: Two Mini Stats (Inflows & Outflows) */}
        <div className="relative z-10 mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Total Inflows
              </span>
              <Money
                amount={summary.total_income}
                size="md"
                className="text-emerald-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-border/60 pl-4">
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Total Outflows
              </span>
              <Money
                amount={summary.total_expense}
                size="md"
                className="text-rose-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Right Column: 3 KPI Cards (Span 4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3.5">
        {/* KPI 1: Income */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-4.5 flex-1 flex flex-col justify-between shadow-xs hover:border-border transition-all overflow-hidden"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Income</span>
            </div>

            {incomeDeltaPercent !== null && (
              <span
                className={`text-[11px] font-bold num inline-flex items-center gap-0.5 ${
                  incomeDeltaPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {incomeDeltaPercent >= 0 ? "+" : ""}
                {incomeDeltaPercent}%
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-2 mt-2">
            <div className="min-w-0">
              <Money
                amount={summary.total_income}
                size="xl"
                className="text-foreground"
              />
            </div>
            <div className="w-16 sm:w-20 shrink-0 pb-1">
              <Sparkline data={incomeSparkData} height={26} color="#34D399" showFill={false} />
            </div>
          </div>
        </Card>

        {/* KPI 2: Expense */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-4.5 flex-1 flex flex-col justify-between shadow-xs hover:border-border transition-all overflow-hidden"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Expense</span>
            </div>

            {expenseDeltaPercent !== null && (
              <span
                className={`text-[11px] font-bold num inline-flex items-center gap-0.5 ${
                  expenseDeltaPercent <= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {expenseDeltaPercent > 0 ? "+" : ""}
                {expenseDeltaPercent}%
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-2 mt-2">
            <div className="min-w-0">
              <Money
                amount={summary.total_expense}
                size="xl"
                className="text-foreground"
              />
            </div>
            <div className="w-16 sm:w-20 shrink-0 pb-1">
              <Sparkline data={expenseSparkData} height={26} color="#FB7185" showFill={false} />
            </div>
          </div>
        </Card>

        {/* KPI 3: Savings Rate with ProgressRing */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-4.5 flex-1 flex items-center justify-between gap-4 shadow-xs hover:border-border transition-all"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block">
              Savings Rate
            </span>
            <div className="text-2xl font-bold num text-foreground tracking-tight">
              {summary.savings_rate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  summary.savings_rate >= 20 ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span>Target: 20%</span>
              <span>•</span>
              <span
                className={
                  summary.savings_rate >= 20
                    ? "text-emerald-400 font-semibold"
                    : "text-amber-400 font-semibold"
                }
              >
                {summary.savings_rate >= 20 ? "On Track" : "Low"}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <ProgressRing
              value={summary.savings_rate}
              target={20}
              size={64}
              strokeWidth={6}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
