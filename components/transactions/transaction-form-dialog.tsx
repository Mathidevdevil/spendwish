"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  Plane,
  Sparkles,
  Tag,
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
import { cn } from "@/lib/utils";

interface TransactionFormDialogProps {
  initialData?: TransactionFormInput | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTripId?: string;
}

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

  const { data: categories = [] } = useCategories();
  const { data: trips = [] } = useTripsList();
  const { currency } = useCurrency();

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen =
    setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const defaultDate = format(new Date(), "yyyy-MM-dd");

  const form = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      amount: "" as unknown as number,
      date: defaultDate,
      payment_method: "UPI",
      category_id: "",
      trip_id: defaultTripId || "",
      notes: "",
    },
  });

  const selectedType = form.watch("type");

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
            date: data.date || defaultDate,
            payment_method: data.payment_method || "UPI",
            category_id: data.category_id || "",
            trip_id: data.trip_id || defaultTripId || "",
            notes: data.notes || "",
          });
        } else {
          setEditingItem(null);
          form.reset({
            type: "expense",
            amount: "" as any,
            date: defaultDate,
            payment_method: "UPI",
            category_id: "",
            trip_id: defaultTripId || "",
            notes: "",
          });
        }
      });
      return unsubscribe;
    }
  }, [controlledOpen, defaultDate, defaultTripId, form]);

  // Update when initialData prop changes
  useEffect(() => {
    if (initialData) {
      setEditingItem(initialData);
      form.reset(initialData);
    }
  }, [initialData, form]);

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
      // error handled in mutation hook
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

      if (!res.ok) {
        throw new Error("Failed to parse receipt with AI");
      }

      const parsed = await res.json();
      if (parsed) {
        if (parsed.type) form.setValue("type", parsed.type);
        if (parsed.amount) form.setValue("amount", parsed.amount);
        if (parsed.date) form.setValue("date", parsed.date);
        if (parsed.payment_method)
          form.setValue("payment_method", parsed.payment_method);
        if (parsed.notes) form.setValue("notes", parsed.notes);

        // Try matching category
        if (parsed.suggestedCategory) {
          const match = categories.find((c) =>
            c.name.toLowerCase().includes(parsed.suggestedCategory.toLowerCase())
          );
          if (match) form.setValue("category_id", match.id);
        }

        setShowAiInput(false);
      }
    } catch (err: any) {
      // Fallback manual entry
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
          ? "Update details of this entry"
          : "Add an income or expense to your financial records"
      }
    >
      <div className="space-y-4">
        {/* AI Quick entry button if creating new */}
        {!editingItem?.id && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            {!showAiInput ? (
              <button
                type="button"
                onClick={() => setShowAiInput(true)}
                className="flex items-center justify-between w-full text-xs font-semibold text-primary hover:underline"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Try Smart AI Natural Language Entry
                </span>
                <span className="text-[11px] bg-primary/10 px-2 py-0.5 rounded-full">
                  e.g. &quot;spent 450 on dinner via UPI&quot;
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-input" className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Describe your spend
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
                    id="ai-input"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., paid 1200 for groceries yesterday via Card"
                    className="text-xs h-9 bg-background"
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
                    className="shrink-0 h-9 text-xs"
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

        {/* Transaction Type Segmented Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
          <button
            type="button"
            onClick={() => {
              form.setValue("type", "expense");
              form.setValue("category_id", "");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
              selectedType === "expense"
                ? "bg-rose-500 text-white shadow-sm"
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
              "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
              selectedType === "income"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Income
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount ({currency === "INR" ? "₹" : "$"})</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-muted-foreground">
                {currency === "INR" ? "₹" : "$"}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 text-lg font-semibold"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch("category_id") || "none"}
                onValueChange={(val) =>
                  form.setValue("category_id", val === "none" ? null : val)
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color || "#64748b" }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={form.watch("payment_method")}
                onValueChange={(val: any) =>
                  form.setValue("payment_method", val)
                }
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI (GPay / PhonePe / Paytm)</SelectItem>
                  <SelectItem value="Card">Debit / Credit Card</SelectItem>
                  <SelectItem value="Bank">Net Banking / Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-9"
                  {...form.register("date")}
                />
              </div>
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            {/* Optional Trip Association */}
            <div className="space-y-1.5">
              <Label htmlFor="trip">Tag to Trip (Optional)</Label>
              <Select
                value={form.watch("trip_id") || "none"}
                onValueChange={(val) =>
                  form.setValue("trip_id", val === "none" ? null : val)
                }
              >
                <SelectTrigger id="trip">
                  <SelectValue placeholder="Select Trip (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Regular)</SelectItem>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      ✈️ {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes / Merchant (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g. Swiggy, Amazon, Metro card recharge"
              {...form.register("notes")}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              variant={selectedType === "income" ? "emerald" : "DEFAULT"}
              className="min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingItem?.id ? (
                "Update Entry"
              ) : (
                "Add Transaction"
              )}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveDialog>
  );
}
