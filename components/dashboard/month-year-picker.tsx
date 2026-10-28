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
    <div className="flex items-center gap-1.5 sm:gap-2 bg-card border border-border p-1 rounded-xl shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Previous Month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        <Select
          value={String(month)}
          onValueChange={(val) => onChange(Number(val), year)}
        >
          <SelectTrigger className="h-8 border-none bg-transparent px-2 text-xs font-semibold shadow-none focus:ring-0">
            <SelectValue>{MONTHS[month - 1]}</SelectValue>
          </SelectTrigger>
          <SelectContent align="start">
            {MONTHS.map((name, idx) => (
              <SelectItem key={name} value={String(idx + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(year)}
          onValueChange={(val) => onChange(month, Number(val))}
        >
          <SelectTrigger className="h-8 border-none bg-transparent px-2 text-xs font-semibold shadow-none focus:ring-0">
            <SelectValue>{year}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
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
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Next Month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
