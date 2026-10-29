"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, PieChart as PieChartIcon, Plus, ShieldAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthYearPicker } from "@/components/dashboard/month-year-picker";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { useBudgets } from "@/hooks/use-budgets";
import { useCurrency } from "@/components/providers/currency-provider";
import { BudgetWithCategory } from "@/types/database";

export default function BudgetsPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(
    null
  );

  const { data: budgets = [], isLoading } = useBudgets(
    selectedMonth,
    selectedYear
  );
  const { format } = useCurrency();

  // Aggregate metrics
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const overallPercentage =
    totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const exceededCount = budgets.filter((b) => b.percentage >= 100).length;
  const warningCount = budgets.filter(
    (b) => b.percentage >= 80 && b.percentage < 100
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Category Budgets
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Set spending limits and receive automatic warnings at 80% and 100%
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
              onClick={() => {
                setEditingBudget(null);
                setDialogOpen(true);
              }}
              className="rounded-xl font-semibold gap-2 shadow-sm shadow-primary/20 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Set Budget</span>
            </Button>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Budgeted
              </span>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {format(totalBudgeted)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across {budgets.length} categories
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Spent
              </span>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-rose-500 font-mono tabular-nums">
                {format(totalSpent)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono tabular-nums">
                {overallPercentage}% of aggregate limits
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Remaining Limit
              </span>
              <div
                className={`mt-2 text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums ${
                  remainingBudget >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}
              >
                {format(remainingBudget)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {remainingBudget >= 0 ? "Under budget" : "Total overspend"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Health Status
              </span>
              <div className="mt-2 flex items-center gap-1.5 text-base sm:text-lg font-bold">
                {exceededCount > 0 ? (
                  <span className="text-destructive flex items-center gap-1">
                    <ShieldAlert className="h-5 w-5" />
                    {exceededCount} Over limit
                  </span>
                ) : warningCount > 0 ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-5 w-5" />
                    {warningCount} Near limit
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-5 w-5" />
                    All Good
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Active alerts this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budgets List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-muted/40 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <PieChartIcon className="h-7 w-7 stroke-1" />
            </div>
            <h3 className="text-base font-semibold">No category budgets set</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Set spending limits for Food, Shopping, Bills or Transport to avoid
              overspending and receive instant threshold alerts.
            </p>
            <Button
              onClick={() => {
                setEditingBudget(null);
                setDialogOpen(true);
              }}
              className="rounded-xl font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Monthly Budget</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                onEdit={(budget) => {
                  setEditingBudget(budget);
                  setDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Budget Form Dialog */}
        <BudgetFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          month={selectedMonth}
          year={selectedYear}
          initialData={editingBudget}
        />
      </div>
  );
}
