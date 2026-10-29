"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Layers,
  PieChart as PieChartIcon,
  Plus,
  Receipt,
  Sparkles,
} from "lucide-react";
import { MonthYearPicker } from "./month-year-picker";
import { SummaryCards } from "./summary-cards";
import { RecentTransactions } from "./recent-transactions";
import { DashboardBudgetProgress } from "./dashboard-budget-progress";
import { AiInsightsCard } from "./ai-insights-card";
import { UpcomingTripCard } from "./upcoming-trip-card";
import { useDashboardData } from "@/hooks/use-dashboard";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useTrips } from "@/hooks/use-trips";
import { transactionModal } from "@/hooks/use-transaction-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingEmptyState } from "@/components/ui/empty-state";

// Dynamically imported chart components for bundle size & 90+ Lighthouse score
const CategoryDonutChart = dynamic(() => import("./category-donut-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full rounded-xl bg-surface-elevated/40" />,
});

const IncomeExpenseTrendChart = dynamic(
  () => import("./income-expense-trend-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full rounded-xl bg-surface-elevated/40" />,
  }
);

export function DashboardView() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const { summary, categoryBreakdown, trend, dailySpend, isLoading } =
    useDashboardData(selectedMonth, selectedYear);

  const { data: recentTxData, isLoading: isTxLoading } = useTransactions({
    type: "all",
    page: 1,
    pageSize: 6,
    sortBy: "date_desc",
  });

  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgets(
    selectedMonth,
    selectedYear
  );

  const { data: trips = [], isLoading: isTripsLoading } = useTrips("all");

  const totalTransactionsCount = recentTxData?.totalCount ?? 0;
  const isCompletelyEmpty =
    !isLoading &&
    !isTxLoading &&
    !isBudgetsLoading &&
    summary.total_income === 0 &&
    summary.total_expense === 0 &&
    totalTransactionsCount === 0 &&
    budgets.length === 0;

  return (
    <div className="space-y-6">
      {/* Top Header with Month/Year picker & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time cash flow, category distribution, and budget limits
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <MonthYearPicker
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />

          <Button
            onClick={() => transactionModal.open()}
            className="btn-gradient font-semibold rounded-xl text-xs h-9 gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </Button>
        </div>
      </div>

      {/* When brand new user with 0 activity, surface Onboarding Checklist */}
      {isCompletelyEmpty && (
        <OnboardingEmptyState
          completedSteps={{
            hasTransactions: totalTransactionsCount > 0,
            hasBudgets: budgets.length > 0,
            hasTrips: trips.length > 0,
          }}
        />
      )}

      {/* Bento Grid Row 1: Hero Net Balance (8 cols) + 3 KPI Cards (4 cols) */}
      <SummaryCards
        summary={summary}
        trend={trend}
        dailySpend={dailySpend}
        isLoading={isLoading}
      />

      {/* Bento Grid Row 2: AI Financial Insights Card (12 cols) */}
      <AiInsightsCard
        month={selectedMonth}
        year={selectedYear}
        summary={summary}
        isSummaryLoading={isLoading}
      />

      {/* Bento Grid Row 3: Cash Flow Trend (7 cols) + Category Donut (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 6-Month Income vs Expense Trend */}
        <Card
          className="lg:col-span-7 rounded-[20px] border-border/80 bg-surface p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Cash Flow (Last 6 Months)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <IncomeExpenseTrendChart data={trend} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Category Expense Donut Chart */}
        <Card
          className="lg:col-span-5 rounded-[20px] border-border/80 bg-surface p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <span>Expense by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <CategoryDonutChart
              data={categoryBreakdown}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bento Grid Row 4: Recent Tx (5 cols) + Budgets (4 cols) + Upcoming Trip (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Recent Transactions */}
        <Card
          className="lg:col-span-5 rounded-[20px] border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-1 flex-1">
            <RecentTransactions
              transactions={recentTxData?.items || []}
              isLoading={isTxLoading}
            />
          </CardContent>
        </Card>

        {/* Monthly Budgets Tracking */}
        <Card
          className="lg:col-span-4 rounded-[20px] border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Layers className="h-4 w-4 text-primary" />
              <span>Monthly Budget Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-1 flex-1">
            <DashboardBudgetProgress
              budgets={budgets}
              isLoading={isBudgetsLoading}
            />
          </CardContent>
        </Card>

        {/* Upcoming Trip Card */}
        <div className="lg:col-span-3 h-full">
          <UpcomingTripCard trips={trips} isLoading={isTripsLoading} />
        </div>
      </div>
    </div>
  );
}
