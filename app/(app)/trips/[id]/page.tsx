"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ListOrdered,
  MapPin,
  PieChart as PieChartIcon,
  Plane,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripDetail, useDeleteTrip, useDeleteTripItem } from "@/hooks/use-trips";
import { useCurrency } from "@/components/providers/currency-provider";
import { formatDate } from "@/lib/utils";
import { TripItemDialog } from "@/components/trips/trip-item-dialog";
import { TripFormDialog } from "@/components/trips/trip-form-dialog";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { DeleteDialog } from "@/components/transactions/delete-dialog";
import { TripItem, TransactionWithCategory } from "@/types/database";
import { Money } from "@/components/ui/money";
import { CategoryIcon } from "@/components/ui/category-icon";

// Dynamically import chart component
const CategoryDonutChart = dynamic(
  () => import("@/components/dashboard/category-donut-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full rounded-xl bg-surface-elevated/40" />,
  }
);

const GRADIENT_PALETTES = [
  "from-emerald-500/25 via-teal-500/15 to-cyan-500/20",
  "from-cyan-500/25 via-blue-500/15 to-indigo-500/20",
  "from-purple-500/25 via-pink-500/15 to-rose-500/20",
  "from-amber-500/25 via-orange-500/15 to-rose-500/20",
];

