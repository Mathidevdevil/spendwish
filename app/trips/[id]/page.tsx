"use client";

import { use, useState } from "react";
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
  MoreVertical,
  PieChart as PieChartIcon,
  Plane,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
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

// Dynamically import chart component
const CategoryDonutChart = dynamic(
  () => import("@/components/dashboard/category-donut-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full rounded-xl" />,
  }
);

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

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!data?.trip) {
    return (
      <AppShell>
        <div className="p-12 text-center">
          <h2 className="text-lg font-bold">Trip not found</h2>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/trips">Return to Trips</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const { trip, expenses, itinerary } = data;
  const isOver = trip.actual_spend > trip.total_budget;

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
      category_icon: "tag",
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
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Trips</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {trip.name}
                </h1>
                <Badge
                  variant={
                    trip.status === "ongoing"
                      ? "success"
                      : trip.status === "completed"
                      ? "secondary"
                      : "DEFAULT"
                  }
                  className="capitalize font-semibold text-xs"
                >
                  {trip.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-primary font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.destination}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(trip.start_date, "medium")} -{" "}
                  {formatDate(trip.end_date, "medium")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditTripOpen(true)}
                className="rounded-xl text-xs gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Trip</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteTripOpen(true)}
                className="rounded-xl text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Planned vs Actual Comparison KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Budget */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Trip Budget
              </span>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {format(trip.total_budget)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Planned allocation
              </p>
            </CardContent>
          </Card>

          {/* Itinerary Estimates */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Itinerary Estimates
              </span>
              <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-primary">
                {format(trip.itinerary_estimated_cost)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {itinerary.length} scheduled activities
              </p>
            </CardContent>
          </Card>

          {/* Actual Spend */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Actual Spend
              </span>
              <div
                className={`mt-2 text-xl sm:text-2xl font-bold tracking-tight ${
                  isOver ? "text-destructive" : "text-foreground"
                }`}
              >
                {format(trip.actual_spend)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {Math.round(trip.percent_budget_used)}% of budget used
              </p>
            </CardContent>
          </Card>

          {/* Remaining Budget */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground">
                Remaining Budget
              </span>
              <div
                className={`mt-2 text-xl sm:text-2xl font-bold tracking-tight ${
                  isOver
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {format(trip.remaining_budget)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isOver ? "Over total budget" : "Surplus available"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Consumption Bar */}
        <Card className="rounded-2xl border-border p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              Overall Spend Progress
            </span>
            <span className="text-muted-foreground font-medium">
              {format(trip.actual_spend)} / {format(trip.total_budget)}
            </span>
          </div>
          <Progress
            value={Math.min(100, trip.percent_budget_used)}
            className="h-2.5 bg-secondary"
            indicatorClassName={
              isOver ? "bg-rose-500" : "bg-emerald-600 dark:bg-emerald-500"
            }
          />
        </Card>

        {/* Main Content Tabs: Itinerary Timeline & Trip Expenses & Category Chart */}
        <Tabs defaultValue="itinerary" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-muted p-1 rounded-xl">
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
                <span>Category Breakdown</span>
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
                className="rounded-xl text-xs gap-1.5 h-9"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Activity</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setAddExpenseOpen(true)}
                className="rounded-xl text-xs gap-1.5 h-9 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Trip Expense</span>
              </Button>
            </div>
          </div>

          {/* TAB 1: Itinerary Timeline */}
          <TabsContent value="itinerary" className="space-y-3 mt-2">
            {itinerary.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card/50">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2 stroke-1" />
                <h3 className="text-sm font-semibold">No itinerary items yet</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Schedule hotel bookings, flights, transfers, and activities.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setItineraryDialogOpen(true);
                  }}
                  className="rounded-xl text-xs"
                >
                  Add First Activity
                </Button>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                {itinerary.map((item, index) => (
                  <div key={item.id} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-6 top-4 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />

                    <div className="p-4 rounded-2xl border border-border bg-card hover:bg-accent/30 transition-colors shadow-sm flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {item.title}
                          </span>
                          {item.location && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium gap-1"
                            >
                              <MapPin className="h-2.5 w-2.5 text-primary" />
                              <span>{item.location}</span>
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {formatDate(item.date, "medium")}
                          </span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-xs">
                                {item.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-sm text-foreground">
                            {format(item.estimated_cost)}
                          </div>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Estimated
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
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
            )}
          </TabsContent>

          {/* TAB 2: Trip-Tagged Expenses */}
          <TabsContent value="expenses" className="space-y-2 mt-2">
            {expenses.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card/50">
                <Receipt className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2 stroke-1" />
                <h3 className="text-sm font-semibold">No expenses tagged to this trip</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Record flight tickets, hotel bills, and food spends for this trip.
                </p>
                <Button
                  size="sm"
                  onClick={() => setAddExpenseOpen(true)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Record Trip Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: tx.category?.color
                            ? `${tx.category.color}20`
                            : "#ef444420",
                          color: tx.category?.color || "#ef4444",
                        }}
                      >
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground text-sm truncate block">
                          {tx.notes || tx.category?.name || "Expense"}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{formatDate(tx.date, "short")}</span>
                          <span>•</span>
                          <span className="bg-muted px-1.5 py-0.5 rounded-md font-medium">
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

                    <div className="font-bold text-sm text-foreground shrink-0 text-right">
                      {format(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Category Breakdown Chart */}
          <TabsContent value="breakdown" className="mt-2">
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Trip Spend by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
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
    </AppShell>
  );
}
