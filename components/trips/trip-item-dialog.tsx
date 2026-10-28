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
  }, [open, initialData, tripId]);

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
      title={initialData ? "Edit Itinerary Item" : "Add Itinerary Item"}
      description="Plan an activity, hotel stay, flight or transfer with estimated cost"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="item-title">Activity / Title</Label>
          <Input
            id="item-title"
            placeholder="e.g. Scuba diving, Morning Indigo Flight, Hotel Check-in"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-date">Date</Label>
            <Input id="item-date" type="date" {...form.register("date")} />
            {form.formState.errors.date && (
              <p className="text-xs text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-location">Location (Optional)</Label>
            <Input
              id="item-location"
              placeholder="e.g. Grand Island, Candolim Beach"
              {...form.register("location")}
            />
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="space-y-1.5">
          <Label htmlFor="item-cost">
            Estimated Cost ({currency === "INR" ? "₹" : "$"})
          </Label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-muted-foreground">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              id="item-cost"
              type="number"
              step="50"
              placeholder="0.00"
              className="pl-8 font-semibold"
              {...form.register("estimated_cost", { valueAsNumber: true })}
            />
          </div>
          {form.formState.errors.estimated_cost && (
            <p className="text-xs text-destructive">
              {form.formState.errors.estimated_cost.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="item-notes">Notes / Booking Confirmation</Label>
          <Input
            id="item-notes"
            placeholder="e.g. Confirmation PNR 6E4829, check-in 2 PM"
            {...form.register("notes")}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              "Update Item"
            ) : (
              "Add to Itinerary"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