function getGradient(name: string = ""): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const { data, isLoading } = useTripDetail(tripId);
  const { format } = useCurrency();

  const [editTripOpen, setEditTripOpen] = useState(false);
  const [deleteTripOpen, setDeleteTripOpen] = useState(false);
  const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const deleteTripMutation = useDeleteTrip();
  const deleteItemMutation = useDeleteTripItem();

  // Group itinerary items by date
  const groupedItinerary = useMemo(() => {
    if (!data?.itinerary) return [];
    const map = new Map<string, TripItem[]>();
    data.itinerary.forEach((item) => {
      const d = item.date;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(item);
    });
    return Array.from(map.entries()).map(([dateStr, items]) => ({
      dateStr,
      items,
      dayTotal: items.reduce((s, i) => s + Number(i.estimated_cost), 0),
    }));
  }, [data?.itinerary]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-44 w-full rounded-[24px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data?.trip) {
    return (
      <div className="p-12 text-center rounded-[24px] border border-dashed border-border/80 bg-surface/40">
        <h2 className="text-lg font-bold text-foreground">Trip not found</h2>
        <Button asChild className="mt-4 btn-gradient" size="sm">
          <Link href="/trips">Return to All Trips</Link>
        </Button>
      </div>
    );
  }

  const { trip, expenses, itinerary } = data;
  const isOver = trip.actual_spend > trip.total_budget;
  const gradientClass = getGradient(trip.destination || trip.name);

  // Build category breakdown from trip expenses
  const catMap = new Map<string, any>();
  expenses.forEach((e) => {
    const catId = e.category?.id || "other";
    const catName = e.category?.name || "Other";
    const catColor = e.category?.color || "#64748b";
    const cur = catMap.get(catId) || {
      category_id: catId,
      category_name: catName,
      category_color: catColor,
      total_amount: 0,
      percentage: 0,
    };
    cur.total_amount += Number(e.amount);
    catMap.set(catId, cur);
  });

  const tripCategoryBreakdown = Array.from(catMap.values()).map((c) => ({
    ...c,
    percentage:
      trip.actual_spend > 0
        ? Math.round((c.total_amount / trip.actual_spend) * 10000) / 100
        : 0,
  }));

  const handleDeleteTrip = async () => {
    await deleteTripMutation.mutateAsync(trip.id);
    router.push("/trips");
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    await deleteItemMutation.mutateAsync({ id: deleteItemId, tripId: trip.id });
    setDeleteItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Cover Gradient */}
      <div
        className={`rounded-[24px] border border-border/80 bg-gradient-to-br ${gradientClass} p-6 sm:p-8 relative overflow-hidden shadow-xs`}
        style={{
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
        }}
      >
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 font-semibold transition-colors bg-background/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Trips</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  trip.status === "ongoing"
                    ? "default"
                    : trip.status === "completed"
                    ? "secondary"
                    : "info"
                }
                className="capitalize font-bold text-xs rounded-full px-2.5 py-0.5"
              >
                {trip.status === "ongoing" && <Clock className="h-3 w-3 mr-1" />}
                {trip.status === "planned" && <Plane className="h-3 w-3 mr-1" />}
                {trip.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                <span>{trip.status}</span>
              </Badge>

              <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                <span>{trip.destination}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-foreground">
              {trip.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formatDate(trip.start_date, "medium")} – {formatDate(trip.end_date, "medium")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTripOpen(true)}
              className="rounded-xl text-xs gap-1.5 h-9 bg-background/60 backdrop-blur-xs border-border/80"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Trip</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setAddExpenseOpen(true)}
              className="btn-gradient rounded-xl text-xs gap-1.5 h-9 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Expense</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteTripOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-rose-400 rounded-xl"
              title="Delete Trip"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Stat Row (Budget, Planned, Actual, Remaining) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Budget */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Trip Budget
          </span>
          <div className="mt-2">
            <Money amount={trip.total_budget} size="xl" className="text-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Planned allocation</p>
        </Card>

        {/* Itinerary Estimates (Planned) */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Planned Itinerary
          </span>
          <div className="mt-2">
            <Money amount={trip.itinerary_estimated_cost} size="xl" className="text-cyan-400" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-sans tabular-nums">
            {itinerary.length} scheduled {itinerary.length === 1 ? "activity" : "activities"}
          </p>
        </Card>

        {/* Actual Spend */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Actual Spend
          </span>
          <div className="mt-2">
            <Money
              amount={trip.actual_spend}
              size="xl"
              className={isOver ? "text-rose-400" : "text-foreground"}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-sans tabular-nums">
            {Math.round(trip.percent_budget_used)}% of limit used
          </p>
        </Card>

        {/* Remaining Budget */}
        <Card
          className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs"
          style={{
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          }}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Remaining Budget
          </span>
          <div className="mt-2">
            <Money
              amount={trip.remaining_budget}
              size="xl"
              className={isOver ? "text-rose-400" : "text-emerald-400"}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isOver ? "Over total budget" : "Surplus available"}
          </p>
        </Card>
      </div>

      {/* Budget Consumption Bar */}
      <Card
        className="rounded-[20px] border-border/80 bg-surface p-4 sm:p-5 shadow-xs space-y-2.5"
        style={{
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
        }}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground">
            Budget Consumption vs Itinerary Plan
          </span>
          <span className="text-muted-foreground font-sans tabular-nums">
            {format(trip.actual_spend)} of {format(trip.total_budget)} ({Math.round(trip.percent_budget_used)}%)
          </span>
        </div>
        <Progress
          value={Math.min(100, trip.percent_budget_used)}
          className="h-2 bg-surface-elevated rounded-full"
          indicatorClassName={isOver ? "bg-rose-400" : "bg-emerald-400"}
        />
      </Card>

      {/* Main Content Tabs: Itinerary Timeline & Linked Expenses & Breakdown */}
      <Tabs defaultValue="itinerary" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="bg-surface p-1 rounded-xl border border-border/80">
            <TabsTrigger
              value="itinerary"
              className="rounded-lg text-xs font-semibold gap-1.5"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Itinerary ({itinerary.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="rounded-lg text-xs font-semibold gap-1.5"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Expenses ({expenses.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="breakdown"
              className="rounded-lg text-xs font-semibold gap-1.5"
            >
              <PieChartIcon className="h-3.5 w-3.5" />
              <span>Breakdown</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setItineraryDialogOpen(true);
              }}
              variant="outline"
              className="rounded-xl text-xs gap-1.5 h-9 border-border/80"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Activity</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setAddExpenseOpen(true)}
              className="btn-gradient rounded-xl text-xs gap-1.5 h-9 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Expense</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: Vertical Itinerary Timeline Grouped by Day */}
        <TabsContent value="itinerary" className="space-y-4 mt-2">
          {itinerary.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-[24px] border border-dashed border-border/80 bg-surface/40 space-y-3">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/60 mb-1 stroke-1" />
              <h3 className="text-sm font-semibold text-foreground">No itinerary activities yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Schedule hotel check-ins, flight departures, guided tours, and dining spots.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setItineraryDialogOpen(true);
                }}
                className="btn-gradient rounded-xl text-xs font-semibold"
              >
                Add First Activity
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedItinerary.map((dayGroup) => (
                <div key={dayGroup.dateStr} className="space-y-3">
                  {/* Day Header with Cost for Day */}
                  <div className="flex items-center justify-between px-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold text-foreground">
                        {formatDate(dayGroup.dateStr, "medium")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <span>Day estimate:</span>
                      <span className="font-bold text-foreground font-sans tabular-nums">
                        {format(dayGroup.dayTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Vertical Timeline Items for Day */}
                  <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
                    {dayGroup.items.map((item) => (
                      <div key={item.id} className="relative group">
                        {/* Timeline Bullet */}
                        <div className="absolute -left-6 top-3.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-surface" />

                        <div className="p-4 rounded-[18px] border border-border/80 bg-surface hover:border-border transition-all shadow-xs flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-foreground">
                                {item.title}
                              </span>
                              {item.location && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-semibold gap-1 rounded-full px-2 py-0 bg-surface-elevated border-border"
                                >
                                  <MapPin className="h-2.5 w-2.5 text-primary" />
                                  <span>{item.location}</span>
                                </Badge>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                {item.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <Money amount={item.estimated_cost} size="md" className="text-foreground" />
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                Estimated
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                                onClick={() => {
                                  setEditingItem(item);
                                  setItineraryDialogOpen(true);
                                }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-rose-400 rounded-lg"
                                onClick={() => setDeleteItemId(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Linked Expenses List */}
        <TabsContent value="expenses" className="space-y-2.5 mt-2">
          {expenses.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-[24px] border border-dashed border-border/80 bg-surface/40 space-y-3">
              <Receipt className="h-8 w-8 mx-auto text-muted-foreground/60 mb-1 stroke-1" />
              <h3 className="text-sm font-semibold text-foreground">No expenses linked to this trip</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Record flight tickets, hotel bills, and daily food spends for this trip.
              </p>
              <Button
                size="sm"
                onClick={() => setAddExpenseOpen(true)}
                className="btn-gradient rounded-xl text-xs font-semibold"
              >
                Record Trip Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-[18px] border border-border/80 bg-surface hover:border-border transition-colors text-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CategoryIcon
                      categoryName={tx.category?.name}
                      color={tx.category?.color}
                      size="md"
                    />

                    <div className="min-w-0">
                      <span className="font-bold text-foreground text-sm truncate block">
                        {tx.notes || tx.category?.name || "Expense"}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatDate(tx.date, "short")}</span>
                        <span>•</span>
                        <span className="bg-surface-elevated px-2 py-0.5 rounded-full font-medium border border-border/60">
                          {tx.payment_method}
                        </span>
                        {tx.category?.name && (
                          <>
                            <span>•</span>
                            <span>{tx.category.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Money amount={tx.amount} showSign type="expense" size="md" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Category Breakdown Chart */}
        <TabsContent value="breakdown" className="mt-2">
          <Card
            className="rounded-[20px] border-border/80 bg-surface p-5 shadow-xs"
            style={{
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
            }}
          >
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <PieChartIcon className="h-4 w-4 text-primary" />
                <span>Trip Outflows by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-1">
              <CategoryDonutChart data={tripCategoryBreakdown} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TripFormDialog
        open={editTripOpen}
        onOpenChange={setEditTripOpen}
        initialData={trip}
      />

      <TripItemDialog
        open={itineraryDialogOpen}
        onOpenChange={setItineraryDialogOpen}
        tripId={trip.id}
        initialData={editingItem}
      />

      <TransactionFormDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        defaultTripId={trip.id}
      />

      <DeleteDialog
        open={deleteTripOpen}
        onOpenChange={setDeleteTripOpen}
        onConfirm={handleDeleteTrip}
        title="Delete this entire trip?"
        description="Are you sure you want to delete this trip and its itinerary activities? Tagged expenses will remain in your financial ledger."
        isLoading={deleteTripMutation.isPending}
      />

      <DeleteDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title="Delete itinerary activity?"
        description="Are you sure you want to delete this scheduled activity?"
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
}
