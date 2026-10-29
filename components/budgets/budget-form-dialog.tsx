"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { budgetFormSchema, type BudgetFormInput } from "@/schemas/budget";
import { useCategories } from "@/hooks/use-categories";
import { useSaveBudget } from "@/hooks/use-budgets";
import { useCurrency } from "@/components/providers/currency-provider";
import { BudgetWithCategory } from "@/types/database";
import { CategoryIcon } from "@/components/ui/category-icon";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: number;
  year: number;
  initialData?: BudgetWithCategory | null;
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  month,
  year,
  initialData,
}: BudgetFormDialogProps) {
  const { data: categories = [] } = useCategories();
  const { currency } = useCurrency();
  const saveMutation = useSaveBudget();

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const form = useForm<BudgetFormInput>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category_id: "",
      amount: "" as unknown as number,
      month,
      year,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.reset({
        id: initialData.id,
        category_id: initialData.category_id,
        amount: Number(initialData.amount),
        month: initialData.month,
        year: initialData.year,
      });
    } else {
      form.reset({
        category_id: expenseCategories[0]?.id || "",
        amount: "" as unknown as number,
        month,
        year,
      });
    }
  }, [open, initialData, month, year, expenseCategories]);

  const onSubmit = async (data: BudgetFormInput) => {
    try {
      await saveMutation.mutateAsync({
        id: initialData?.id,
        category_id: data.category_id,
        amount: data.amount,
        month: data.month,
        year: data.year,
      });
      onOpenChange(false);
      form.reset();
    } catch {
      // handled in mutation
    }
  };

  const isPending = saveMutation.isPending;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Budget Limit" : "Set Category Budget"}
      description={`Set a monthly spending limit for ${new Date(
        year,
        month - 1
      ).toLocaleString("default", { month: "long" })} ${year}`}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="budget-category" className="text-xs font-semibold text-muted-foreground">
            Category
          </Label>
          <Select
            value={form.watch("category_id")}
            onValueChange={(val) => form.setValue("category_id", val)}
            disabled={!!initialData}
          >
            <SelectTrigger id="budget-category" className="h-10 text-xs rounded-xl bg-surface">
              <SelectValue placeholder="Select an expense category" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border/80">
              {expenseCategories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryIcon categoryName={c.name} color={c.color} size="sm" />
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category_id && (
            <p className="text-xs text-rose-400">
              {form.formState.errors.category_id.message}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="budget-amount" className="text-xs font-semibold text-muted-foreground">
            Monthly Limit
          </Label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-lg font-bold text-muted-foreground pointer-events-none">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              id="budget-amount"
              type="number"
              step="1"
              placeholder="e.g. 15000"
              className="pl-9 h-11 text-lg font-bold font-sans tabular-nums rounded-xl bg-surface"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </div>
          {form.formState.errors.amount && (
            <p className="text-xs text-rose-400">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="btn-gradient h-9 text-xs rounded-xl font-semibold px-5 min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              "Update Limit"
            ) : (
              "Save Budget"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
