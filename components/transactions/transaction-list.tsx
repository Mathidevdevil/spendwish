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

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

function PaymentMethodChip({ method }: { method: string }) {
  const norm = method.toLowerCase();
  let colorClass = "bg-secondary text-secondary-foreground border-border";
  if (norm.includes("upi")) {
    colorClass =
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  } else if (
    norm.includes("card") ||
    norm.includes("credit") ||
    norm.includes("debit")
  ) {
    colorClass =
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  } else if (norm.includes("cash")) {
    colorClass =
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (norm.includes("bank") || norm.includes("net")) {
    colorClass =
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${colorClass}`}
    >
      {method}
    </span>
  );
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

  // Group transactions by date for mobile view
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: TransactionWithCategory[] } = {};
    transactions.forEach((tx) => {
      const d = tx.date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });
    return groups;
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <Receipt className="h-7 w-7 stroke-1" />
        </div>
        <h3 className="text-base font-semibold">No transactions found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No records match your selected filter criteria. Try clearing filters
          or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Desktop View: Full-featured Table with Sticky Header & Alternating Row Hover */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-muted/70 backdrop-blur-sm z-10 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Notes</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transactions.map((tx, idx) => {
                const isIncome = tx.type === "income";

                return (
                  <tr
                    key={tx.id}
                    className={`group hover:bg-accent/40 transition-colors ${
                      idx % 2 === 1 ? "bg-muted/15" : "bg-card"
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                      {formatDate(tx.date, "short")}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: tx.category?.color
                              ? `${tx.category.color}20`
                              : isIncome
                              ? "#10b98120"
                              : "#ef444420",
                            color:
                              tx.category?.color ||
                              (isIncome ? "#10b981" : "#ef4444"),
                          }}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-xs">
                          {tx.category?.name || "Uncategorized"}
                        </span>
                      </div>
                    </td>

                    {/* Description & Trip Tag */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-foreground/90 truncate max-w-[200px]">
                          {tx.notes || (
                            <span className="text-muted-foreground italic">
                              No notes
                            </span>
                          )}
                        </span>
                        {tx.trip && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 gap-1 font-medium shrink-0"
                          >
                            <Plane className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[90px]">
                              {tx.trip.name}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Payment Method Chip */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PaymentMethodChip method={tx.payment_method} />
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <span
                        className={`font-bold font-mono tabular-nums text-sm ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {format(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTarget(tx)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(tx.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Mobile View: Clean Transaction Cards Grouped by Date with Tap-to-Edit */}
      <div className="md:hidden space-y-4">
        {Object.entries(groupedByDate).map(([dateStr, items]) => (
          <div key={dateStr} className="space-y-2">
            {/* Date Group Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {formatDate(dateStr, "medium")}
              </span>
              <span className="text-[11px] text-muted-foreground/70 font-mono tabular-nums">
                {items.length} {items.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {/* Cards for Date */}
            <div className="space-y-2">
              {items.map((tx) => {
                const isIncome = tx.type === "income";

                return (
                  <div
                    key={tx.id}
                    onClick={() => setEditingTarget(tx)}
                    className="p-3.5 rounded-2xl border border-border bg-card active:scale-[0.99] transition-transform shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Icon & Category info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: tx.category?.color
                              ? `${tx.category.color}20`
                              : isIncome
                              ? "#10b98120"
                              : "#ef444420",
                            color:
                              tx.category?.color ||
                              (isIncome ? "#10b981" : "#ef4444"),
                          }}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {tx.category?.name || "Uncategorized"}
                            </span>
                            {tx.trip && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-3.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-medium"
                              >
                                {tx.trip.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <PaymentMethodChip method={tx.payment_method} />
                            {tx.notes && (
                              <span className="truncate max-w-[140px] text-foreground/80">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions menu */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`font-bold text-sm font-mono tabular-nums text-right ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {format(tx.amount)}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => setEditingTarget(tx)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTargetId(tx.id)}
                              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
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
              className="h-8 px-2 text-xs rounded-xl"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="font-semibold px-2 text-foreground font-mono tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2 text-xs rounded-xl"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
