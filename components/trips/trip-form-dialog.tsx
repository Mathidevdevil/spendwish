"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar, DollarSign, Loader2, MapPin, Plane } from "lucide-react";
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
import { tripFormSchema, type TripFormInput } from "@/schemas/trip";
import { useSaveTrip } from "@/hooks/use-trips";
import { useCurrency } from "@/components/providers/currency-provider";
import { Trip } from "@/types/database";

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Trip | null;
}

export function TripFormDialog({
  open,
  onOpenChange,
  initialData,
}: TripFormDialogProps) {
  const { currency } = useCurrency();
  const saveMutation = useSaveTrip();

  const defaultStartDate = format(new Date(), "yyyy-MM-dd");
  const defaultEndDate = format(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd"
  );

  const form = useForm<TripFormInput>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: "",
      destination: "",
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      total_budget: "" as unknown as number,
      status: "planned",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        destination: initialData.destination,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        total_budget: Number(initialData.total_budget),
        status: initialData.status,
        notes: initialData.notes || "",
      });
    } else {
      form.reset({
        name: "",
        destination: "",
        start_date: defaultStartDate,
        end_date: defaultEndDate,
        total_budget: "" as unknown as number,
        status: "planned",
        notes: "",
      });
    }
  }, [initialData, form, defaultStartDate, defaultEndDate]);

  const onSubmit = async (data: TripFormInput) => {
    try {
      await saveMutation.mutateAsync(data);
      onOpenChange(false);
      form.reset();
    } catch {
      // handled in mutation
    }
  };

  const isPending = saveMutation.isPending;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Trip Details" : "Plan a New Trip"}
      description="Track itinerary estimates and actual spending for your journey"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Trip Name */}
        <div className="space-y-1.5">
          <Label htmlFor="trip-name">Trip Name</Label>
          <div className="relative">
            <Plane className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="trip-name"
              placeholder="e.g. Goa Monsoon Getaway, Tokyo Trip"
              className="pl-9"
              {...form.register("name")}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Destination & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="trip-destination">Destination</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="trip-destination"
                placeholder="e.g. North Goa, India"
                className="pl-9"
                {...form.register("destination")}
              />
            </div>
            {form.formState.errors.destination && (
              <p className="text-xs text-destructive">
                {form.formState.errors.destination.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trip-status">Trip Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(val: any) => form.setValue("status", val)}
            >
              <SelectTrigger id="trip-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">🗓️ Planned</SelectItem>
                <SelectItem value="ongoing">🚀 Ongoing</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Start & End Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              {...form.register("start_date")}
            />
            {form.formState.errors.start_date && (
              <p className="text-xs text-destructive">
                {form.formState.errors.start_date.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="end-date">End Date</Label>
            <Input id="end-date" type="date" {...form.register("end_date")} />
            {form.formState.errors.end_date && (
              <p className="text-xs text-destructive">
                {form.formState.errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Total Budget */}
        <div className="space-y-1.5">
          <Label htmlFor="total-budget">
            Total Trip Budget ({currency === "INR" ? "₹" : "$"})
          </Label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-muted-foreground">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              id="total-budget"
              type="number"
              step="100"
              placeholder="e.g. 50000"
              className="pl-8 text-base font-semibold"
              {...form.register("total_budget", { valueAsNumber: true })}
            />
          </div>
          {form.formState.errors.total_budget && (
            <p className="text-xs text-destructive">
              {form.formState.errors.total_budget.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="trip-notes">Notes / Highlights (Optional)</Label>
          <Input
            id="trip-notes"
            placeholder="e.g. Hotel candolim, scuba booking code #8492"
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
              "Update Trip"
            ) : (
              "Create Trip"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
