import {
  Category,
  Transaction,
  TransactionWithCategory,
  Budget,
  BudgetWithCategory,
  Trip,
  TripItem,
} from "@/types/database";
import { TransactionFilterInput, TransactionFormInput } from "@/schemas/transaction";
import { BudgetFormInput } from "@/schemas/budget";
import { TripFormInput, TripItemFormInput } from "@/schemas/trip";
import {
  MonthlySummary,
  CategoryBreakdownItem,
  SixMonthTrendItem,
  DailySpendItem,
} from "@/hooks/use-dashboard";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const isDemoUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("spendwise-demo.supabase.co");
  const hasDemoCookie = document.cookie.includes("spendwise_demo_session=true");
  const hasDemoStorage = localStorage.getItem("spendwise_demo_session") === "true";
  return Boolean(isDemoUrl || hasDemoCookie || hasDemoStorage);
}

export function enableDemoMode(
  email: string = "demo@spendwise.app",
  name: string = "Aarav Sharma"
) {
  if (typeof window !== "undefined") {
    localStorage.setItem("spendwise_demo_session", "true");
    document.cookie = "spendwise_demo_session=true; path=/; max-age=2592000; SameSite=Lax";
    document.cookie = `spendwise_user_email=${encodeURIComponent(email)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `spendwise_user_name=${encodeURIComponent(name)}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

export function disableDemoMode() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("spendwise_demo_session");
    document.cookie = "spendwise_demo_session=; path=/; max-age=0";
    document.cookie = "spendwise_user_email=; path=/; max-age=0";
    document.cookie = "spendwise_user_name=; path=/; max-age=0";
  }
}

// 1. Initial Categories
export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-salary", user_id: DEMO_USER_ID, name: "Salary", type: "income", color: "#10b981", icon: "briefcase", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-freelance", user_id: DEMO_USER_ID, name: "Freelance", type: "income", color: "#06b6d4", icon: "laptop", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-food", user_id: DEMO_USER_ID, name: "Food & Dining", type: "expense", color: "#f97316", icon: "utensils", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-rent", user_id: DEMO_USER_ID, name: "Rent & Housing", type: "expense", color: "#8b5cf6", icon: "home", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-transport", user_id: DEMO_USER_ID, name: "Transport", type: "expense", color: "#3b82f6", icon: "car", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-shopping", user_id: DEMO_USER_ID, name: "Shopping", type: "expense", color: "#ec4899", icon: "shopping-bag", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-bills", user_id: DEMO_USER_ID, name: "Bills & Utilities", type: "expense", color: "#eab308", icon: "receipt", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-health", user_id: DEMO_USER_ID, name: "Health & Medical", type: "expense", color: "#ef4444", icon: "heart-pulse", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-entertainment", user_id: DEMO_USER_ID, name: "Entertainment", type: "expense", color: "#a855f7", icon: "film", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-travel", user_id: DEMO_USER_ID, name: "Travel", type: "expense", color: "#14b8a6", icon: "plane", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "cat-other", user_id: DEMO_USER_ID, name: "Other", type: "expense", color: "#64748b", icon: "circle-ellipsis", is_default: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
];

// Helper to format date offset from today
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

