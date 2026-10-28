"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { BudgetWithCategory } from "@/types/database";
import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/transactions/delete-dialog";
import { useDeleteBudget } from "@/hooks/use-budgets";

interface BudgetCardProps {
  budget: BudgetWithCategory;
  onEdit: (budget: BudgetWithCategory) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const { format } = useCurrency();
  const deleteMutation = useDeleteBudget();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const spent = Number(budget.spent) || 0;
  const total = Number(budget.amount) || 1;
  const percentage = Math.round(budget.percentage);
  const remaining = total - spent;
  const isOver = spent >= total;
  const isWarning = percentage >= 80 && !isOver;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: budget.id,
        month: budget.month,
        year: budget.year,
      });
      setDeleteOpen(false);
    } catch {
      // handled in mutation
    }
  };

  return (
    <>
      <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: budget.category?.color || "#64748b" }}
              />
              <h3 className="font-semibold text-base text-foreground truncate">
                {budget.category?.name || "Uncategorized"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isOver ? (
                <Badge
                  variant="destructive"
                  className="text-xs px-2 py-0.5 font-bold gap-1 rounded-md"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Exceeded</span>
                </Badge>
              ) : isWarning ? (
                <Badge
                  variant="warning"
                  className="text-xs px-2 py-0.5 font-bold gap-1 rounded-md"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Near Limit (80%+)</span>
                </Badge>
              ) : (
                <Badge
                  variant="success"
                  className="text-xs px-2 py-0.5 font-semibold gap-1 rounded-md"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>On Track</span>
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Budget menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    onClick={() => onEdit(budget)}
                    className="cursor-pointer gap-2"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Amount</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Budget</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {format(spent)}
              </span>
              <span className="text-muted-foreground ml-1.5">
                of {format(total)}
              </span>
            </div>
            <span
              className={`font-bold text-sm ${
                isOver
                  ? "text-destructive"
                  : isWarning
                  ? "text-amber-500"
                  : "text-muted-foreground"
              }`}
            >
              {percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <Progress
            value={Math.min(100, percentage)}
            className="h-2.5 bg-secondary"
            indicatorClassName={
              isOver
                ? "bg-rose-500"
                : isWarning
                ? "bg-amber-500"
                : "bg-emerald-600 dark:bg-emerald-500"
            }
          />

          {/* Footer details */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
            <span>
              {isOver
                ? `Overspent by ${format(Math.abs(remaining))}`
                : `${format(remaining)} remaining`}
            </span>
            <span className="text-[11px]">Monthly cycle</span>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={`Delete ${budget.category?.name} budget?`}
        description="Are you sure you want to remove this spending limit? Historical transactions will not be affected."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
