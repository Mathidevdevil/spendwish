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
import { Money } from "@/components/ui/money";

interface TripCardProps {
  trip: TripWithSpend;
  onEdit: (trip: TripWithSpend) => void;
}

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

export function TripCard({ trip, onEdit }: TripCardProps) {
  const { format } = useCurrency();
  const deleteMutation = useDeleteTrip();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = Number(trip.total_budget) || 0;
  const spent = Number(trip.actual_spend) || 0;
  const remaining = total - spent;
  const percentage = Math.round(trip.percent_budget_used);
  const isOver = spent > total;
  const isNear = percentage >= 80 && !isOver;

  const gradientClass = getGradient(trip.destination || trip.name);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(trip.id);
      setDeleteOpen(false);
    } catch {
      // handled in mutation
    }
  };

  return (
    <>
      <Card
        className="group relative rounded-[20px] border-border/80 bg-surface shadow-xs hover:border-border transition-all overflow-hidden flex flex-col justify-between"
        style={{
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
        }}
      >
        {/* Deterministic Gradient Cover Generated from Destination Name */}
        <div className={`p-5 bg-gradient-to-br ${gradientClass} border-b border-border/60 relative`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge
              variant={
                trip.status === "ongoing"
                  ? "default"
                  : trip.status === "planned"
                  ? "info"
                  : "secondary"
              }
              className="text-[10px] px-2.5 py-0.5 capitalize font-bold rounded-full"
            >
              {trip.status === "ongoing" && <Clock className="h-3 w-3 mr-1" />}
              {trip.status === "planned" && <Plane className="h-3 w-3 mr-1" />}
              {trip.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              <span>{trip.status}</span>
            </Badge>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-xs rounded-lg"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Trip actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl bg-surface border-border/80">
                <DropdownMenuItem
                  onClick={() => onEdit(trip)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Trip</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="cursor-pointer gap-2 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Trip</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Destination as Large Text */}
          <Link href={`/trips/${trip.id}`} className="block group-hover:opacity-95">
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>Destination</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {trip.destination}
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
              {trip.name}
            </p>
          </Link>
        </div>

        {/* Card Body */}
        <Link href={`/trips/${trip.id}`} className="block p-5 flex-1 flex flex-col justify-between space-y-4">
          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>
              {formatDate(trip.start_date, "short")} – {formatDate(trip.end_date, "medium")}
            </span>
          </div>

          {/* Budget Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground font-medium">Budget:</span>
              <div className="flex items-baseline gap-1">
                <Money amount={spent} size="sm" className="text-foreground" />
                <span className="text-muted-foreground text-[11px]">/ {format(total)}</span>
              </div>
            </div>

            <Progress
              value={Math.min(100, percentage)}
              className="h-1.5 bg-surface-elevated rounded-full"
              indicatorClassName={
                isOver ? "bg-rose-400" : isNear ? "bg-amber-400" : "bg-emerald-400"
              }
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans tabular-nums pt-0.5">
              <span>{percentage}% used</span>
              <span className={isOver ? "text-rose-400 font-bold" : isNear ? "text-amber-400 font-semibold" : ""}>
                {isOver
                  ? `Over by ${format(Math.abs(remaining))}`
                  : `${format(remaining)} remaining`}
              </span>
            </div>
          </div>
        </Link>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={`Delete trip "${trip.name}"?`}
        description="Are you sure you want to delete this trip and its itinerary? Tagged transactions will be kept in your ledger."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
