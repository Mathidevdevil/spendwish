"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  TransactionWithCategory,
  Transaction,
  InsertTables,
} from "@/types/database";
import {
  TransactionFilterInput,
  TransactionFormInput,
} from "@/schemas/transaction";
import { toast } from "sonner";

export function useTransactions(filters: TransactionFilterInput) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async (): Promise<{
      items: TransactionWithCategory[];
      totalCount: number;
    }> => {
      let query = supabase
        .from("transactions")
        .select(
          `
          *,
          category:categories(id, name, color, icon),
          trip:trips(id, name, destination)
        `,
          { count: "exact" }
        );

      // Filter by type
      if (filters.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      // Filter by category
      if (filters.categoryId && filters.categoryId !== "all") {
        query = query.eq("category_id", filters.categoryId);
      }

      // Filter by trip
      if (filters.tripId && filters.tripId !== "all") {
        query = query.eq("trip_id", filters.tripId);
      }

      // Filter by date range
      if (filters.startDate) {
        query = query.gte("date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("date", filters.endDate);
      }

      // Text search in notes
      if (filters.search && filters.search.trim()) {
        query = query.ilike("notes", `%${filters.search.trim()}%`);
      }

      // Sorting
      switch (filters.sortBy) {
        case "date_asc":
          query = query.order("date", { ascending: true }).order("created_at", { ascending: true });
          break;
        case "amount_desc":
          query = query.order("amount", { ascending: false });
          break;
        case "amount_asc":
          query = query.order("amount", { ascending: true });
          break;
        case "date_desc":
        default:
          query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
          break;
      }

      // Pagination
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 15;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        items: (data || []) as unknown as TransactionWithCategory[],
        totalCount: count ?? 0,
      };
    },
  });
}

// Check budget limit alert helper
async function checkBudgetWarning(
  supabase: ReturnType<typeof createClient>,
  categoryId: string | null | undefined,
  dateStr: string
) {
  if (!categoryId) return;
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  try {
    const { data: budget } = await supabase
      .from("budgets")
      .select("amount, category:categories(name)")
      .eq("category_id", categoryId)
      .eq("month", month)
      .eq("year", year)
      .single();

    const budgetRow = budget as { amount: number; category: { name: string } | null } | null;
    if (!budgetRow) return;

    // Calculate total spend in that month for that category
    const { data: txs } = await supabase
      .from("transactions")
      .select("amount")
      .eq("category_id", categoryId)
      .eq("type", "expense")
      .gte("date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lte("date", `${year}-${String(month).padStart(2, "0")}-31`);

    const transactionRows = (txs || []) as Array<{ amount: number }>;
    const totalSpent = transactionRows.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const budgetAmount = Number(budgetRow.amount);
    const categoryName = budgetRow.category?.name || "Category";

    if (totalSpent >= budgetAmount) {
      toast.error(
        `🚨 Budget Exceeded: Spent 100%+ of your ₹${budgetAmount.toLocaleString(
          "en-IN"
        )} budget for ${categoryName}!`,
        { duration: 6000 }
      );
    } else if (totalSpent >= budgetAmount * 0.8) {
      toast.warning(
        `⚠️ Budget Warning: Spent 80%+ of your ₹${budgetAmount.toLocaleString(
          "en-IN"
        )} budget for ${categoryName}`,
        { duration: 5000 }
      );
    }
  } catch {
    // Non-blocking
  }
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TransactionFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const insertData: InsertTables<"transactions"> = {
        user_id: user.id,
        type: input.type,
        amount: input.amount,
        date: input.date,
        payment_method: input.payment_method,
        category_id: input.category_id || null,
        trip_id: input.trip_id || null,
        notes: input.notes || null,
      };

      const { data, error } = await (supabase
        .from("transactions") as any)
        .insert(insertData)
        .select(
          `
          *,
          category:categories(id, name, color, icon),
          trip:trips(id, name, destination)
        `
        )
        .single();

      if (error) throw new Error(error.message);

      // Check budget warnings
      if (input.type === "expense") {
        checkBudgetWarning(supabase, input.category_id, input.date);
      }

      return data as unknown as TransactionWithCategory;
    },
    // Optimistic Update
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["transactions"],
      });

      // Optimistically add to active list
      queryClient.setQueriesData(
        { queryKey: ["transactions"] },
        (old: any) => {
          if (!old?.items) return old;
          const optimisticItem: TransactionWithCategory = {
            id: "temp-" + Date.now(),
            user_id: "current-user",
            type: newTx.type,
            amount: newTx.amount,
            date: newTx.date,
            payment_method: newTx.payment_method,
            category_id: newTx.category_id || null,
            trip_id: newTx.trip_id || null,
            notes: newTx.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: null,
            trip: null,
          };
          return {
            ...old,
            items: [optimisticItem, ...old.items],
            totalCount: old.totalCount + 1,
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || "Failed to create transaction");
    },
    onSuccess: () => {
      toast.success("Transaction added successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-category-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-trend"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-daily"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["trip-summary"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TransactionFormInput) => {
      if (!input.id) throw new Error("Transaction ID is required for update");

      const updateData = {
        type: input.type,
        amount: input.amount,
        date: input.date,
        payment_method: input.payment_method,
        category_id: input.category_id || null,
        trip_id: input.trip_id || null,
        notes: input.notes || null,
      };

      const { data, error } = await (supabase
        .from("transactions") as any)
        .update(updateData)
        .eq("id", input.id)
        .select(
          `
          *,
          category:categories(id, name, color, icon),
          trip:trips(id, name, destination)
        `
        )
        .single();

      if (error) throw new Error(error.message);

      if (input.type === "expense") {
        checkBudgetWarning(supabase, input.category_id, input.date);
      }

      return data as unknown as TransactionWithCategory;
    },
    onMutate: async (updatedTx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["transactions"],
      });

      queryClient.setQueriesData(
        { queryKey: ["transactions"] },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item: TransactionWithCategory) =>
              item.id === updatedTx.id
                ? {
                    ...item,
                    type: updatedTx.type,
                    amount: updatedTx.amount,
                    date: updatedTx.date,
                    payment_method: updatedTx.payment_method,
                    category_id: updatedTx.category_id || null,
                    trip_id: updatedTx.trip_id || null,
                    notes: updatedTx.notes || null,
                  }
                : item
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, _, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || "Failed to update transaction");
    },
    onSuccess: () => {
      toast.success("Transaction updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-category-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-trend"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-daily"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["trip-summary"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["transactions"],
      });

      queryClient.setQueriesData(
        { queryKey: ["transactions"] },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.filter((item: TransactionWithCategory) => item.id !== id),
            totalCount: Math.max(0, old.totalCount - 1),
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, _, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || "Failed to delete transaction");
    },
    onSuccess: () => {
      toast.success("Transaction deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-category-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-trend"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-daily"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["trip-summary"] });
    },
  });
}
