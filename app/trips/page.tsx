"use client";

import { useState } from "react";
import { Compass, Filter, Plane, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCard } from "@/components/trips/trip-card";
import { TripFormDialog } from "@/components/trips/trip-form-dialog";
import { useTrips, TripWithSpend } from "@/hooks/use-trips";

export default function TripsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripWithSpend | null>(null);

  const { data: trips = [], isLoading } = useTrips(statusFilter);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Travel Plans
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Plan vacations, estimate itineraries, and monitor real-time travel
              budgets
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingTrip(null);
              setDialogOpen(true);
            }}
            className="rounded-xl font-semibold gap-2 shadow-sm shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Trip</span>
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-muted p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs font-semibold">
                All Trips
              </TabsTrigger>
              <TabsTrigger
                value="planned"
                className="rounded-lg text-xs font-semibold"
              >
                Planned
              </TabsTrigger>
              <TabsTrigger
                value="ongoing"
                className="rounded-lg text-xs font-semibold"
              >
                Ongoing
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-lg text-xs font-semibold"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            {trips.length} {trips.length === 1 ? "trip" : "trips"} found
          </span>
        </div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-muted/40 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Compass className="h-7 w-7 stroke-1" />
            </div>
            <h3 className="text-base font-semibold">No trips found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {statusFilter === "all"
                ? "Start planning your next getaway! Create a trip to schedule activities and tag expenses."
                : `No ${statusFilter} trips found. Try selecting another filter or create a new trip.`}
            </p>
            <Button
              onClick={() => {
                setEditingTrip(null);
                setDialogOpen(true);
              }}
              className="rounded-xl font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Trip</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={(t) => {
                  setEditingTrip(t);
                  setDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Trip Form Dialog */}
        <TripFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingTrip}
        />
      </div>
    </AppShell>
  );
}
