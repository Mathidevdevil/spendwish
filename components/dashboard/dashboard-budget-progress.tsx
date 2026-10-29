"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, PieChart } from "lucide-react";
import { useCurrency } from "@/components/providers/currency-provider";
import { BudgetWithCategory } from "@/types/database";
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
          <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-card/40">
        <PieChart className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2 stroke-1" />
        <p className="text-xs font-semibold text-foreground">No monthly budgets set</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
          Set spending targets for Food, Rent, Shopping and get 80%/100% alerts.
        </p>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl">
          <Link href="/budgets">Create Budget</Link>
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

        return (
          <div
            key={b.id}
            className="p-3 rounded-xl border border-border bg-card space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: b.category?.color || "#64748b" }}
                />
                <span className="font-semibold text-foreground truncate max-w-[120px]">
                  {b.category?.name || "Category"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isExceeded ? (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0 h-4 font-bold gap-1"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>100%+ Exceeded</span>
                  </Badge>
                ) : isWarning ? (
                  <Badge
                    variant="warning"
                    className="text-[10px] px-1.5 py-0 h-4 font-bold gap-1"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>80%+ Warning</span>
                  </Badge>
                ) : (
                  <span className="text-[11px] font-semibold text-muted-foreground font-mono tabular-nums">
                    {Math.round(b.percentage)}%
                  </span>
                )}
              </div>
            </div>

            <Progress
              value={Math.min(100, b.percentage)}
              className="h-2 bg-secondary"
              indicatorClassName={
                isExceeded
                  ? "bg-rose-500"
                  : isWarning
                  ? "bg-amber-500"
                  : "bg-primary"
              }
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono tabular-nums">
              <span>Spent {format(b.spent)}</span>
              <span>Budget {format(b.amount)}</span>
            </div>
          </div>
        );
      })}

      <div className="pt-1 text-right">
        <Link
          href="/budgets"
          className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
        >
          <span>View all budgets</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
