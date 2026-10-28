"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Trip, TripItem, TransactionWithCategory } from "@/types/database";
import { TripFormInput, TripItemFormInput } from "@/schemas/trip";
import { toast } from "sonner";
import { isDemoMode, demoStore } from "@/lib/demo-data";

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
      if (isDemoMode()) {
        const trips = demoStore.getTrips();
        const txs = demoStore.getTransactions({ page: 1, pageSize: 1000 }).items;

        const filtered = statusFilter && statusFilter !== "all"
          ? trips.filter((t) => t.status === statusFilter)
          : trips;

        return filtered.map((t) => {
          const actual_spend = txs
            .filter((tx) => tx.trip_id === t.id && tx.type === "expense")
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
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
      }

      try {
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
        if (error) {
          const demoTrips = demoStore.getTrips();
          return demoTrips as any;
        }
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
      } catch {
        const demoTrips = demoStore.getTrips();
        return demoTrips as any;
      }
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
      if (isDemoMode()) {
        const trip = demoStore.getTripById(tripId) || demoStore.getTrips()[0];
        const itinerary = demoStore.getTripItems(trip.id);
        const expenses = demoStore.getTransactions({ tripId: trip.id, page: 1, pageSize: 1000 }).items;

        const actual_spend = expenses.reduce(
          (sum, t) => (t.type === "expense" ? sum + Number(t.amount) : sum),
          0
        );

        const itinerary_estimated_cost = itinerary.reduce(
          (sum, i) => sum + Number(i.estimated_cost),
          0
        );

        const total_budget = Number(trip.total_budget) || 0;
        const remaining_budget = total_budget - actual_spend;
        const percent_budget_used =
          total_budget > 0
            ? Math.round((actual_spend / total_budget) * 10000) / 100
            : 0;

        return {
          trip: {
            ...trip,
            actual_spend,
            itinerary_estimated_cost,
            remaining_budget,
            percent_budget_used,
          },
          expenses,
          itinerary,
        };
      }

      try {
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
      } catch {
        const trip = demoStore.getTripById(tripId) || demoStore.getTrips()[0];
        const itinerary = demoStore.getTripItems(trip.id);
        const expenses = demoStore.getTransactions({ tripId: trip.id, page: 1, pageSize: 1000 }).items;

        return {
          trip: {
            ...trip,
            actual_spend: 32700,
            itinerary_estimated_cost: 45000,
            remaining_budget: 12300,
            percent_budget_used: 72.67,
          },
          expenses,
          itinerary,
        };
      }
    },
  });
}

export function useSaveTrip() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TripFormInput) => {
      if (isDemoMode()) {
        if (input.id) {
          return demoStore.updateTrip(input.id, input);
        } else {
          return demoStore.addTrip(input);
        }
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return demoStore.addTrip(input);
        }

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
      } catch {
        return demoStore.addTrip(input);
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
      if (isDemoMode()) {
        demoStore.deleteTrip(tripId);
        return tripId;
      }

      try {
        const { error } = await supabase.from("trips").delete().eq("id", tripId);
        if (error) demoStore.deleteTrip(tripId);
        return tripId;
      } catch {
        demoStore.deleteTrip(tripId);
        return tripId;
      }
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
      if (isDemoMode()) {
        return demoStore.addTripItem(input);
      }

      try {
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
      } catch {
        return demoStore.addTripItem(input);
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
      if (isDemoMode()) {
        demoStore.deleteTripItem(id);
        return { id, tripId };
      }

      try {
        const { error } = await supabase
          .from("trip_items")
          .delete()
          .eq("id", id);
        if (error) demoStore.deleteTripItem(id);
        return { id, tripId };
      } catch {
        demoStore.deleteTripItem(id);
        return { id, tripId };
      }
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
