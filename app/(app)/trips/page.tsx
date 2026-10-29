"use client";

import { useState } from "react";
import { Compass, Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TripCard } from "@/components/trips/trip-card";
import { TripFormDialog } from "@/components/trips/trip-form-dialog";
import { useTrips, TripWithSpend } from "@/hooks/use-trips";

export default function TripsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripWithSpend | null>(null);

  const { data: trips = [], isLoading } = useTrips(statusFilter);

  const filterOptions = [
    { value: "all", label: "All Trips" },
    { value: "planned", label: "Planned" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Travel Plans
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Plan destinations, schedule daily itinerary items, and track travel budgets
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingTrip(null);
            setDialogOpen(true);
          }}
          className="btn-gradient font-semibold rounded-xl text-xs h-9 gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Trip</span>
        </Button>
      </div>

      {/* Status Filter Segmented Control */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <SegmentedControl
          options={filterOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          size="sm"
        />

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
              className="h-52 rounded-[20px] bg-surface-elevated/40 animate-pulse border border-border/80"
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px] border border-dashed border-border/80 bg-surface/40 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-surface-elevated border border-border/60 flex items-center justify-center text-muted-foreground mb-1">
            <Compass className="h-7 w-7 text-primary stroke-1" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No trips found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {statusFilter === "all"
              ? "Start planning your next adventure! Create a trip to schedule activities and tag daily spends."
              : `No ${statusFilter} trips found. Try selecting another filter or plan a new journey.`}
          </p>
          <Button
            onClick={() => {
              setEditingTrip(null);
              setDialogOpen(true);
            }}
            className="btn-gradient font-semibold rounded-xl text-xs h-9 gap-1.5 mt-2"
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
  );
}
