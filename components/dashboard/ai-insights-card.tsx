"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Lightbulb,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthlyInsightsOutput } from "@/schemas/ai";
import { transactionModal } from "@/hooks/use-transaction-modal";

interface AiInsightsCardProps {
  month: number;
  year: number;
  summary?: {
    total_income: number;
    total_expense: number;
    net_savings: number;
    savings_rate: number;
  };
  isSummaryLoading?: boolean;
}

export function AiInsightsCard({
  month,
  year,
  summary,
  isSummaryLoading = false,
}: AiInsightsCardProps) {
  const hasNoData =
    !isSummaryLoading &&
    summary !== undefined &&
    Number(summary.total_income) === 0 &&
    Number(summary.total_expense) === 0;

  const { data, isLoading, isRefetching, refetch } = useQuery<MonthlyInsightsOutput>({
    queryKey: [
      "ai-monthly-insights",
      month,
      year,
      summary?.total_income,
      summary?.total_expense,
    ],
    queryFn: async () => {
      const res = await fetch("/api/ai/monthly-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          total_income: summary?.total_income,
          total_expense: summary?.total_expense,
          net_savings: summary?.net_savings,
          savings_rate: summary?.savings_rate,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
    enabled: !hasNoData,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const loading = (isLoading || isRefetching || isSummaryLoading) && !hasNoData;

  // Tasteful empty state when no activity recorded
  if (hasNoData) {
    return (
      <div className="rounded-[20px] border border-dashed border-border/80 bg-surface/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              No transactions recorded this month
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              Log income or daily expenses to unlock AI cash flow analysis, savings health checks, and budget suggestions.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => transactionModal.open()}
          className="btn-gradient font-semibold rounded-xl text-xs h-8.5 shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span>Add First Entry</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] p-[1px] bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-border/40 shadow-xs">
      <div
        className="rounded-[19px] bg-surface p-5 sm:p-6 space-y-4"
        style={{
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
        }}
      >
        {/* Header with Title and Actions */}
        <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">
              AI Financial Insights
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-surface-elevated border border-border/60">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Private</span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="h-7 text-xs gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`h-3 w-3 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-surface-elevated/60 animate-pulse rounded-md w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="h-20 bg-surface-elevated/40 animate-pulse rounded-xl" />
              <div className="h-20 bg-surface-elevated/40 animate-pulse rounded-xl" />
              <div className="h-20 bg-surface-elevated/40 animate-pulse rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* One Summary Sentence */}
            <p className="text-sm font-medium text-foreground/90 leading-relaxed">
              {data?.summary}
            </p>

            {/* 3 Suggestion Rows */}
            {data?.suggestions && data.suggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {data.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/80 hover:border-emerald-500/30 transition-all text-xs space-y-1 group"
                  >
                    <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px]">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      <span>Observation #{idx + 1}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-[11px] group-hover:text-foreground transition-colors">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
