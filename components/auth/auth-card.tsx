"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Lock,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Sparkline } from "@/components/ui/sparkline";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  // Static mock sparkline data for left-side hero preview
  const sampleSparkline = [32, 45, 41, 55, 62, 58, 70, 68, 84];

  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* 1. Left Panel (Desktop Split-Screen) */}
      <aside className="hidden lg:flex lg:col-span-6 xl:col-span-6 relative flex-col justify-between p-10 xl:p-14 bg-surface border-r border-border/80 overflow-hidden select-none">
        {/* Animated Gradient Mesh (Subtle, CSS only) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(circle at 10% 20%, rgba(52, 211, 153, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(34, 211, 238, 0.12) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(16, 185, 129, 0.10) 0%, transparent 50%)",
          }}
        />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">
                Spendwise
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Fintech Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Center Headline & Floating Mini Preview Card */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Personal Finance</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-[-0.02em] text-foreground leading-tight">
              Know where every rupee goes.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Designed for modern financial clarity with automated category tracking, intelligent AI receipts, and dedicated trip budgets.
            </p>
          </div>

          {/* Floating Mini Product Preview Card */}
          <div
            className="rounded-[24px] border border-border/80 bg-surface-elevated/90 p-5 shadow-xl backdrop-blur-md relative overflow-hidden space-y-4"
            style={{
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Net Balance This Month
                </span>
                <div className="text-2xl font-bold tracking-tight font-sans tabular-nums text-foreground mt-0.5">
                  +₹84,200
                </div>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                <TrendingUp className="h-3 w-3" />
                <span>+14.2%</span>
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="pt-1">
              <Sparkline data={sampleSparkline} height={42} color="#34D399" />
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-sans tabular-nums text-muted-foreground">
              <span>Inflow: <strong className="text-emerald-400">₹1,24,000</strong></span>
              <span>Outflow: <strong className="text-rose-400">₹39,800</strong></span>
            </div>
          </div>

          {/* 3 Value Props */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span>Bank-grade privacy with Supabase Row Level Security</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span>Zero-lag local cache with TanStack Query and SSR</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Compass className="h-3.5 w-3.5" />
              </div>
              <span>Integrated travel itineraries and category budgets</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="relative z-10 flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>256-bit encrypted authentication session</span>
        </div>
      </aside>

      {/* 2. Right Panel (Form View) */}
      <main
        role="main"
        className="col-span-12 lg:col-span-6 xl:col-span-6 flex flex-col justify-between items-center p-6 sm:p-10 lg:p-14 relative min-h-[100dvh]"
      >
        {/* Top-Right Theme Toggle */}
        <header className="w-full flex items-center justify-between lg:justify-end">
          {/* Mobile brand logo */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              Spendwise
            </span>
          </div>
          <ThemeToggle />
        </header>

        {/* Center Form Container */}
        <div className="w-full max-w-sm sm:max-w-md my-auto py-8 space-y-6">
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Footer note */}
        <footer className="text-center text-[11px] text-muted-foreground/80 py-2">
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </footer>
      </main>
    </div>
  );
}
