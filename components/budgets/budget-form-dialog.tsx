"use client";

import { useEffect } from "react";
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

  // Only expense categories can be budgeted
  const expenseCategories = categories.filter((c) => c.type === "expense");

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
  }, [initialData, month, year, form, expenseCategories]);

  const onSubmit = async (data: BudgetFormInput) => {
    try {
      await saveMutation.mutateAsync({
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="budget-category">Category</Label>
          <Select
            value={form.watch("category_id")}
            onValueChange={(val) => form.setValue("category_id", val)}
            disabled={!!initialData}
          >
            <SelectTrigger id="budget-category">
              <SelectValue placeholder="Select an expense category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.color || "#64748b" }}
                    />
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category_id && (
            <p className="text-xs text-destructive">
              {form.formState.errors.category_id.message}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="budget-amount">
            Monthly Limit ({currency === "INR" ? "₹" : "$"})
          </Label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-muted-foreground">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              id="budget-amount"
              type="number"
              step="1"
              placeholder="e.g. 15000"
              className="pl-8 text-base font-semibold"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </div>
          {form.formState.errors.amount && (
            <p className="text-xs text-destructive">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              "Update Budget"
            ) : (
              "Save Budget"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
