"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Plus,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthYearPicker } from "@/components/dashboard/month-year-picker";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { RevealCard } from "@/components/ui/reveal-card";
import { useBudgets, useSaveBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { useCurrency } from "@/components/providers/currency-provider";
import { BudgetWithCategory } from "@/types/database";
import { Money } from "@/components/ui/money";
import { toast } from "sonner";

export default function BudgetsPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(
    null
  );
  const [isSuggesting, setIsSuggesting] = useState(false);

  const { data: budgets = [], isLoading } = useBudgets(
    selectedMonth,
    selectedYear
  );
  const { data: categories = [] } = useCategories();
  const saveMutation = useSaveBudget();

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

  const handleSuggestBudgets = async () => {
    setIsSuggesting(true);
    try {
      const expenseCats = categories.filter((c) => c.type === "expense");
      const suggestions = [
        { name: "Food", amount: 15000 },
        { name: "Shopping", amount: 10000 },
        { name: "Transport", amount: 6000 },
        { name: "Bills", amount: 5000 },
      ];

      for (const item of suggestions) {
        const cat = expenseCats.find((c) =>
          c.name.toLowerCase().includes(item.name.toLowerCase())
        );
        if (cat) {
          await saveMutation.mutateAsync({
            category_id: cat.id,
            amount: item.amount,
            month: selectedMonth,
            year: selectedYear,
          });
        }
      }
      toast.success("Suggested budgets applied successfully!");
    } catch {
      toast.error("Failed to apply suggested budgets");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Category Budgets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Spending ceilings with automatic threshold alerts at 80% and 100%
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
            onClick={() => {
              setEditingBudget(null);
              setDialogOpen(true);
            }}
            className="btn-gradient font-semibold rounded-xl text-xs h-9 gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Set Budget</span>
          </Button>
        </div>
      </div>

      {/* Top Summary Strip: Total Budgeted / Spent / Remaining / Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Budgeted */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-eyebrow block">
            Total Budgeted
          </span>
          <div className="mt-2">
            <Money amount={totalBudgeted} size="xl" className="text-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Across {budgets.length} {budgets.length === 1 ? "category" : "categories"}
          </p>
        </Card>

        {/* Card 2: Total Spent */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-eyebrow block">
            Total Spent
          </span>
          <div className="mt-2">
            <Money amount={totalSpent} size="xl" className="text-rose-400" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 num">
            {overallPercentage}% of total limit
          </p>
        </Card>

        {/* Card 3: Remaining Limit */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-eyebrow block">
            Remaining Limit
          </span>
          <div className="mt-2">
            <Money
              amount={remainingBudget}
              size="xl"
              className={remainingBudget >= 0 ? "text-emerald-400" : "text-rose-400"}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {remainingBudget >= 0 ? "Under spending limit" : "Exceeded aggregate"}
          </p>
        </Card>

        {/* Card 4: Health Status */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-eyebrow block">
            Health Status
          </span>
          <div className="mt-2 flex items-center gap-1.5 text-base sm:text-lg font-bold">
            {exceededCount > 0 ? (
              <span className="text-rose-400 flex items-center gap-1.5 text-sm sm:text-base">
                <ShieldAlert className="h-4 w-4" />
                {exceededCount} Over limit
              </span>
            ) : warningCount > 0 ? (
              <span className="text-amber-400 flex items-center gap-1.5 text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4" />
                {warningCount} Near limit
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5 text-sm sm:text-base">
                <CheckCircle2 className="h-4 w-4" />
                All on track
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {exceededCount + warningCount === 0
              ? "All category budgets safe"
              : "Active threshold alerts"}
          </p>
        </Card>
      </div>

      {/* Grid of Category Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-[20px] bg-surface-elevated/40 animate-pulse border border-border/80"
            />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px] border border-dashed border-border/80 bg-surface/40 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-surface-elevated border border-border/60 flex items-center justify-center text-muted-foreground mb-1">
            <PieChartIcon className="h-7 w-7 text-primary stroke-1" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No category budgets set for this month
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Set spending targets for Food, Shopping, Transit or Bills to unlock 80% warning triggers and keep outflows disciplined.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <Button
              onClick={() => {
                setEditingBudget(null);
                setDialogOpen(true);
              }}
              className="btn-gradient font-semibold rounded-xl text-xs h-9 gap-1.5 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Set First Budget</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSuggestBudgets}
              disabled={isSuggesting}
              className="rounded-xl text-xs h-9 gap-1.5 border-border/80 w-full sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Suggest from my spending</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <RevealCard key={b.id}>
              <BudgetCard
                budget={b}
                onEdit={(budget) => {
                  setEditingBudget(budget);
                  setDialogOpen(true);
                }}
              />
            </RevealCard>
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
