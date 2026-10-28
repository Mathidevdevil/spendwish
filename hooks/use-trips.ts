"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Trip } from "@/types/database";

export function useTripsList() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trips-list"],
    queryFn: async (): Promise<Trip[]> => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as Trip[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
