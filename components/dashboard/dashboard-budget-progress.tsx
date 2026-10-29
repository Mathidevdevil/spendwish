"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, PieChart, Plus } from "lucide-react";
import { useCurrency } from "@/components/providers/currency-provider";
import { BudgetWithCategory } from "@/types/database";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardBudgetProgressProps {
  budgets: BudgetWithCategory[];
  isLoading?: boolean;
}

export function DashboardBudgetProgress({
  budgets,
  isLoading,
}: DashboardBudgetProgressProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface-elevated/40 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border/80 bg-surface/40 flex flex-col items-center justify-center space-y-2.5">
        <div className="h-9 w-9 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground border border-border/60">
          <PieChart className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">No monthly budgets set</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
            Set targets to receive 80% threshold warnings and avoid overspending.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1">
          <Link href="/budgets">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Budget</span>
          </Link>
        </Button>
      </div>
    );
  }

  // Display top 4 budgets
  const topBudgets = budgets.slice(0, 4);

  return (
    <div className="space-y-3">
      {topBudgets.map((b) => {
        const isExceeded = b.percentage >= 100;
        const isWarning = b.percentage >= 80 && !isExceeded;
        const remaining = b.amount - b.spent;

        return (
          <div
            key={b.id}
            className="p-3 rounded-xl border border-border/80 bg-surface/60 hover:bg-surface-elevated/70 transition-colors space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <CategoryIcon
                  categoryName={b.category?.name}
                  color={b.category?.color}
                  size="sm"
                />
                <span className="font-semibold text-foreground truncate max-w-[130px] text-xs">
                  {b.category?.name || "Category"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isExceeded ? (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-2 py-0 font-bold gap-1 rounded-full"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>Over limit</span>
                  </Badge>
                ) : isWarning ? (
                  <Badge
                    variant="warning"
                    className="text-[10px] px-2 py-0 font-bold gap-1 rounded-full"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>80%+ Near</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="income"
                    className="text-[10px] px-2 py-0 font-semibold gap-1 rounded-full"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>On Track</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Thin rounded progress bar */}
            <Progress
              value={Math.min(100, b.percentage)}
              className="h-1.5 bg-surface-elevated rounded-full"
              indicatorClassName={
                isExceeded
                  ? "bg-rose-400"
                  : isWarning
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans tabular-nums pt-0.5">
              <span>{format(b.spent)} of {format(b.amount)}</span>
              <span className={remaining >= 0 ? "text-muted-foreground" : "text-rose-400 font-semibold"}>
                {remaining >= 0 ? `${format(remaining)} left` : `${format(Math.abs(remaining))} over`}
              </span>
            </div>
          </div>
        );
      })}

      <div className="pt-1 text-right">
        <Link
          href="/budgets"
          className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
        >
          <span>All budgets</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
