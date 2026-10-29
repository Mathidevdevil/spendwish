"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { TransactionFilterInput } from "@/schemas/transaction";
import { Category, Trip } from "@/types/database";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatDate } from "@/lib/utils";

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

  // Popover open states
  const [typeOpen, setTypeOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Sync external search change
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || "")) {
        onChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const activeTrip = trips.find((t) => t.id === filters.tripId);

  const activeFilterCount = [
    filters.type && filters.type !== "all",
    filters.categoryId,
    filters.tripId,
    filters.startDate,
    filters.endDate,
    filters.search,
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

  const handleQuickMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    onChange({
      ...filters,
      startDate: `${y}-${m}-01`,
      endDate: `${y}-${m}-${lastDay}`,
      page: 1,
    });
    setDateOpen(false);
  };

  return (
    <div
      className="rounded-[20px] border border-border/80 bg-surface p-4 sm:p-5 space-y-3.5 shadow-xs"
      style={{
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
      }}
    >
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, merchants, or tags..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 pr-8 h-10 w-full text-xs sm:text-sm rounded-xl bg-surface-elevated/70 border-border/80"
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

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Filter Sheet Trigger */}
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

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isExportDisabled}
            className="h-10 text-xs font-semibold gap-2 rounded-xl px-3 border-border/80"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          {/* Reset button: Appears ONLY when filters are active */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-10 text-xs font-semibold text-muted-foreground hover:text-rose-400 gap-1.5 px-2.5 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Horizontally Scrollable Pill Filters (Desktop & Tablet) */}
      <div
        data-lenis-prevent="true"
        className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {/* Type Pill Filter */}
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 rounded-full text-xs font-semibold gap-1.5 px-3 border-border/80 ${
                filters.type && filters.type !== "all"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-elevated/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>
                Type:{" "}
                {filters.type === "expense"
                  ? "Expenses"
                  : filters.type === "income"
                  ? "Incomes"
                  : "All"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                onChange({ ...filters, type: "all", page: 1 });
                setTypeOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !filters.type || filters.type === "all"
                  ? "bg-primary/15 text-primary font-bold"
                  : "hover:bg-surface-elevated text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ ...filters, type: "expense", page: 1 });
                setTypeOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.type === "expense"
                  ? "bg-primary/15 text-primary font-bold"
                  : "hover:bg-surface-elevated text-foreground"
              }`}
            >
              Expenses Only
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ ...filters, type: "income", page: 1 });
                setTypeOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.type === "income"
                  ? "bg-primary/15 text-primary font-bold"
                  : "hover:bg-surface-elevated text-foreground"
              }`}
            >
              Incomes Only
            </button>
          </PopoverContent>
        </Popover>

        {/* Category Pill Filter */}
        <Popover open={catOpen} onOpenChange={setCatOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 rounded-full text-xs font-semibold gap-1.5 px-3 border-border/80 ${
                activeCategory
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-elevated/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Category: {activeCategory ? activeCategory.name : "All"}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2 max-h-60 overflow-y-auto space-y-1">
            <button
              type="button"
              onClick={() => {
                onChange({ ...filters, categoryId: undefined, page: 1 });
                setCatOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !filters.categoryId
                  ? "bg-primary/15 text-primary font-bold"
                  : "hover:bg-surface-elevated text-foreground"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange({ ...filters, categoryId: c.id, page: 1 });
                  setCatOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.categoryId === c.id
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-surface-elevated text-foreground"
                }`}
              >
                <CategoryIcon categoryName={c.name} color={c.color} size="sm" />
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Trip Pill Filter */}
        <Popover open={tripOpen} onOpenChange={setTripOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 rounded-full text-xs font-semibold gap-1.5 px-3 border-border/80 ${
                activeTrip
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-elevated/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Trip: {activeTrip ? activeTrip.name : "All"}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2 max-h-60 overflow-y-auto space-y-1">
            <button
              type="button"
              onClick={() => {
                onChange({ ...filters, tripId: undefined, page: 1 });
                setTripOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !filters.tripId
                  ? "bg-primary/15 text-primary font-bold"
                  : "hover:bg-surface-elevated text-foreground"
              }`}
            >
              All Trips
            </button>
            {trips.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange({ ...filters, tripId: t.id, page: 1 });
                  setTripOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.tripId === t.id
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-surface-elevated text-foreground"
                }`}
              >
                <span>✈️</span>
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Date Range Pill Filter */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 rounded-full text-xs font-semibold gap-1.5 px-3 border-border/80 ${
                filters.startDate || filters.endDate
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-elevated/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>
                {filters.startDate || filters.endDate
                  ? `${filters.startDate || "Start"} → ${filters.endDate || "End"}`
                  : "Date: Any"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Date Range</span>
              <button
                type="button"
                onClick={handleQuickMonth}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                This Month
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">From</Label>
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
                  className="h-8 text-xs px-2"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">To</Label>
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
                  className="h-8 text-xs px-2"
                />
              </div>
            </div>
            {(filters.startDate || filters.endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange({
                    ...filters,
                    startDate: undefined,
                    endDate: undefined,
                    page: 1,
                  });
                  setDateOpen(false);
                }}
                className="w-full h-7 text-xs text-muted-foreground hover:text-rose-400"
              >
                Clear Date Filter
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Sort Pill Filter */}
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full text-xs font-semibold gap-1.5 px-3 border-border/80 bg-surface-elevated/60 text-muted-foreground hover:text-foreground"
            >
              <span>
                Sort:{" "}
                {filters.sortBy === "date_asc"
                  ? "Oldest"
                  : filters.sortBy === "amount_desc"
                  ? "Highest"
                  : filters.sortBy === "amount_asc"
                  ? "Lowest"
                  : "Newest"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2 space-y-1">
            {[
              { id: "date_desc", label: "Newest First" },
              { id: "date_asc", label: "Oldest First" },
              { id: "amount_desc", label: "Highest Amount" },
              { id: "amount_asc", label: "Lowest Amount" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChange({ ...filters, sortBy: s.id as any, page: 1 });
                  setSortOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.sortBy === s.id || (!filters.sortBy && s.id === "date_desc")
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-surface-elevated text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Removable Chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/50 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Active:
          </span>

          {filters.type && filters.type !== "all" && (
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[11px] font-medium rounded-full bg-surface-elevated border-border"
            >
              <span>Type: {filters.type}</span>
              <button
                onClick={() => onChange({ ...filters, type: "all", page: 1 })}
                className="hover:text-rose-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {activeCategory && (
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[11px] font-medium rounded-full bg-surface-elevated border-border"
            >
              <span>Cat: {activeCategory.name}</span>
              <button
                onClick={() =>
                  onChange({ ...filters, categoryId: undefined, page: 1 })
                }
                className="hover:text-rose-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {activeTrip && (
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[11px] font-medium rounded-full bg-surface-elevated border-border"
            >
              <span>Trip: {activeTrip.name}</span>
              <button
                onClick={() =>
                  onChange({ ...filters, tripId: undefined, page: 1 })
                }
                className="hover:text-rose-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.startDate || filters.endDate) && (
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[11px] font-medium rounded-full bg-surface-elevated border-border"
            >
              <span>
                {filters.startDate || "*"} to {filters.endDate || "*"}
              </span>
              <button
                onClick={() =>
                  onChange({
                    ...filters,
                    startDate: undefined,
                    endDate: undefined,
                    page: 1,
                  })
                }
                className="hover:text-rose-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.search && (
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[11px] font-medium rounded-full bg-surface-elevated border-border"
            >
              <span>"{filters.search}"</span>
              <button
                onClick={() => {
                  setLocalSearch("");
                  onChange({ ...filters, search: "", page: 1 });
                }}
                className="hover:text-rose-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

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
            <Label className="text-xs font-semibold">Transaction Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: "All" },
                { id: "expense", label: "Expense" },
                { id: "income", label: "Income" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange({ ...filters, type: t.id as any, page: 1 })}
                  className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                    (filters.type || "all") === t.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-elevated border-border text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              <button
                type="button"
                onClick={() => onChange({ ...filters, categoryId: undefined, page: 1 })}
                className={`p-2 rounded-xl text-xs font-medium border text-left truncate ${
                  !filters.categoryId
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-surface-elevated border-border text-foreground"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange({ ...filters, categoryId: c.id, page: 1 })}
                  className={`p-2 rounded-xl text-xs font-medium border text-left truncate flex items-center gap-1.5 ${
                    filters.categoryId === c.id
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-surface-elevated border-border text-foreground"
                  }`}
                >
                  <CategoryIcon categoryName={c.name} color={c.color} size="sm" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">From Date</Label>
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
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">To Date</Label>
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
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 rounded-xl text-xs"
              onClick={handleReset}
            >
              Reset All
            </Button>
            <Button
              type="button"
              className="btn-gradient flex-1 h-10 rounded-xl text-xs font-semibold"
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
