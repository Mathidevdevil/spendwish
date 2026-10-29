"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Edit2,
  Loader2,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import { BudgetWithCategory } from "@/types/database";
import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/transactions/delete-dialog";
import { useDeleteBudget, useSaveBudget } from "@/hooks/use-budgets";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Money } from "@/components/ui/money";

interface BudgetCardProps {
  budget: BudgetWithCategory;
  onEdit: (budget: BudgetWithCategory) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const { format } = useCurrency();
  const deleteMutation = useDeleteBudget();
  const saveMutation = useSaveBudget();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineLimit, setInlineLimit] = useState(String(budget.amount));

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

  const handleInlineSave = async () => {
    const num = Number(inlineLimit);
    if (isNaN(num) || num <= 0) return;
    try {
      await saveMutation.mutateAsync({
        id: budget.id,
        category_id: budget.category_id,
        amount: num,
        month: budget.month,
        year: budget.year,
      });
      setIsInlineEditing(false);
    } catch {
      // handled in mutation
    }
  };

  return (
    <>
      <Card
        className="rounded-[20px] border-border/80 bg-surface p-5 shadow-xs hover:border-border transition-all flex flex-col justify-between"
        style={{
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
        }}
      >
        <div className="space-y-4">
          {/* Header Row: Category Icon, Name, and Status Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <CategoryIcon
                categoryName={budget.category?.name}
                color={budget.category?.color}
                size="md"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">
                  {budget.category?.name || "Uncategorized"}
                </h3>
                <span className="text-[11px] text-muted-foreground block">
                  Monthly limit
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isOver ? (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-2 py-0.5 font-bold gap-1 rounded-full"
                >
                  <AlertCircle className="h-2.5 w-2.5" />
                  <span>Over limit</span>
                </Badge>
              ) : isWarning ? (
                <Badge
                  variant="warning"
                  className="text-[10px] px-2 py-0.5 font-bold gap-1 rounded-full"
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  <span>Near limit (80%+)</span>
                </Badge>
              ) : (
                <Badge
                  variant="income"
                  className="text-[10px] px-2 py-0.5 font-semibold gap-1 rounded-full"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span>On track</span>
                </Badge>
              )}

              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">Budget menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl bg-surface border-border/80"
                >
                  <DropdownMenuItem
                    onClick={() => onEdit(budget)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Dialog</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="cursor-pointer gap-2 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Budget</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Numbers: Spent / Limit with Inline Edit */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Money amount={spent} size="lg" className="text-foreground" />
                <span className="text-muted-foreground text-xs">of</span>

                {/* Inline Edit Mode vs Display Mode */}
                {isInlineEditing ? (
                  <div className="inline-flex items-center gap-1">
                    <Input
                      type="number"
                      value={inlineLimit}
                      onChange={(e) => setInlineLimit(e.target.value)}
                      className="h-6 w-20 px-1.5 py-0 text-xs font-mono font-bold bg-surface-elevated rounded-md"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInlineSave();
                        if (e.key === "Escape") setIsInlineEditing(false);
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleInlineSave}
                      disabled={saveMutation.isPending}
                      className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center"
                      title="Save"
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInlineEditing(false)}
                      className="h-6 w-6 rounded-md hover:bg-surface-elevated text-muted-foreground hover:text-foreground flex items-center justify-center"
                      title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setInlineLimit(String(budget.amount));
                      setIsInlineEditing(true);
                    }}
                    className="inline-flex items-center gap-1 group/limit cursor-pointer hover:text-foreground transition-colors"
                    title="Click to inline edit limit"
                  >
                    <span className="font-sans tabular-nums font-semibold text-muted-foreground group-hover/limit:text-foreground">
                      {format(total)}
                    </span>
                    <Edit2 className="h-2.5 w-2.5 text-muted-foreground/60 opacity-0 group-hover/limit:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>

              <span
                className={`font-bold font-sans tabular-nums text-xs ${
                  isOver
                    ? "text-rose-400"
                    : isWarning
                    ? "text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {percentage}%
              </span>
            </div>

            {/* Thin Rounded Progress Bar */}
            <Progress
              value={Math.min(100, percentage)}
              className="h-1.5 bg-surface-elevated rounded-full"
              indicatorClassName={
                isOver
                  ? "bg-rose-400"
                  : isWarning
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }
            />
          </div>
        </div>

        {/* Footer: Remaining Amount */}
        <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span
            className={`font-sans tabular-nums text-[11px] font-medium ${
              remaining < 0 ? "text-rose-400 font-bold" : "text-muted-foreground"
            }`}
          >
            {remaining < 0
              ? `Overspent by ${format(Math.abs(remaining))}`
              : `${format(remaining)} remaining`}
          </span>

          <span className="text-[10px] text-muted-foreground/80">
            {isOver ? "Exceeded" : isWarning ? "80%+ warning" : "On track"}
          </span>
        </div>
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
