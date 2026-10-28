"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  MoreVertical,
  Plane,
  Trash2,
} from "lucide-react";
import { TripWithSpend, useDeleteTrip } from "@/hooks/use-trips";
import { useCurrency } from "@/components/providers/currency-provider";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/transactions/delete-dialog";

interface TripCardProps {
  trip: TripWithSpend;
  onEdit: (trip: TripWithSpend) => void;
}

export function TripCard({ trip, onEdit }: TripCardProps) {
  const { format } = useCurrency();
  const deleteMutation = useDeleteTrip();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = Number(trip.total_budget) || 0;
  const spent = Number(trip.actual_spend) || 0;
  const remaining = total - spent;
  const percentage = Math.round(trip.percent_budget_used);
  const isOver = spent > total;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return (
          <Badge
            variant="success"
            className="text-[11px] px-2 py-0.5 font-semibold gap-1"
          >
            <Clock className="h-3 w-3" />
            <span>Ongoing</span>
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="text-[11px] px-2 py-0.5 font-semibold gap-1 text-muted-foreground"
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        );
      case "planned":
      default:
        return (
          <Badge
            variant="DEFAULT"
            className="text-[11px] px-2 py-0.5 font-semibold gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          >
            <Plane className="h-3 w-3" />
            <span>Planned</span>
          </Badge>
        );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(trip.id);
      setDeleteOpen(false);
    } catch {
      // error handled in mutation
    }
  };

  return (
    <>
      <Card className="group relative rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
        <Link href={`/trips/${trip.id}`} className="block p-5 flex-1">
          {/* Top Status & Destination */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {getStatusBadge(trip.status)}
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{trip.destination}</span>
            </div>
          </div>

          {/* Trip Title */}
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {trip.name}
          </h3>

          {/* Dates */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-4">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(trip.start_date, "short")} -{" "}
              {formatDate(trip.end_date, "medium")}
            </span>
          </div>

          {/* Financial summary bar */}
          <div className="space-y-2 pt-2 border-t border-border/70">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground font-medium">Spent:</span>
              <div>
                <span className="font-bold text-sm text-foreground">
                  {format(spent)}
                </span>
                <span className="text-muted-foreground ml-1">
                  / {format(total)}
                </span>
              </div>
            </div>

            <Progress
              value={Math.min(100, percentage)}
              className="h-2 bg-secondary"
              indicatorClassName={
                isOver ? "bg-rose-500" : "bg-emerald-600 dark:bg-emerald-500"
              }
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{percentage}% budget used</span>
              <span className={isOver ? "text-destructive font-semibold" : ""}>
                {isOver
                  ? `Over by ${format(Math.abs(remaining))}`
                  : `${format(remaining)} left`}
              </span>
            </div>
          </div>
        </Link>

        {/* Quick Menu Button */}
        <div className="absolute top-4 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Trip actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={() => onEdit(trip)}
                className="cursor-pointer gap-2"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Trip</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Trip</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={`Delete trip "${trip.name}"?`}
        description="Are you sure you want to delete this trip and its itinerary? Tagged transactions will be kept and unlinked from the trip."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
