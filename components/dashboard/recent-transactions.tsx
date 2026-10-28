"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Receipt } from "lucide-react";
import { TransactionWithCategory } from "@/types/database";
import { useCurrency } from "@/components/providers/currency-provider";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  isLoading?: boolean;
}

export function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-card/40">
        <Receipt className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2 stroke-1" />
        <p className="text-xs font-semibold text-foreground">No recent transactions</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Your new expenses and incomes will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {transactions.slice(0, 5).map((tx) => {
        const isIncome = tx.type === "income";

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-card hover:bg-accent/40 transition-colors text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: tx.category?.color
                    ? `${tx.category.color}20`
                    : isIncome
                    ? "#10b98120"
                    : "#ef444420",
                  color: tx.category?.color || (isIncome ? "#10b981" : "#ef4444"),
                }}
              >
                {isIncome ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {tx.notes || tx.category?.name || "Transaction"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>{formatDate(tx.date, "short")}</span>
                  <span>•</span>
                  <span>{tx.payment_method}</span>
                </div>
              </div>
            </div>

            <div
              className={`font-bold tracking-tight text-right ${
                isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              {isIncome ? "+" : "-"}
              {format(tx.amount)}
            </div>
          </div>
        );
      })}

      <div className="pt-1 text-right">
        <Link
          href="/transactions"
          className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
        >
          <span>View all transactions</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
