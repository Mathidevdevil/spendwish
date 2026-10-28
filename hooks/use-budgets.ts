"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { BudgetWithCategory, InsertTables } from "@/types/database";
import { toast } from "sonner";

export interface BudgetInput {
  id?: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
}

export function useBudgets(month: number, year: number) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: async (): Promise<BudgetWithCategory[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      // 1. Fetch budgets for the selected month/year
      const { data: budgetRows, error: budgetError } = await supabase
        .from("budgets")
        .select(
          `
          *,
          category:categories(id, name, color, icon)
        `
        )
        .eq("month", month)
        .eq("year", year);

      if (budgetError) {
        throw new Error(budgetError.message);
      }

      if (!budgetRows || budgetRows.length === 0) {
        return [];
      }

      // 2. Fetch total actual spend for each category in this month
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

      const { data: txRows } = await supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("type", "expense")
        .gte("date", startDate)
        .lte("date", endDate);

      const spendMap = new Map<string, number>();
      const rows = (txRows || []) as Array<{ category_id: string | null; amount: number }>;
      rows.forEach((tx) => {
        if (tx.category_id) {
          const current = spendMap.get(tx.category_id) || 0;
          spendMap.set(tx.category_id, current + Number(tx.amount));
        }
      });

      return budgetRows.map((b: any) => {
        const spent = spendMap.get(b.category_id) || 0;
        const amount = Number(b.amount) || 1;
        const percentage = Math.round((spent / amount) * 10000) / 100;

        return {
          ...b,
          spent,
          percentage,
        } as BudgetWithCategory;
      });
    },
  });
}

export function useSaveBudget() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: BudgetInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Upsert budget on (user_id, category_id, month, year)
      const budgetData = {
        user_id: user.id,
        category_id: input.category_id,
        amount: input.amount,
        month: input.month,
        year: input.year,
      };

      const { data, error } = await (supabase
        .from("budgets") as any)
        .upsert(budgetData, {
          onConflict: "user_id,category_id,month,year",
        })
        .select(
          `
          *,
          category:categories(id, name, color, icon)
        `
        )
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["budgets", vars.month, vars.year],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Budget saved successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save budget");
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      month,
      year,
    }: {
      id: string;
      month: number;
      year: number;
    }) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { id, month, year };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["budgets", res.month, res.year],
      });
      toast.success("Budget removed");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove budget");
    },
  });
}
