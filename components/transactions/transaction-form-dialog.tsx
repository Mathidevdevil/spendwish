"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, subDays } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Loader2,
  Plane,
  Sparkles,
} from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/schemas/transaction";
import { useCategories } from "@/hooks/use-categories";
import { useTripsList } from "@/hooks/use-trips";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { transactionModal } from "@/hooks/use-transaction-modal";
import { useCurrency } from "@/components/providers/currency-provider";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";

interface TransactionFormDialogProps {
  initialData?: TransactionFormInput | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTripId?: string;
}

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI" },
  { id: "Card", label: "Card" },
  { id: "Cash", label: "Cash" },
  { id: "Bank", label: "NetBanking" },
];

export function TransactionFormDialog({
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultTripId,
}: TransactionFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransactionFormInput | null>(
    null
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: trips = [] } = useTripsList();
  const { currency } = useCurrency();

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen =
    setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const form = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      amount: "" as unknown as number,
      date: todayStr,
      payment_method: "UPI",
      category_id: "",
      trip_id: defaultTripId || "",
      notes: "",
    },
  });

  const selectedType = form.watch("type");
  const selectedDate = form.watch("date");
  const selectedCategory = form.watch("category_id");
  const selectedPaymentMethod = form.watch("payment_method");

  // Focus amount input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Subscribe to global modal trigger
  useEffect(() => {
    if (controlledOpen === undefined) {
      const unsubscribe = transactionModal.subscribe((open, data) => {
        setInternalOpen(open);
        if (data) {
          setEditingItem(data);
          form.reset({
            id: data.id,
            type: data.type || "expense",
            amount: Number(data.amount) || ("" as any),
            date: data.date || todayStr,
            payment_method: data.payment_method || "UPI",
            category_id: data.category_id || "",
            trip_id: data.trip_id || defaultTripId || "",
            notes: data.notes || "",
          });
          setShowCustomDate(
            data.date !== todayStr && data.date !== yesterdayStr
          );
        } else {
          setEditingItem(null);
          form.reset({
            type: "expense",
            amount: "" as any,
            date: todayStr,
            payment_method: "UPI",
            category_id: "",
            trip_id: defaultTripId || "",
            notes: "",
          });
          setShowCustomDate(false);
        }
      });
      return unsubscribe;
    }
  }, [controlledOpen, defaultTripId, form, todayStr, yesterdayStr]);

  // Update when initialData prop changes
  useEffect(() => {
    if (initialData) {
      setEditingItem(initialData);
      form.reset(initialData);
      setShowCustomDate(
        initialData.date !== todayStr && initialData.date !== yesterdayStr
      );
    }
  }, [initialData, form, todayStr, yesterdayStr]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType]
  );

  const onSubmit = async (data: TransactionFormInput) => {
    try {
      if (editingItem?.id) {
        await updateMutation.mutateAsync({
          ...data,
          id: editingItem.id,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsOpen(false);
      form.reset();
      setShowAiInput(false);
      setAiPrompt("");
    } catch {
      // handled in mutation hook
    }
  };

  // AI Natural Language Parse Handler
  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setIsAiLoading(true);
      const res = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) throw new Error("Failed to parse");

      const parsed = await res.json();
      if (parsed) {
        if (parsed.type) form.setValue("type", parsed.type);
        if (parsed.amount) form.setValue("amount", parsed.amount);
        if (parsed.date) form.setValue("date", parsed.date);
        if (parsed.payment_method)
          form.setValue("payment_method", parsed.payment_method);
        if (parsed.notes) form.setValue("notes", parsed.notes);

        if (parsed.suggestedCategory) {
          const match = categories.find((c) =>
            c.name.toLowerCase().includes(parsed.suggestedCategory.toLowerCase())
          );
          if (match) form.setValue("category_id", match.id);
        }

        setShowAiInput(false);
      }
    } catch (err: any) {
      console.warn("AI parse error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={editingItem?.id ? "Edit Transaction" : "New Transaction"}
      description={
        editingItem?.id
          ? "Update the details of this transaction"
          : "Add an income or expense to your financial records"
      }
    >
      <div className="space-y-4 pt-1">
        {/* Smart AI Entry Pill */}
        {!editingItem?.id && (
          <div className="rounded-xl border border-border/80 bg-surface-elevated/40 p-2.5">
            {!showAiInput ? (
              <button
                type="button"
                onClick={() => setShowAiInput(true)}
                className="flex items-center justify-between w-full text-xs font-semibold text-primary hover:underline"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Try Smart AI receipt / text input
                </span>
                <span className="text-[10px] text-muted-foreground bg-surface-elevated px-2 py-0.5 rounded-full border border-border/60">
                  e.g. &quot;lunch 450 via UPI&quot;
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Describe your transaction
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowAiInput(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. paid 1200 for groceries yesterday via Card"
                    className="text-xs h-9 bg-surface rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAiParse();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAiParse}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="btn-gradient shrink-0 h-9 text-xs rounded-xl font-semibold"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Parse"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. Segmented Income/Expense Switch at Top */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-elevated rounded-xl border border-border/80">
          <button
            type="button"
            onClick={() => {
              form.setValue("type", "expense");
              form.setValue("category_id", "");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
              selectedType === "expense"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("type", "income");
              form.setValue("category_id", "");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
              selectedType === "income"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Income
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 2. Large Amount Input with Currency Prefix Auto-Focused */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-semibold text-muted-foreground">
              Amount
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl sm:text-3xl font-bold text-muted-foreground pointer-events-none font-sans">
                {currency === "INR" ? "₹" : "$"}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                autoFocus
                {...form.register("amount", { valueAsNumber: true })}
                ref={(e) => {
                  form.register("amount", { valueAsNumber: true }).ref(e);
                  amountInputRef.current = e;
                }}
                className="pl-11 sm:pl-12 h-14 sm:h-16 text-2xl sm:text-3xl font-bold font-sans tabular-nums rounded-2xl bg-surface-elevated/70 border-border/80 tracking-tight"
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-xs text-rose-400 font-medium">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* 3. Category as an Icon Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Category
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-border/70 rounded-xl bg-surface-elevated/30">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => form.setValue("category_id", cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all gap-1.5 border",
                      isSelected
                        ? "bg-primary/15 border-primary/40 text-primary shadow-xs font-bold"
                        : "bg-surface hover:bg-surface-elevated border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CategoryIcon
                      categoryName={cat.name}
                      color={cat.color}
                      size="sm"
                    />
                    <span className="text-[11px] truncate w-full px-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Date Quick-Picks (Today / Yesterday / Pick) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Date
            </Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  form.setValue("date", todayStr);
                  setShowCustomDate(false);
                }}
                className={cn(
                  "flex-1 h-8 rounded-lg text-xs font-semibold border transition-all",
                  selectedDate === todayStr && !showCustomDate
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-surface-elevated border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("date", yesterdayStr);
                  setShowCustomDate(false);
                }}
                className={cn(
                  "flex-1 h-8 rounded-lg text-xs font-semibold border transition-all",
                  selectedDate === yesterdayStr && !showCustomDate
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-surface-elevated border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setShowCustomDate(true)}
                className={cn(
                  "flex-1 h-8 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1",
                  showCustomDate || (selectedDate !== todayStr && selectedDate !== yesterdayStr)
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-surface-elevated border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>Custom</span>
              </button>
            </div>

            {showCustomDate && (
              <Input
                type="date"
                className="h-9 text-xs rounded-xl bg-surface mt-1.5"
                {...form.register("date")}
              />
            )}
          </div>

          {/* 5. Payment-Method Chips */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Payment Method
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedPaymentMethod === pm.id;

                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => form.setValue("payment_method", pm.id as any)}
                    className={cn(
                      "h-8 rounded-lg text-xs font-semibold border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface-elevated border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Tag to Trip (Optional) */}
          {trips.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Link to Travel Plan (Optional)
              </Label>
              <Select
                value={form.watch("trip_id") || "none"}
                onValueChange={(val) =>
                  form.setValue("trip_id", val === "none" ? null : val)
                }
              >
                <SelectTrigger className="h-9 text-xs rounded-xl bg-surface">
                  <SelectValue placeholder="No trip linked" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/80">
                  <SelectItem value="none">No Trip</SelectItem>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id} className="text-xs">
                      ✈️ {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 7. Notes / Merchant Input */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">
              Description / Notes (Optional)
            </Label>
            <Input
              id="notes"
              placeholder="e.g. Swiggy delivery, Metro pass, Client payment"
              className="h-10 text-xs sm:text-sm rounded-xl bg-surface"
              {...form.register("notes")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-9 text-xs rounded-xl px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="btn-gradient h-9 text-xs rounded-xl font-semibold px-5 min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : editingItem?.id ? (
                "Update Entry"
              ) : (
                "Add Entry"
              )}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveDialog>
  );
}
