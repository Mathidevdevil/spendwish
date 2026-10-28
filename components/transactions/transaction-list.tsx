"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit2,
  Inbox,
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
          No records match your selected filter criteria. Try clearing filters or
          add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";

          return (
            <div
              key={tx.id}
              className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors shadow-sm"
            >
              {/* Left Column: Icon & Info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
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
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate text-foreground">
                      {tx.category?.name || "Uncategorized"}
                    </span>

                    {/* Trip Tag */}
                    {tx.trip && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0 h-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 gap-1 font-medium"
                      >
                        <Plane className="h-2.5 w-2.5" />
                        <span className="truncate max-w-[100px]">
                          {tx.trip.name}
                        </span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span>{formatDate(tx.date, "short")}</span>
                    <span>•</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-[11px] font-medium">
                      {tx.payment_method}
                    </span>
                    {tx.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[180px] sm:max-w-xs text-foreground/80 italic">
                          &quot;{tx.notes}&quot;
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Amount & Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                <div className="text-right">
                  <div
                    className={`font-bold text-sm sm:text-base tracking-tight ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {format(tx.amount)}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    {tx.type}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
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
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-foreground">
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
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="font-semibold px-2 text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2 text-xs"
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
