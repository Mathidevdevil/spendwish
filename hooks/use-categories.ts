"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types/database";
import { isDemoMode, demoStore } from "@/lib/demo-data";

export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      if (isDemoMode()) {
        return demoStore.getCategories();
      }

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          return demoStore.getCategories();
        }

        return (data || []) as Category[];
      } catch {
        return demoStore.getCategories();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
