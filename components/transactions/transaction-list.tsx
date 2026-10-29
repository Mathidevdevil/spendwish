"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Edit2,
  MoreVertical,
  Plane,
  Receipt,
  Trash2,
} from "lucide-react";
import { TransactionWithCategory } from "@/types/database";
import { useCurrency } from "@/components/providers/currency-provider";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";
import { useDeleteTransaction } from "@/hooks/use-transactions";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Money } from "@/components/ui/money";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

function PaymentMethodBadge({ method }: { method: string }) {
  const norm = method.toLowerCase();
  let badgeStyle = "bg-surface-elevated text-muted-foreground border-border/80";

  if (norm.includes("upi")) {
    badgeStyle = "bg-purple-500/10 text-purple-400 border-purple-500/20";
  } else if (norm.includes("card") || norm.includes("credit") || norm.includes("debit")) {
    badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  } else if (norm.includes("cash")) {
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (norm.includes("bank") || norm.includes("net")) {
    badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle}`}
    >
      {method}
    </span>
  );
}

function formatDateHeader(dateStr: string): string {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().split("T")[0];

    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formattedDayMonth = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;

    if (dateStr === todayStr) {
      return `Today, ${formattedDayMonth}`;
    }
    if (dateStr === yestStr) {
      return `Yesterday, ${formattedDayMonth}`;
    }
    return `${dayNames[dateObj.getDay()]}, ${formattedDayMonth}`;
  } catch {
    return dateStr;
  }
}

export function TransactionList({
  transactions,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  isLoading,
}: TransactionListProps) {
  const { format } = useCurrency();
  const deleteMutation = useDeleteTransaction();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] =
    useState<TransactionWithCategory | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // handled in mutation
    }
  };

  // Group transactions by date headers ("Today", "Yesterday", "Mon, 26 Oct")
  const dateGroups = useMemo(() => {
    const groupsMap = new Map<string, TransactionWithCategory[]>();
    transactions.forEach((tx) => {
      const d = tx.date;
      if (!groupsMap.has(d)) {
        groupsMap.set(d, []);
      }
      groupsMap.get(d)!.push(tx);
    });

    return Array.from(groupsMap.entries()).map(([dateStr, items]) => {
      const dailyNet = items.reduce(
        (sum, t) => (t.type === "income" ? sum + Number(t.amount) : sum - Number(t.amount)),
        0
      );

      return {
        dateStr,
        headerLabel: formatDateHeader(dateStr),
        dailyNet,
        items,
      };
    });
  }, [transactions]);

  // Current filter summary totals for sticky bottom bar
  const summaryTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      else expense += Number(t.amount);
    });
    return {
      income,
      expense,
      net: income - expense,
      count: transactions.length,
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((g) => (
          <div key={g} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-[20px] border border-border/80 bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px] border border-dashed border-border/80 bg-surface/40">
        <div className="h-14 w-14 rounded-2xl bg-surface-elevated border border-border/60 flex items-center justify-center text-muted-foreground mb-3">
          <Receipt className="h-7 w-7 text-primary stroke-1" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No transactions found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No records match your selected filter criteria. Try clearing filters or log a new entry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-16">
      {/* Date-Grouped Transactions List */}
      <div className="space-y-6">
        {dateGroups.map((group) => (
          <div key={group.dateStr} className="space-y-2">
            {/* Date Group Header with Daily Total on Right */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-foreground tracking-tight">
                {group.headerLabel}
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-[11px]">Daily total:</span>
                <span
                  className={`font-semibold font-sans tabular-nums text-xs ${
                    group.dailyNet > 0
                      ? "text-emerald-400"
                      : group.dailyNet < 0
                      ? "text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {group.dailyNet > 0 ? "+" : ""}
                  {format(group.dailyNet)}
                </span>
              </div>
            </div>

            {/* Transaction Cards for this Date */}
            <div className="space-y-2">
              {group.items.map((tx) => {
                const isIncome = tx.type === "income";

                return (
                  <div
                    key={tx.id}
                    onClick={() => setEditingTarget(tx)}
                    className="p-3.5 sm:p-4 rounded-[18px] border border-border/80 bg-surface hover:border-border transition-all shadow-xs cursor-pointer group flex items-center justify-between gap-3"
                    style={{
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05), var(--inner-highlight)",
                    }}
                  >
                    {/* Left: Category Icon, Title, Notes & Badges */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <CategoryIcon
                        categoryName={tx.category?.name}
                        color={tx.category?.color}
                        size="md"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {tx.notes || tx.category?.name || "Transaction"}
                          </span>

                          {tx.trip && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-2 py-0 h-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 gap-1 font-semibold shrink-0 rounded-full"
                            >
                              <Plane className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[90px]">{tx.trip.name}</span>
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <PaymentMethodBadge method={tx.payment_method} />
                          {tx.notes && tx.category?.name && (
                            <span className="text-muted-foreground/80 truncate hidden sm:inline">
                              {tx.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <Money
                          amount={tx.amount}
                          showSign
                          type={isIncome ? "income" : "expense"}
                          size="md"
                        />
                      </div>

                      {/* Desktop Hover Actions */}
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTarget(tx);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(tx.id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-rose-400 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>

                      {/* Mobile Actions Dropdown */}
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl bg-surface border-border/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => setEditingTarget(tx)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTargetId(tx.id)}
                              className="cursor-pointer gap-2 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 px-1 text-xs text-muted-foreground">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-2.5 text-xs rounded-xl border-border/80"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="font-semibold px-2 text-foreground font-sans tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 text-xs rounded-xl border-border/80"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Summary Bar Showing Totals of Current Filter */}
      <div
        className="sticky bottom-4 z-20 backdrop-blur-md bg-surface/90 border border-border/80 rounded-[20px] p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 max-w-2xl mx-auto"
        style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), var(--inner-highlight)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Filtered Total
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
            {summaryTotals.count} entries
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
            <span className="text-[11px] text-muted-foreground">In:</span>
            <span className="font-bold font-sans tabular-nums">{format(summaryTotals.income)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-rose-400">
            <span className="text-[11px] text-muted-foreground">Out:</span>
            <span className="font-bold font-sans tabular-nums">{format(summaryTotals.expense)}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-border/60 pl-3">
            <span className="text-[11px] text-muted-foreground">Net:</span>
            <span
              className={`font-bold font-sans tabular-nums text-sm ${
                summaryTotals.net >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {summaryTotals.net >= 0 ? "+" : ""}
              {format(summaryTotals.net)}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Edit Dialog */}
      {editingTarget && (
        <TransactionFormDialog
          open={!!editingTarget}
          onOpenChange={(open) => !open && setEditingTarget(null)}
          initialData={{
            id: editingTarget.id,
            type: editingTarget.type,
            amount: Number(editingTarget.amount),
            date: editingTarget.date,
            payment_method: editingTarget.payment_method,
            category_id: editingTarget.category_id,
            trip_id: editingTarget.trip_id,
            notes: editingTarget.notes,
          }}
        />
      )}
    </div>
  );
}
