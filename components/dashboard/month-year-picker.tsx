"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthYearPicker({
  month,
  year,
  onChange,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const handlePrev = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-1 bg-surface border border-border/80 p-1 rounded-xl shadow-xs"
      style={{
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05), var(--inner-highlight)",
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
        title="Previous Month"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-center">
        <Select
          value={String(month)}
          onValueChange={(val) => onChange(Number(val), year)}
        >
          <SelectTrigger className="h-7 border-none bg-transparent px-2 text-xs font-semibold shadow-none focus:ring-0 text-foreground">
            <SelectValue>{MONTHS[month - 1]}</SelectValue>
          </SelectTrigger>
          <SelectContent align="start" className="bg-surface border-border/80">
            {MONTHS.map((name, idx) => (
              <SelectItem key={name} value={String(idx + 1)} className="text-xs">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(year)}
          onValueChange={(val) => onChange(month, Number(val))}
        >
          <SelectTrigger className="h-7 border-none bg-transparent px-2 text-xs font-semibold shadow-none focus:ring-0 text-muted-foreground">
            <SelectValue>{year}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end" className="bg-surface border-border/80">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)} className="text-xs">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
        title="Next Month"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
