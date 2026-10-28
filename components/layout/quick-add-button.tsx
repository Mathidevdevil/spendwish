"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionModal } from "@/hooks/use-transaction-modal";

export function QuickAddButton() {
  return (
    <Button
      onClick={() => transactionModal.open()}
      className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-30 h-14 w-14 rounded-full shadow-lg shadow-primary/30 p-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      aria-label="Add transaction"
      title="Quick Add Transaction"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
