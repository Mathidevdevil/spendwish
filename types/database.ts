export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = "income" | "expense";
export type PaymentMethod = "Cash" | "UPI" | "Card" | "Bank";
export type TripStatus = "planned" | "ongoing" | "completed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: TransactionType;
          color: string | null;
          icon: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: TransactionType;
          color?: string | null;
          icon?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: TransactionType;
          color?: string | null;
          icon?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          destination: string;
          start_date: string;
          end_date: string;
          total_budget: number;
          status: TripStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          destination: string;
          start_date: string;
          end_date: string;
          total_budget?: number;
          status?: TripStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          destination?: string;
          start_date?: string;
          end_date?: string;
          total_budget?: number;
          status?: TripStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_items: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          date: string;
          title: string;
          location: string | null;
          estimated_cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          date: string;
          title: string;
          location?: string | null;
          estimated_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          date?: string;
          title?: string;
          location?: string | null;
          estimated_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          trip_id: string | null;
          type: TransactionType;
          amount: number;
          date: string;
          payment_method: PaymentMethod;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          trip_id?: string | null;
          type: TransactionType;
          amount: number;
          date?: string;
          payment_method: PaymentMethod;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          trip_id?: string | null;
          type?: TransactionType;
          amount?: number;
          date?: string;
          payment_method?: PaymentMethod;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          month?: number;
          year?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_monthly_summary: {
        Args: {
          p_user_id: string;
          p_month: number;
          p_year: number;
        };
        Returns: {
          total_income: number;
          total_expense: number;
          net_savings: number;
          savings_rate: number;
        }[];
      };
      get_category_breakdown: {
        Args: {
          p_user_id: string;
          p_month: number;
          p_year: number;
        };
        Returns: {
          category_id: string;
          category_name: string;
          category_color: string;
          category_icon: string;
          total_amount: number;
          percentage: number;
        }[];
      };
      get_six_month_trend: {
        Args: {
          p_user_id: string;
          p_end_date?: string;
        };
        Returns: {
          month_label: string;
          month_num: number;
          year_num: number;
          total_income: number;
          total_expense: number;
        }[];
      };
      get_daily_spend: {
        Args: {
          p_user_id: string;
          p_month: number;
          p_year: number;
        };
        Returns: {
          day: number;
          date: string;
          total_expense: number;
        }[];
      };
      get_trip_summary: {
        Args: {
          p_user_id: string;
          p_trip_id: string;
        };
        Returns: {
          trip_id: string;
          name: string;
          destination: string;
          start_date: string;
          end_date: string;
          status: TripStatus;
          total_budget: number;
          itinerary_estimated_cost: number;
          actual_spend: number;
          remaining_budget: number;
          percent_budget_used: number;
        }[];
      };
    };
  };
}

// Convenient helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;
export type Budget = Tables<"budgets">;
export type Trip = Tables<"trips">;
export type TripItem = Tables<"trip_items">;

export type TransactionWithCategory = Transaction & {
  category: Pick<Category, "id" | "name" | "color" | "icon"> | null;
  trip: Pick<Trip, "id" | "name" | "destination"> | null;
};

export type BudgetWithCategory = Budget & {
  category: Pick<Category, "id" | "name" | "color" | "icon">;
  spent: number;
  percentage: number;
};
