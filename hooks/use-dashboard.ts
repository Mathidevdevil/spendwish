"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, demoStore } from "@/lib/demo-data";

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
}

export interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total_amount: number;
  percentage: number;
}

export interface SixMonthTrendItem {
  month_label: string;
  month_num: number;
  year_num: number;
  total_income: number;
  total_expense: number;
}

export interface DailySpendItem {
  day: number;
  date: string;
  total_expense: number;
}

export function useDashboardData(month: number, year: number) {
  const supabase = createClient();

  // 1. Monthly KPI Summary RPC
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", month, year],
    queryFn: async (): Promise<MonthlySummary> => {
      if (isDemoMode()) {
        return demoStore.getDashboardSummary(month, year);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return demoStore.getDashboardSummary(month, year);
        }

        // Try RPC first
        const { data, error } = await (supabase as any).rpc("get_monthly_summary", {
          p_user_id: user.id,
          p_month: month,
          p_year: year,
        });

        if (!error && data && data.length > 0) {
          return {
            total_income: Number(data[0].total_income) || 0,
            total_expense: Number(data[0].total_expense) || 0,
            net_savings: Number(data[0].net_savings) || 0,
            savings_rate: Number(data[0].savings_rate) || 0,
          };
        }

        // Fallback query directly from transactions table
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

        const { data: txs } = await supabase
          .from("transactions")
          .select("type, amount")
          .gte("date", startDate)
          .lte("date", endDate);

        let income = 0;
        let expense = 0;
        const rows = (txs || []) as Array<{ type: string; amount: number }>;
        rows.forEach((t) => {
          if (t.type === "income") income += Number(t.amount);
          if (t.type === "expense") expense += Number(t.amount);
        });

        const savings = income - expense;
        const rate = income > 0 ? (savings / income) * 100 : 0;

        return {
          total_income: income,
          total_expense: expense,
          net_savings: savings,
          savings_rate: Math.round(rate * 100) / 100,
        };
      } catch {
        return demoStore.getDashboardSummary(month, year);
      }
    },
  });

  // 2. Category Breakdown RPC
  const categoryBreakdownQuery = useQuery({
    queryKey: ["dashboard-category-breakdown", month, year],
    queryFn: async (): Promise<CategoryBreakdownItem[]> => {
      if (isDemoMode()) {
        return demoStore.getCategoryBreakdown(month, year);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return demoStore.getCategoryBreakdown(month, year);

        const { data, error } = await (supabase as any).rpc("get_category_breakdown", {
          p_user_id: user.id,
          p_month: month,
          p_year: year,
        });

        if (!error && data) {
          return data.map((d: any) => ({
            category_id: d.category_id || "uncategorized",
            category_name: d.category_name || "Uncategorized",
            category_color: d.category_color || "#64748b",
            category_icon: d.category_icon || "tag",
            total_amount: Number(d.total_amount) || 0,
            percentage: Number(d.percentage) || 0,
          }));
        }

        return demoStore.getCategoryBreakdown(month, year);
      } catch {
        return demoStore.getCategoryBreakdown(month, year);
      }
    },
  });

  // 3. 6-Month Trend RPC
  const trendQuery = useQuery({
    queryKey: ["dashboard-trend", month, year],
    queryFn: async (): Promise<SixMonthTrendItem[]> => {
      if (isDemoMode()) {
        return demoStore.getSixMonthTrend();
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return demoStore.getSixMonthTrend();

        const targetDate = `${year}-${String(month).padStart(2, "0")}-28`;

        const { data, error } = await (supabase as any).rpc("get_six_month_trend", {
          p_user_id: user.id,
          p_end_date: targetDate,
        });

        if (!error && data) {
          return data.map((d: any) => ({
            month_label: d.month_label,
            month_num: d.month_num,
            year_num: d.year_num,
            total_income: Number(d.total_income) || 0,
            total_expense: Number(d.total_expense) || 0,
          }));
        }

        return demoStore.getSixMonthTrend();
      } catch {
        return demoStore.getSixMonthTrend();
      }
    },
  });

  // 4. Daily Spend RPC
  const dailySpendQuery = useQuery({
    queryKey: ["dashboard-daily", month, year],
    queryFn: async (): Promise<DailySpendItem[]> => {
      if (isDemoMode()) {
        return demoStore.getDailySpend(month, year);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return demoStore.getDailySpend(month, year);

        const { data, error } = await (supabase as any).rpc("get_daily_spend", {
          p_user_id: user.id,
          p_month: month,
          p_year: year,
        });

        if (!error && data) {
          return data.map((d: any) => ({
            day: d.day,
            date: d.date,
            total_expense: Number(d.total_expense) || 0,
          }));
        }

        return demoStore.getDailySpend(month, year);
      } catch {
        return demoStore.getDailySpend(month, year);
      }
    },
  });

  return {
    summary: summaryQuery.data || {
      total_income: 0,
      total_expense: 0,
      net_savings: 0,
      savings_rate: 0,
    },
    categoryBreakdown: categoryBreakdownQuery.data || [],
    trend: trendQuery.data || [],
    dailySpend: dailySpendQuery.data || [],
    isLoading:
      summaryQuery.isLoading ||
      categoryBreakdownQuery.isLoading ||
      trendQuery.isLoading ||
      dailySpendQuery.isLoading,
  };
}
