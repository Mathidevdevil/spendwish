"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Download,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { TransactionFilterInput } from "@/schemas/transaction";
import { Category, Trip } from "@/types/database";

interface TransactionFiltersProps {
  filters: TransactionFilterInput;
  onChange: (newFilters: TransactionFilterInput) => void;
  categories: Category[];
  trips: Trip[];
  onExport: () => void;
  isExportDisabled?: boolean;
}

export function TransactionFilters({
  filters,
  onChange,
  categories,
  trips,
  onExport,
  isExportDisabled = false,
}: TransactionFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  // Sync external filter changes to local state
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Debounce search input by 300ms to eliminate excessive refetches
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || "")) {
        onChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const activeFilterCount = [
    filters.type && filters.type !== "all",
    filters.categoryId,
    filters.tripId,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  const handleReset = () => {
    onChange({
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
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* Top Bar: Search, Mobile Filters toggle, Export, Reset */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes or merchants..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-10 w-full"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onChange({ ...filters, search: "", page: 1 });
              }}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Filter Toggle Button */}
          <Button
            type="button"
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden h-10 text-xs font-semibold gap-1.5 rounded-xl px-3"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isExportDisabled}
            className="h-10 text-xs font-semibold gap-2 rounded-xl px-3"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-10 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 px-2.5"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Desktop/Tablet Filter Grid (Hidden on Mobile) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Type Filter */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground font-medium">Type</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(val: any) =>
              onChange({ ...filters, type: val, page: 1 })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="expense">Expenses Only</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground font-medium">Category</Label>
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                categoryId: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trip Filter */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground font-medium">Trip Tag</Label>
          <Select
            value={filters.tripId || "all"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                tripId: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full">
              <SelectValue placeholder="All Trips" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trips</SelectItem>
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  ✈️ {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground font-medium">Sort</Label>
          <Select
            value={filters.sortBy || "date_desc"}
            onValueChange={(val: any) =>
              onChange({ ...filters, sortBy: val, page: 1 })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest First</SelectItem>
              <SelectItem value="date_asc">Oldest First</SelectItem>
              <SelectItem value="amount_desc">Highest Amount</SelectItem>
              <SelectItem value="amount_asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground font-medium">From Date</Label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              onChange({ ...filters, startDate: e.target.value || undefined, page: 1 })
            }
            className="h-9 text-xs px-2 w-full"
            aria-label="Start date"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground font-medium">To Date</Label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              onChange({ ...filters, endDate: e.target.value || undefined, page: 1 })
            }
            className="h-9 text-xs px-2 w-full"
            aria-label="End date"
          />
        </div>
      </div>

      {/* Mobile Filters Sheet/Drawer */}
      <ResponsiveDialog
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        title="Filter Transactions"
        description="Filter your transactions ledger by type, category, trip, or date range."
      >
        <div className="space-y-4 py-2">
          {/* Type Filter */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Transaction Type</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(val: any) =>
                onChange({ ...filters, type: val, page: 1 })
              }
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(val) =>
                onChange({
                  ...filters,
                  categoryId: val === "all" ? undefined : val,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trip Filter */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Trip</Label>
            <Select
              value={filters.tripId || "all"}
              onValueChange={(val) =>
                onChange({
                  ...filters,
                  tripId: val === "all" ? undefined : val,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="All Trips" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                {trips.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    ✈️ {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Sort Order</Label>
            <Select
              value={filters.sortBy || "date_desc"}
              onValueChange={(val: any) =>
                onChange({ ...filters, sortBy: val, page: 1 })
              }
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="amount_desc">Highest Amount First</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">From Date</Label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    startDate: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">To Date</Label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    endDate: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={handleReset}
            >
              Reset All
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 font-semibold"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