function getMonthDate(yearOffset: number, monthOffset: number, day: number): string {
  const now = new Date();
  const y = now.getFullYear() + yearOffset;
  const m = now.getMonth() + 1 + monthOffset;
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// 2. Initial Trips
export const INITIAL_TRIPS: Trip[] = [
  {
    id: "trip-goa-2026",
    user_id: DEMO_USER_ID,
    name: "Goa Beach Holiday",
    destination: "North Goa & Panaji",
    start_date: getDateOffset(-2),
    end_date: getDateOffset(4),
    total_budget: 45000,
    status: "ongoing",
    notes: "Stay at Candolim beach resort, water sports at Calangute and seafood dinner at Britto's",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_TRIP_ITEMS: TripItem[] = [
  {
    id: "item-1",
    trip_id: "trip-goa-2026",
    user_id: DEMO_USER_ID,
    date: getDateOffset(-2),
    title: "Flight BLR to GOI",
    location: "Bangalore Airport",
    estimated_cost: 12000,
    notes: "Indigo morning flight 6E-241",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-2",
    trip_id: "trip-goa-2026",
    user_id: DEMO_USER_ID,
    date: getDateOffset(-1),
    title: "Resort Check-in & Beachside Dinner",
    location: "Candolim Beach",
    estimated_cost: 18000,
    notes: "3 nights sea view suite",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-3",
    trip_id: "trip-goa-2026",
    user_id: DEMO_USER_ID,
    date: getDateOffset(0),
    title: "Scuba Diving & Watersports",
    location: "Grand Island",
    estimated_cost: 7500,
    notes: "Includes gear rental and underwater video",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-4",
    trip_id: "trip-goa-2026",
    user_id: DEMO_USER_ID,
    date: getDateOffset(1),
    title: "Old Goa Heritage Walk & Spice Plantation",
    location: "Old Goa",
    estimated_cost: 3500,
    notes: "Basilica of Bom Jesus & traditional buffet",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-5",
    trip_id: "trip-goa-2026",
    user_id: DEMO_USER_ID,
    date: getDateOffset(2),
    title: "Sunset Cruise & Souvenir Shopping",
    location: "Mandovi River Panjim",
    estimated_cost: 4000,
    notes: "Cashew nuts, feni, handicrafts",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 3. Initial Budgets
export function getInitialBudgets(): Budget[] {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  return [
    { id: "b-food", user_id: DEMO_USER_ID, category_id: "cat-food", amount: 18000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "b-rent", user_id: DEMO_USER_ID, category_id: "cat-rent", amount: 32000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "b-transport", user_id: DEMO_USER_ID, category_id: "cat-transport", amount: 6000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "b-shopping", user_id: DEMO_USER_ID, category_id: "cat-shopping", amount: 15000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "b-bills", user_id: DEMO_USER_ID, category_id: "cat-bills", amount: 8000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "b-entertainment", user_id: DEMO_USER_ID, category_id: "cat-entertainment", amount: 7000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "b-travel", user_id: DEMO_USER_ID, category_id: "cat-travel", amount: 50000, month: curMonth, year: curYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
}

// 4. Initial Transactions
export function getInitialTransactions(): Transaction[] {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();
  const curMonthStr = `${curYear}-${String(curMonth).padStart(2, "0")}`;

  return [
    {
      id: "tx-sal-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-salary",
      type: "income",
      amount: 145000,
      date: `${curMonthStr}-01`,
      payment_method: "Bank",
      notes: "Monthly tech salary credit",
      trip_id: null,
      created_at: `${curMonthStr}-01T10:00:00Z`,
      updated_at: `${curMonthStr}-01T10:00:00Z`,
    },
    {
      id: "tx-free-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-freelance",
      type: "income",
      amount: 28500,
      date: `${curMonthStr}-05`,
      payment_method: "Bank",
      notes: "Next.js web consulting milestone",
      trip_id: null,
      created_at: `${curMonthStr}-05T14:30:00Z`,
      updated_at: `${curMonthStr}-05T14:30:00Z`,
    },
    {
      id: "tx-rent-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-rent",
      type: "expense",
      amount: 32000,
      date: `${curMonthStr}-02`,
      payment_method: "Bank",
      notes: "Apartment maintenance & rent",
      trip_id: null,
      created_at: `${curMonthStr}-02T09:00:00Z`,
      updated_at: `${curMonthStr}-02T09:00:00Z`,
    },
    {
      id: "tx-flight-goa",
      user_id: DEMO_USER_ID,
      category_id: "cat-travel",
      type: "expense",
      amount: 12450,
      date: getDateOffset(-2),
      payment_method: "Card",
      notes: "Roundtrip Flight BLR-GOI (Indigo)",
      trip_id: "trip-goa-2026",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "tx-resort-goa",
      user_id: DEMO_USER_ID,
      category_id: "cat-travel",
      type: "expense",
      amount: 17800,
      date: getDateOffset(-1),
      payment_method: "Card",
      notes: "Candolim Sea Breeze Resort (3 nights)",
      trip_id: "trip-goa-2026",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "tx-dinner-goa",
      user_id: DEMO_USER_ID,
      category_id: "cat-food",
      type: "expense",
      amount: 2450,
      date: getDateOffset(0),
      payment_method: "UPI",
      notes: "Seafood dinner & drinks at Britto's Baga",
      trip_id: "trip-goa-2026",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "tx-grocery-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-food",
      type: "expense",
      amount: 4850,
      date: `${curMonthStr}-08`,
      payment_method: "UPI",
      notes: "Nature's Basket gourmet groceries & staples",
      trip_id: null,
      created_at: `${curMonthStr}-08T18:00:00Z`,
      updated_at: `${curMonthStr}-08T18:00:00Z`,
    },
    {
      id: "tx-zomato-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-food",
      type: "expense",
      amount: 1250,
      date: `${curMonthStr}-12`,
      payment_method: "UPI",
      notes: "Sushi dinner order via Zomato",
      trip_id: null,
      created_at: `${curMonthStr}-12T20:15:00Z`,
      updated_at: `${curMonthStr}-12T20:15:00Z`,
    },
    {
      id: "tx-petrol-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-transport",
      type: "expense",
      amount: 3200,
      date: `${curMonthStr}-04`,
      payment_method: "UPI",
      notes: "Shell Fuel Station full tank",
      trip_id: null,
      created_at: `${curMonthStr}-04T11:00:00Z`,
      updated_at: `${curMonthStr}-04T11:00:00Z`,
    },
    {
      id: "tx-uber-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-transport",
      type: "expense",
      amount: 680,
      date: `${curMonthStr}-10`,
      payment_method: "UPI",
      notes: "Uber Premier to airport terminal",
      trip_id: null,
      created_at: `${curMonthStr}-10T06:30:00Z`,
      updated_at: `${curMonthStr}-10T06:30:00Z`,
    },
    {
      id: "tx-shopping-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-shopping",
      type: "expense",
      amount: 8500,
      date: `${curMonthStr}-06`,
      payment_method: "Card",
      notes: "Uniqlo summer linen wear & travel accessories",
      trip_id: null,
      created_at: `${curMonthStr}-06T16:45:00Z`,
      updated_at: `${curMonthStr}-06T16:45:00Z`,
    },
    {
      id: "tx-wifi-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-bills",
      type: "expense",
      amount: 1499,
      date: `${curMonthStr}-03`,
      payment_method: "UPI",
      notes: "Airtel Fiber 300 Mbps broadband",
      trip_id: null,
      created_at: `${curMonthStr}-03T12:00:00Z`,
      updated_at: `${curMonthStr}-03T12:00:00Z`,
    },
    {
      id: "tx-electricity-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-bills",
      type: "expense",
      amount: 2840,
      date: `${curMonthStr}-07`,
      payment_method: "UPI",
      notes: "BESCOM monthly electricity bill",
      trip_id: null,
      created_at: `${curMonthStr}-07T13:10:00Z`,
      updated_at: `${curMonthStr}-07T13:10:00Z`,
    },
    {
      id: "tx-movie-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-entertainment",
      type: "expense",
      amount: 1650,
      date: `${curMonthStr}-11`,
      payment_method: "UPI",
      notes: "PVR IMAX tickets & gourmet popcorn",
      trip_id: null,
      created_at: `${curMonthStr}-11T19:00:00Z`,
      updated_at: `${curMonthStr}-11T19:00:00Z`,
    },
    {
      id: "tx-pharmacy-curr",
      user_id: DEMO_USER_ID,
      category_id: "cat-health",
      type: "expense",
      amount: 1420,
      date: `${curMonthStr}-09`,
      payment_method: "UPI",
      notes: "Apollo Pharmacy multivitamins & first aid",
      trip_id: null,
      created_at: `${curMonthStr}-09T17:20:00Z`,
      updated_at: `${curMonthStr}-09T17:20:00Z`,
    },
  ];
}

// -------------------------------------------------------------
// LOCAL STORAGE BACKED STORE
// -------------------------------------------------------------
class DemoStore {
  private getStorage<T>(key: string, defaultVal: T): T {
    if (typeof window === "undefined") return defaultVal;
    try {
      const saved = localStorage.getItem(`spendwise_${key}`);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`spendwise_${key}`, JSON.stringify(val));
    } catch {}
  }

  // Categories
  getCategories(): Category[] {
    return this.getStorage("categories", INITIAL_CATEGORIES);
  }

  // Trips
  getTrips(): Trip[] {
    return this.getStorage("trips", INITIAL_TRIPS);
  }

  getTripById(id: string): Trip | null {
    const trips = this.getTrips();
    return trips.find((t) => t.id === id) || null;
  }

  addTrip(input: TripFormInput): Trip {
    const trips = this.getTrips();
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      user_id: DEMO_USER_ID,
      name: input.name,
      destination: input.destination,
      start_date: input.start_date,
      end_date: input.end_date,
      total_budget: input.total_budget,
      status: input.status,
      notes: input.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    trips.unshift(newTrip);
    this.setStorage("trips", trips);
    return newTrip;
  }

  updateTrip(id: string, input: TripFormInput): Trip {
    const trips = this.getTrips();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Trip not found");

    const updated: Trip = {
      ...trips[idx],
      name: input.name,
      destination: input.destination,
      start_date: input.start_date,
      end_date: input.end_date,
      total_budget: input.total_budget,
      status: input.status,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    };
    trips[idx] = updated;
    this.setStorage("trips", trips);
    return updated;
  }

  deleteTrip(id: string): void {
    const trips = this.getTrips().filter((t) => t.id !== id);
    this.setStorage("trips", trips);
  }

  // Trip Items
  getTripItems(tripId: string): TripItem[] {
    const all = this.getStorage("trip_items", INITIAL_TRIP_ITEMS);
    return all.filter((i) => i.trip_id === tripId);
  }

  addTripItem(input: TripItemFormInput): TripItem {
    const all = this.getStorage("trip_items", INITIAL_TRIP_ITEMS);
    const newItem: TripItem = {
      id: `item-${Date.now()}`,
      trip_id: input.trip_id,
      user_id: DEMO_USER_ID,
      date: input.date,
      title: input.title,
      location: input.location || null,
      estimated_cost: input.estimated_cost || 0,
      notes: input.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newItem);
    this.setStorage("trip_items", all);
    return newItem;
  }

  deleteTripItem(id: string): void {
    const all = this.getStorage("trip_items", INITIAL_TRIP_ITEMS).filter((i) => i.id !== id);
    this.setStorage("trip_items", all);
  }

  // Budgets
  getBudgets(month: number, year: number): BudgetWithCategory[] {
    const budgets = this.getStorage("budgets", getInitialBudgets());
    const categories = this.getCategories();
    const txs = this.getTransactions({ page: 1, pageSize: 1000 }).items;

    // Filter budgets by month/year
    const matched = budgets.filter((b) => b.month === month && b.year === year);

    return matched.map((b) => {
      const cat = categories.find((c) => c.id === b.category_id) || {
        id: b.category_id,
        name: "Category",
        color: "#64748b",
        icon: "tag",
      };

      // Calculate spent in this category for this month
      const spent = txs
        .filter((t) => {
          if (t.type !== "expense" || t.category_id !== b.category_id) return false;
          const [tY, tM] = t.date.split("-").map(Number);
          return tY === year && tM === month;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

      return {
        ...b,
        category: {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        },
        spent,
        percentage,
      };
    });
  }

  upsertBudget(input: BudgetFormInput): Budget {
    const budgets = this.getStorage("budgets", getInitialBudgets());
    const existingIdx = budgets.findIndex(
      (b) =>
        b.category_id === input.category_id &&
        b.month === input.month &&
        b.year === input.year
    );

    if (existingIdx >= 0) {
      budgets[existingIdx] = {
        ...budgets[existingIdx],
        amount: input.amount,
        updated_at: new Date().toISOString(),
      };
      this.setStorage("budgets", budgets);
      return budgets[existingIdx];
    } else {
      const newBudget: Budget = {
        id: `b-${Date.now()}`,
        user_id: DEMO_USER_ID,
        category_id: input.category_id,
        amount: input.amount,
        month: input.month,
        year: input.year,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      budgets.push(newBudget);
      this.setStorage("budgets", budgets);
      return newBudget;
    }
  }

  deleteBudget(id: string): void {
    const budgets = this.getStorage("budgets", getInitialBudgets()).filter((b) => b.id !== id);
    this.setStorage("budgets", budgets);
  }

  // Transactions
  getTransactions(filters: Partial<TransactionFilterInput> = {}): {
    items: TransactionWithCategory[];
    totalCount: number;
  } {
    const txs = this.getStorage("transactions", getInitialTransactions());
    const categories = this.getCategories();
    const trips = this.getTrips();

    let filtered = [...txs];

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }
    if (filters.categoryId && filters.categoryId !== "all") {
      filtered = filtered.filter((t) => t.category_id === filters.categoryId);
    }
    if (filters.tripId && filters.tripId !== "all") {
      filtered = filtered.filter((t) => t.trip_id === filters.tripId);
    }
    if (filters.startDate) {
      filtered = filtered.filter((t) => t.date >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter((t) => t.date <= filters.endDate!);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.payment_method.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "date_asc":
        filtered.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "amount_desc":
        filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case "amount_asc":
        filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      case "date_desc":
      default:
        filtered.sort((a, b) => b.date.localeCompare(a.date));
        break;
    }

    const totalCount = filtered.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 15;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const items: TransactionWithCategory[] = paginated.map((t) => {
      const cat = categories.find((c) => c.id === t.category_id);
      const trip = trips.find((tr) => tr.id === t.trip_id);
      return {
        ...t,
        category: cat ? { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon } : null,
        trip: trip ? { id: trip.id, name: trip.name, destination: trip.destination } : null,
      };
    });

    return { items, totalCount };
  }

  addTransaction(input: TransactionFormInput): TransactionWithCategory {
    const txs = this.getStorage("transactions", getInitialTransactions());
    const categories = this.getCategories();
    const trips = this.getTrips();

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: DEMO_USER_ID,
      category_id: input.category_id || "",
      type: input.type,
      amount: input.amount,
      date: input.date,
      payment_method: input.payment_method,
      notes: input.notes || null,
      trip_id: input.trip_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    txs.unshift(newTx);
    this.setStorage("transactions", txs);

    const cat = categories.find((c) => c.id === newTx.category_id);
    const trip = trips.find((tr) => tr.id === newTx.trip_id);

    return {
      ...newTx,
      category: cat ? { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon } : null,
      trip: trip ? { id: trip.id, name: trip.name, destination: trip.destination } : null,
    };
  }

  updateTransaction(id: string, input: TransactionFormInput): TransactionWithCategory {
    const txs = this.getStorage("transactions", getInitialTransactions());
    const categories = this.getCategories();
    const trips = this.getTrips();

    const idx = txs.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Transaction not found");

    const updated: Transaction = {
      ...txs[idx],
      category_id: input.category_id || "",
      type: input.type,
      amount: input.amount,
      date: input.date,
      payment_method: input.payment_method,
      notes: input.notes || null,
      trip_id: input.trip_id || null,
      updated_at: new Date().toISOString(),
    };
    txs[idx] = updated;
    this.setStorage("transactions", txs);

    const cat = categories.find((c) => c.id === updated.category_id);
    const trip = trips.find((tr) => tr.id === updated.trip_id);

    return {
      ...updated,
      category: cat ? { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon } : null,
      trip: trip ? { id: trip.id, name: trip.name, destination: trip.destination } : null,
    };
  }

  deleteTransaction(id: string): void {
    const txs = this.getStorage("transactions", getInitialTransactions()).filter((t) => t.id !== id);
    this.setStorage("transactions", txs);
  }

  // Dashboard Aggregates
  getDashboardSummary(month: number, year: number): MonthlySummary {
    const txs = this.getStorage("transactions", getInitialTransactions());
    let totalIncome = 0;
    let totalExpense = 0;

    txs.forEach((t) => {
      const [tY, tM] = t.date.split("-").map(Number);
      if (tY === year && tM === month) {
        if (t.type === "income") totalIncome += Number(t.amount);
        if (t.type === "expense") totalExpense += Number(t.amount);
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_savings: netSavings,
      savings_rate: Math.round(savingsRate * 100) / 100,
    };
  }

  getCategoryBreakdown(month: number, year: number): CategoryBreakdownItem[] {
    const txs = this.getStorage("transactions", getInitialTransactions());
    const categories = this.getCategories();
    const map = new Map<string, number>();

    let totalExpense = 0;
    txs.forEach((t) => {
      const [tY, tM] = t.date.split("-").map(Number);
      if (tY === year && tM === month && t.type === "expense") {
        const amt = Number(t.amount);
        totalExpense += amt;
        const catKey = t.category_id || "cat-other";
        map.set(catKey, (map.get(catKey) || 0) + amt);
      }
    });

    const items: CategoryBreakdownItem[] = [];
    map.forEach((total_amount, category_id) => {
      const cat = categories.find((c) => c.id === category_id);
      const percentage = totalExpense > 0 ? Math.round((total_amount / totalExpense) * 100) : 0;
      items.push({
        category_id,
        category_name: cat ? cat.name : "Other",
        category_color: cat?.color || "#64748b",
        category_icon: cat?.icon || "tag",
        total_amount,
        percentage,
      });
    });

    return items.sort((a, b) => b.total_amount - a.total_amount);
  }

  getSixMonthTrend(): SixMonthTrendItem[] {
    const txs = this.getStorage("transactions", getInitialTransactions());
    const trend: SixMonthTrendItem[] = [];
    const now = new Date();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = `${monthNames[d.getMonth()]} ${String(y).slice(2)}`;

      let inc = 0;
      let exp = 0;

      txs.forEach((t) => {
        const [tY, tM] = t.date.split("-").map(Number);
        if (tY === y && tM === m) {
          if (t.type === "income") inc += Number(t.amount);
          if (t.type === "expense") exp += Number(t.amount);
        }
      });

      // Provide realistic baseline if historical months are sparse
      if (inc === 0 && exp === 0 && i > 0) {
        inc = 145000 + (i * 3000);
        exp = 68000 + (i * 2500);
      }

      trend.push({
        month_label: label,
        month_num: m,
        year_num: y,
        total_income: inc,
        total_expense: exp,
      });
    }

    return trend;
  }

  getDailySpend(month: number, year: number): DailySpendItem[] {
    const txs = this.getStorage("transactions", getInitialTransactions());
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: DailySpendItem[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let total_expense = 0;

      txs.forEach((t) => {
        if (t.date === dateStr && t.type === "expense") {
          total_expense += Number(t.amount);
        }
      });

      days.push({
        day: d,
        date: dateStr,
        total_expense,
      });
    }

    return days;
  }
}

export const demoStore = new DemoStore();
