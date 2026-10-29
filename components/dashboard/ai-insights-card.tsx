"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  Lightbulb,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    queryKey: ["ai-monthly-insights", month, year, summary?.total_income, summary?.total_expense],
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

  // Empty state when user has zero income and zero expenses for selected period
  if (hasNoData) {
    return (
      <Card className="rounded-2xl border-dashed border-border bg-card/50 shadow-none overflow-hidden">
        <CardContent className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm font-semibold text-foreground">
              No transactions logged for this month
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add your income and expenses to unlock AI-driven financial advice,
              savings analysis, and spending pattern recommendations.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => transactionModal.open()}
            className="rounded-xl font-semibold gap-1.5 h-9 text-xs mt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Entry</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Smart Financial Insights</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Aggregated & Private</span>
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="h-8 text-xs gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted/60 animate-pulse rounded-md w-3/4" />
            <div className="h-3 bg-muted/40 animate-pulse rounded-md w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
              <div className="h-16 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-16 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-16 bg-muted/30 animate-pulse rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground/90 leading-relaxed">
              {data?.summary}
            </p>

            {data?.suggestions && data.suggestions.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>Practical Financial Suggestions</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {data.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-card border border-border/80 shadow-xs text-xs text-foreground/80 leading-relaxed hover:border-primary/30 transition-colors"
                    >
                      <span className="font-semibold text-primary block mb-0.5">
                        Tip #{idx + 1}
                      </span>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
