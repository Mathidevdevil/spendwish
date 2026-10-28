"use client";

import { Download, Filter, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions by note or merchant..."
            value={filters.search || ""}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value, page: 1 })
            }
            className="pl-9 h-10"
          />
        </div>

        {/* Export & Reset */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isExportDisabled}
            className="h-10 text-xs font-semibold gap-2 rounded-xl"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-10 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Type Filter */}
        <Select
          value={filters.type || "all"}
          onValueChange={(val: any) =>
            onChange({ ...filters, type: val, page: 1 })
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
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
          <SelectTrigger className="h-9 text-xs">
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

        {/* Trip Filter */}
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
          <SelectTrigger className="h-9 text-xs">
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

        {/* Sort By */}
        <Select
          value={filters.sortBy || "date_desc"}
          onValueChange={(val: any) =>
            onChange({ ...filters, sortBy: val, page: 1 })
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="amount_desc">Highest Amount</SelectItem>
            <SelectItem value="amount_asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>

        {/* Date filter quick selector */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              onChange({ ...filters, startDate: e.target.value, page: 1 })
            }
            className="h-9 text-xs p-1.5"
            title="Start date"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              onChange({ ...filters, endDate: e.target.value, page: 1 })
            }
            className="h-9 text-xs p-1.5"
            title="End date"
          />
        </div>
      </div>
    </div>
  );
}
