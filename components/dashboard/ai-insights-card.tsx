"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Lightbulb,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyInsightsOutput } from "@/schemas/ai";

interface AiInsightsCardProps {
  month: number;
  year: number;
}

export function AiInsightsCard({ month, year }: AiInsightsCardProps) {
  const { data, isLoading, isRefetching, refetch } = useQuery<MonthlyInsightsOutput>({
    queryKey: ["ai-monthly-insights", month, year],
    queryFn: async () => {
      const res = await fetch("/api/ai/monthly-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });

  const loading = isLoading || isRefetching;

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
            <div className="space-y-2 pt-2">
              <div className="h-10 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-10 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-10 bg-muted/30 animate-pulse rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground/90 leading-relaxed">
              {data?.summary}
            </p>

            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>3 Practical Suggestions</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {data?.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/80 bg-background/60 text-xs leading-relaxed text-foreground/80 flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
