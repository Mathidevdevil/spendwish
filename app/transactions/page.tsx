"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useTripsList } from "@/hooks/use-trips";
import { TransactionFilterInput } from "@/schemas/transaction";
import { exportTransactionsToCSV } from "@/lib/csv-export";
import { transactionModal } from "@/hooks/use-transaction-modal";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilterInput>({
    type: "all",
    categoryId: undefined,
    tripId: undefined,
    search: "",
    startDate: undefined,
    endDate: undefined,
    sortBy: "date_desc",
    page: 1,
    pageSize: 15,
  });

  const { data: txData, isLoading } = useTransactions(filters);
  const { data: categories = [] } = useCategories();
  const { data: trips = [] } = useTripsList();

  const transactions = txData?.items || [];
  const totalCount = txData?.totalCount || 0;

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      transactions,
      `spendwise-transactions-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Transactions
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage your daily expenses, incomes, and travel spending
            </p>
          </div>

          <Button
            onClick={() => transactionModal.open()}
            className="rounded-xl gap-2 font-semibold shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
          trips={trips}
          onExport={handleExportCSV}
          isExportDisabled={transactions.length === 0}
        />

        {/* Transactions List */}
        <TransactionList
          transactions={transactions}
          totalCount={totalCount}
          currentPage={filters.page || 1}
          pageSize={filters.pageSize || 15}
          onPageChange={(newPage) => setFilters({ ...filters, page: newPage })}
          isLoading={isLoading}
        />
      </div>
    </AppShell>
  );
}
