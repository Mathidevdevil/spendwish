"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tripItemFormSchema, type TripItemFormInput } from "@/schemas/trip";
import { useSaveTripItem } from "@/hooks/use-trips";
import { useCurrency } from "@/components/providers/currency-provider";
import { TripItem } from "@/types/database";

interface TripItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  defaultDate?: string;
  initialData?: TripItem | null;
}

export function TripItemDialog({
  open,
  onOpenChange,
  tripId,
  defaultDate,
  initialData,
}: TripItemDialogProps) {
  const { currency } = useCurrency();
  const saveMutation = useSaveTripItem();

  const form = useForm<TripItemFormInput>({
    resolver: zodResolver(tripItemFormSchema),
    defaultValues: {
      trip_id: tripId,
      date: defaultDate || new Date().toISOString().split("T")[0],
      title: "",
      location: "",
      estimated_cost: "" as unknown as number,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.reset({
        id: initialData.id,
        trip_id: initialData.trip_id,
        date: initialData.date,
        title: initialData.title,
        location: initialData.location || "",
        estimated_cost: Number(initialData.estimated_cost),
        notes: initialData.notes || "",
      });
    } else {
      form.reset({
        trip_id: tripId,
        date: defaultDate || new Date().toISOString().split("T")[0],
        title: "",
        location: "",
        estimated_cost: "" as unknown as number,
        notes: "",
      });
    }
  }, [open, initialData, tripId, defaultDate, form]);

  const onSubmit = async (data: TripItemFormInput) => {
    try {
      await saveMutation.mutateAsync({
        ...data,
        trip_id: tripId,
      });
      onOpenChange(false);
      form.reset();
    } catch {
      // error handled in mutation
    }
  };

  const isPending = saveMutation.isPending;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Itinerary Item" : "Add Itinerary Activity"}
      description="Schedule an activity, accommodation stay, transit, or tour"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="item-title" className="text-xs font-semibold text-muted-foreground">
            Activity / Item Name
          </Label>
          <Input
            id="item-title"
            placeholder="e.g. Scuba diving, Morning Flight, Hotel Check-in"
            className="h-10 text-xs sm:text-sm rounded-xl bg-surface"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-xs text-rose-400">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="item-date" className="text-xs font-semibold text-muted-foreground">
              Date
            </Label>
            <Input
              id="item-date"
              type="date"
              className="h-10 text-xs rounded-xl bg-surface"
              {...form.register("date")}
            />
            {form.formState.errors.date && (
              <p className="text-xs text-rose-400">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-location" className="text-xs font-semibold text-muted-foreground">
              Location (Optional)
            </Label>
            <Input
              id="item-location"
              placeholder="e.g. Grand Island, Candolim Beach"
              className="h-10 text-xs sm:text-sm rounded-xl bg-surface"
              {...form.register("location")}
            />
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="space-y-1.5">
          <Label htmlFor="item-cost" className="text-xs font-semibold text-muted-foreground">
            Estimated Cost
          </Label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-lg font-bold text-muted-foreground pointer-events-none">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              id="item-cost"
              type="number"
              step="50"
              placeholder="0.00"
              className="pl-9 h-11 text-lg font-bold font-sans tabular-nums rounded-xl bg-surface"
              {...form.register("estimated_cost", { valueAsNumber: true })}
            />
          </div>
          {form.formState.errors.estimated_cost && (
            <p className="text-xs text-rose-400">
              {form.formState.errors.estimated_cost.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="item-notes" className="text-xs font-semibold text-muted-foreground">
            Notes / Confirmation (Optional)
          </Label>
          <Input
            id="item-notes"
            placeholder="e.g. PNR #6E4829, voucher in email"
            className="h-10 text-xs sm:text-sm rounded-xl bg-surface"
            {...form.register("notes")}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
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
            ) : initialData ? (
              "Update Activity"
            ) : (
              "Add Activity"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
