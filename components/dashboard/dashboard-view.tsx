"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Calendar,
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
import { useDashboardData } from "@/hooks/use-dashboard";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { transactionModal } from "@/hooks/use-transaction-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically imported chart components for bundle size & 90+ Lighthouse score
const CategoryDonutChart = dynamic(() => import("./category-donut-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full rounded-xl" />,
});

const IncomeExpenseTrendChart = dynamic(
  () => import("./income-expense-trend-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full rounded-xl" />,
  }
);

const DailySpendBarChart = dynamic(() => import("./daily-spend-bar-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
});

export function DashboardView() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const { summary, categoryBreakdown, trend, dailySpend, isLoading } =
    useDashboardData(selectedMonth, selectedYear);

  const { data: recentTxData, isLoading: isTxLoading } = useTransactions({
    type: "all",
    page: 1,
    pageSize: 5,
    sortBy: "date_desc",
  });

  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgets(
    selectedMonth,
    selectedYear
  );

  return (
    <div className="space-y-6">
      {/* Top Header with Month/Year picker & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time cash flow, category breakdowns, and budget warnings
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
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
            className="rounded-xl font-semibold gap-2 shadow-sm shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Total Income, Total Expense, Net Savings, Savings Rate % */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* Charts Grid: Donut + 6-Month Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Expense Donut Chart */}
        <Card className="lg:col-span-5 rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                <span>Expense by Category</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryDonutChart
              data={categoryBreakdown}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* 6-Month Income vs Expense Trend */}
        <Card className="lg:col-span-7 rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Income vs Expense (Last 6 Months)</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <IncomeExpenseTrendChart data={trend} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Daily Spending Intensity */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Daily Spending for Month</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DailySpendBarChart data={dailySpend} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Bottom Grid: Recent Transactions & Budget Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-6 rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions
              transactions={recentTxData?.items || []}
              isLoading={isTxLoading}
            />
          </CardContent>
        </Card>

        {/* Monthly Budgets Progress */}
        <Card className="lg:col-span-6 rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Monthly Budget Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardBudgetProgress
              budgets={budgets}
              isLoading={isBudgetsLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
