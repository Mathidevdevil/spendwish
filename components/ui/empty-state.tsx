"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle, Compass, PieChart, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionModal } from "@/hooks/use-transaction-modal";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  completedSteps?: {
    hasTransactions?: boolean;
    hasBudgets?: boolean;
    hasTrips?: boolean;
  };
  className?: string;
}

export function OnboardingEmptyState({
  completedSteps = {},
  className,
}: EmptyStateProps) {
  const steps = [
    {
      id: "tx",
      title: "Add your first expense or income",
      desc: "Log daily coffee, salary credit, or UPI transfers",
      done: Boolean(completedSteps.hasTransactions),
      icon: Receipt,
      action: () => transactionModal.open(),
      actionLabel: "Add Entry",
    },
    {
      id: "budget",
      title: "Set a category budget limit",
      desc: "Get automatic warnings at 80% and 100% spend targets",
      done: Boolean(completedSteps.hasBudgets),
      icon: PieChart,
      href: "/budgets",
      actionLabel: "Set Budget",
    },
    {
      id: "trip",
      title: "Plan an itinerary or travel budget",
      desc: "Track hotel, transit, and daily activity allocations",
      done: Boolean(completedSteps.hasTrips),
      icon: Compass,
      href: "/trips",
      actionLabel: "New Trip",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/80 bg-card p-6 sm:p-8 relative overflow-hidden shadow-xs",
        className
      )}
      style={{
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
      }}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Onboarding Checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <span>Quick Start Checklist</span>
              <span>•</span>
              <span className="num">{completedCount} of 3 completed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome to Spendwise
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Set up your financial cockpit in three simple steps to unlock real-time cash flow analytics, AI suggestions, and travel budgets.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 max-w-md">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Setup Progress</span>
              <span className="font-sans tabular-nums">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden border border-border/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Step items */}
          <div className="space-y-3 pt-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all",
                    step.done
                      ? "bg-surface/50 border-border/40 opacity-75"
                      : "bg-surface hover:bg-surface-elevated border-border/80 shadow-xs"
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                        step.done
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-border/60 text-muted-foreground"
                      )}
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-semibold text-xs sm:text-sm truncate",
                          step.done ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 shrink-0">
                    {step.action ? (
                      <Button
                        size="sm"
                        onClick={step.action}
                        disabled={step.done}
                        className={cn(
                          "rounded-lg text-xs font-semibold h-8",
                          step.done ? "variant-outline" : "btn-gradient"
                        )}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span>{step.actionLabel}</span>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant={step.done ? "outline" : "default"}
                        disabled={step.done}
                        className={cn(
                          "rounded-lg text-xs font-semibold h-8",
                          !step.done && "btn-gradient"
                        )}
                      >
                        <Link href={step.href || "#"}>
                          <span>{step.actionLabel}</span>
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Custom Theme-Aware Financial Vault SVG Illustration */}
        <div className="lg:col-span-5 flex justify-center py-4">
          <svg
            className="w-full max-w-[280px] sm:max-w-[340px] h-auto drop-shadow-md select-none"
            viewBox="0 0 340 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background platform */}
            <ellipse cx="170" cy="225" rx="140" ry="35" fill="currentColor" className="text-emerald-500/10" />
            <ellipse cx="170" cy="225" rx="110" ry="24" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-emerald-500/25" />

            {/* Glowing orb / shield */}
            <circle cx="170" cy="125" r="75" fill="currentColor" className="text-surface" />
            <circle cx="170" cy="125" r="75" stroke="currentColor" strokeWidth="1.5" className="text-border" />
            <circle cx="170" cy="125" r="62" fill="url(#vault-glow)" />

            {/* Center Rupee Symbol with Gradient */}
            <g transform="translate(142, 95)">
              <path
                d="M10 12 H45 M10 24 H38 M10 12 V30 C18 30 28 30 32 36 C36 42 36 52 26 58 L46 78 M10 50 H24"
                stroke="url(#rupee-gradient)"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Floating metric badges */}
            {/* Card 1: Income chip */}
            <g transform="translate(45, 65)">
              <rect width="84" height="34" rx="10" fill="currentColor" className="text-surface" stroke="currentColor" strokeWidth="1" />
              <circle cx="16" cy="17" r="6" fill="#34D399" fillOpacity="0.2" />
              <path d="M14 19 L18 15 M18 15 H15 M18 15 V18" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="30" y="21" fill="currentColor" className="text-foreground" fontSize="11" fontWeight="bold" fontFamily="var(--font-sans), sans-serif">
                ₹1,24,000
              </text>
            </g>

            {/* Card 2: Safe limit badge */}
            <g transform="translate(210, 155)">
              <rect width="82" height="34" rx="10" fill="currentColor" className="text-surface" stroke="currentColor" strokeWidth="1" />
              <circle cx="16" cy="17" r="6" fill="#22D3EE" fillOpacity="0.2" />
              <path d="M13 17 L15.5 19.5 L19 14" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="30" y="21" fill="currentColor" className="text-foreground" fontSize="11" fontWeight="bold" fontFamily="var(--font-sans), sans-serif">
                Safe 80%
              </text>
            </g>

            <defs>
              <linearGradient id="rupee-gradient" x1="10" y1="12" x2="46" y2="78" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
              <radialGradient id="vault-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 125) rotate(90) scale(62)">
                <stop stopColor="#34D399" stopOpacity="0.2" />
                <stop offset="1" stopColor="#06B6D4" stopOpacity="0.02" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

