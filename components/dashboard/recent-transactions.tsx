"use client";

import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";
import { TransactionWithCategory } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Money } from "@/components/ui/money";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  isLoading?: boolean;
}

export function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-surface-elevated/40 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border/80 bg-surface/40 flex flex-col items-center justify-center space-y-2">
        <div className="h-9 w-9 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground border border-border/60">
          <Receipt className="h-4 w-4" />
        </div>
        <p className="text-xs font-semibold text-foreground">No recent transactions</p>
        <p className="text-[11px] text-muted-foreground">
          Transactions logged will show up in this ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 6).map((tx) => {
        const isIncome = tx.type === "income";

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-surface/60 hover:bg-surface-elevated/80 transition-colors text-xs group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <CategoryIcon
                categoryName={tx.category?.name}
                color={tx.category?.color}
                size="md"
              />

              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate max-w-[170px] sm:max-w-[220px]">
                  {tx.notes || tx.category?.name || "Transaction"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <span>{formatDate(tx.date, "short")}</span>
                  <span>•</span>
                  <span className="capitalize">{tx.payment_method}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 ml-2">
              <Money
                amount={tx.amount}
                showSign
                type={isIncome ? "income" : "expense"}
                size="sm"
              />
            </div>
          </div>
        );
      })}

      <div className="pt-1 text-right">
        <Link
          href="/transactions"
          className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
        >
          <span>All transactions</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
