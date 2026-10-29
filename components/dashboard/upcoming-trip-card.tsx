"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Compass, MapPin, Plane, Plus } from "lucide-react";
import { TripWithSpend } from "@/hooks/use-trips";
import { useCurrency } from "@/components/providers/currency-provider";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingTripCardProps {
  trips?: TripWithSpend[];
  isLoading?: boolean;
}

// Deterministic gradient palettes based on destination name
const GRADIENT_PALETTES = [
  "from-emerald-500/20 via-teal-500/15 to-cyan-500/20",
  "from-cyan-500/20 via-blue-500/15 to-indigo-500/20",
  "from-purple-500/20 via-pink-500/15 to-rose-500/20",
  "from-amber-500/20 via-orange-500/15 to-rose-500/20",
];

function getGradient(name: string = ""): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export function UpcomingTripCard({ trips, isLoading }: UpcomingTripCardProps) {
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <Card className="rounded-[20px] border-border/80 bg-card p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-3 w-full" />
      </Card>
    );
  }

  // Find upcoming or ongoing trip
  const activeTrip =
    trips?.find((t) => t.status === "ongoing") ||
    trips?.find((t) => t.status === "planned") ||
    trips?.[0];

  if (!activeTrip) {
    return (
      <Card className="rounded-[20px] border-border/80 bg-card flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Compass className="h-4 w-4 text-primary" />
            <span>Travel & Itinerary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-5 flex flex-col items-center text-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Plane className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">No upcoming trips planned</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px]">
              Set a vacation budget, track flight & hotel bills, and manage daily costs.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8 gap-1.5 mt-1">
            <Link href="/trips">
              <Plus className="h-3.5 w-3.5" />
              <span>Plan Trip</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const gradientClass = getGradient(activeTrip.destination || activeTrip.name);
  const percentUsed = Math.min(100, Math.max(0, activeTrip.percent_budget_used || 0));
  const isOver = percentUsed >= 100;
  const isNear = percentUsed >= 80 && !isOver;

  return (
    <Card className="rounded-[20px] border-border/80 bg-card overflow-hidden flex flex-col justify-between h-full group hover:border-border transition-all">
      {/* Destination Gradient Cover */}
      <div className={`p-4 bg-gradient-to-br ${gradientClass} border-b border-border/60 relative`}>
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background/70 backdrop-blur-xs text-[11px] font-semibold text-foreground border border-border/50">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="truncate max-w-[130px]">{activeTrip.destination}</span>
          </div>

          <Badge
            variant={
              activeTrip.status === "ongoing"
                ? "default"
                : activeTrip.status === "planned"
                ? "info"
                : "secondary"
            }
            className="text-[10px] px-2 py-0 capitalize"
          >
            {activeTrip.status}
          </Badge>
        </div>

        <div className="mt-3">
          <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
            {activeTrip.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(activeTrip.start_date, "short")} – {formatDate(activeTrip.end_date, "short")}
            </span>
          </div>
        </div>
      </div>

      {/* Trip Budget Progress */}
      <CardContent className="p-4 space-y-3 pt-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Budget Used</span>
            <span
              className={`num font-semibold ${
                isOver
                  ? "text-rose-400"
                  : isNear
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {Math.round(percentUsed)}%
            </span>
          </div>

          <Progress
            value={percentUsed}
            className="h-1.5 bg-surface-elevated"
            indicatorClassName={
              isOver ? "bg-rose-400" : isNear ? "bg-amber-400" : "bg-emerald-400"
            }
          />

          <div className="flex items-center justify-between text-[11px] num text-muted-foreground pt-0.5">
            <span>Spent {format(activeTrip.actual_spend)}</span>
            <span>Total {format(activeTrip.total_budget)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {activeTrip.remaining_budget >= 0 ? "Remaining:" : "Over by:"}
            <strong className="ml-1 text-foreground num">
              {format(Math.abs(activeTrip.remaining_budget))}
            </strong>
          </span>

          <Link
            href={`/trips/${activeTrip.id}`}
            className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
          >
            <span>Itinerary</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

