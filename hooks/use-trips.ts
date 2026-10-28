"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Trip, TripItem, TransactionWithCategory } from "@/types/database";
import { TripFormInput, TripItemFormInput } from "@/schemas/trip";
import { toast } from "sonner";

export interface TripWithSpend extends Trip {
  actual_spend: number;
  itinerary_estimated_cost: number;
  remaining_budget: number;
  percent_budget_used: number;
}

export const useTripsList = useTrips;

export function useTrips(statusFilter: string = "all") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trips", statusFilter],
    queryFn: async (): Promise<TripWithSpend[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("trips")
        .select("*")
        .order("start_date", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      const { data: trips, error } = await query;
      if (error) throw new Error(error.message);
      const tripRows = (trips || []) as Trip[];
      if (tripRows.length === 0) return [];

      // Calculate actual spend for each trip
      const tripIds = tripRows.map((t) => t.id);
      const { data: txs } = await supabase
        .from("transactions")
        .select("trip_id, amount")
        .in("trip_id", tripIds)
        .eq("type", "expense");

      const spendMap = new Map<string, number>();
      const rows = (txs || []) as Array<{ trip_id: string | null; amount: number }>;
      rows.forEach((tx) => {
        if (tx.trip_id) {
          const current = spendMap.get(tx.trip_id) || 0;
          spendMap.set(tx.trip_id, current + Number(tx.amount));
        }
      });

      return tripRows.map((t) => {
        const actual_spend = spendMap.get(t.id) || 0;
        const total_budget = Number(t.total_budget) || 0;
        const remaining_budget = total_budget - actual_spend;
        const percent_budget_used =
          total_budget > 0
            ? Math.round((actual_spend / total_budget) * 10000) / 100
            : 0;

        return {
          ...t,
          actual_spend,
          itinerary_estimated_cost: 0,
          remaining_budget,
          percent_budget_used,
        };
      });
    },
  });
}

export function useTripDetail(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trip-detail", tripId],
    queryFn: async (): Promise<{
      trip: TripWithSpend;
      expenses: TransactionWithCategory[];
      itinerary: TripItem[];
    }> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 1. Fetch Trip
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      const tripRow = trip as Trip | null;
      if (tripErr || !tripRow) throw new Error(tripErr?.message || "Trip not found");

      // 2. Fetch Trip Items (Itinerary)
      const { data: itinerary = [] } = await supabase
        .from("trip_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: true });

      // 3. Fetch Trip Transactions
      const { data: expenses = [] } = await supabase
        .from("transactions")
        .select(
          `
          *,
          category:categories(id, name, color, icon),
          trip:trips(id, name, destination)
        `
        )
        .eq("trip_id", tripId)
        .order("date", { ascending: false });

      const expenseRows = (expenses || []) as unknown as TransactionWithCategory[];
      const itineraryRows = (itinerary || []) as TripItem[];

      // Calculate totals
      const actual_spend = expenseRows.reduce(
        (sum, t) => (t.type === "expense" ? sum + Number(t.amount) : sum),
        0
      );

      const itinerary_estimated_cost = itineraryRows.reduce(
        (sum, i) => sum + Number(i.estimated_cost),
        0
      );

      const total_budget = Number(tripRow.total_budget) || 0;
      const remaining_budget = total_budget - actual_spend;
      const percent_budget_used =
        total_budget > 0
          ? Math.round((actual_spend / total_budget) * 10000) / 100
          : 0;

      const tripWithSpend: TripWithSpend = {
        ...tripRow,
        actual_spend,
        itinerary_estimated_cost,
        remaining_budget,
        percent_budget_used,
      };

      return {
        trip: tripWithSpend,
        expenses: (expenses || []) as unknown as TransactionWithCategory[],
        itinerary: (itinerary || []) as TripItem[],
      };
    },
  });
}

export function useSaveTrip() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TripFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const payload = {
        user_id: user.id,
        name: input.name,
        destination: input.destination,
        start_date: input.start_date,
        end_date: input.end_date,
        total_budget: input.total_budget,
        status: input.status,
        notes: input.notes || null,
      };

      if (input.id) {
        const { data, error } = await (supabase
          .from("trips") as any)
          .update(payload)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as Trip;
      } else {
        const { data, error } = await (supabase
          .from("trips") as any)
          .insert(payload)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as Trip;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips-list"] });
      queryClient.invalidateQueries({ queryKey: ["trip-detail", data.id] });
      toast.success("Trip saved successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save trip");
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) throw new Error(error.message);
      return tripId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips-list"] });
      toast.success("Trip deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete trip");
    },
  });
}

// Itinerary item mutations
export function useSaveTripItem() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TripItemFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const payload = {
        trip_id: input.trip_id,
        user_id: user.id,
        date: input.date,
        title: input.title,
        location: input.location || null,
        estimated_cost: input.estimated_cost,
        notes: input.notes || null,
      };

      if (input.id) {
        const { data, error } = await (supabase
          .from("trip_items") as any)
          .update(payload)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as TripItem;
      } else {
        const { data, error } = await (supabase
          .from("trip_items") as any)
          .insert(payload)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as TripItem;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trip-detail", data.trip_id] });
      toast.success("Itinerary item saved");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save itinerary item");
    },
  });
}

export function useDeleteTripItem() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const { error } = await supabase
        .from("trip_items")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id, tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({ queryKey: ["trip-detail", tripId] });
      toast.success("Itinerary item deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete itinerary item");
    },
  });
}
