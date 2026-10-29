"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreHorizontal,
  PieChart,
  Plus,
  Receipt,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { transactionModal } from "@/hooks/use-transaction-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { disableDemoMode } from "@/lib/demo-data";
import { toast } from "sonner";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      disableDemoMode();
      await fetch("/api/auth/demo-session", { method: "DELETE" }).catch(() => {});
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
      queryClient.clear();
      setMoreSheetOpen(false);
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const isHomeActive = pathname === "/" || pathname === "/dashboard";
  const isTxActive = pathname.startsWith("/transactions");
  const isBudgetsActive = pathname.startsWith("/budgets");
  const isMoreActive =
    pathname.startsWith("/trips") || pathname.startsWith("/settings");

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-t border-border/80 px-2 safe-pb"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            href="/"
            prefetch={true}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-[11px] font-medium transition-colors touch-manipulation",
              isHomeActive
                ? "text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-transform",
                isHomeActive && "scale-110"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span>Home</span>
          </Link>

          {/* 2. Expenses */}
          <Link
            href="/transactions"
            prefetch={true}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-[11px] font-medium transition-colors touch-manipulation",
              isTxActive
                ? "text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-transform",
                isTxActive && "scale-110"
              )}
            >
              <Receipt className="h-5 w-5" />
            </div>
            <span>Expenses</span>
          </Link>

          {/* 3. Center Floating Quick-Add Action */}
          <div className="flex items-center justify-center flex-1 h-full">
            <button
              type="button"
              onClick={() => transactionModal.open()}
              className="flex items-center justify-center -mt-6 h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/35 hover:brightness-105 active:scale-90 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Add transaction"
              title="Add New Entry"
            >
              <Plus className="h-6 w-6 stroke-[2.75]" />
            </button>
          </div>

          {/* 4. Budgets */}
          <Link
            href="/budgets"
            prefetch={true}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-[11px] font-medium transition-colors touch-manipulation",
              isBudgetsActive
                ? "text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-transform",
                isBudgetsActive && "scale-110"
              )}
            >
              <PieChart className="h-5 w-5" />
            </div>
            <span>Budgets</span>
          </Link>

          {/* 5. More (Opens Bottom Sheet) */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-[11px] font-medium transition-colors touch-manipulation",
              isMoreActive
                ? "text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="More navigation options"
          >
            <div
              className={cn(
                "p-1 rounded-full transition-transform",
                isMoreActive && "scale-110"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Dialog on Mobile */}
      <Dialog open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <DialogContent
          className="lg:hidden max-sm:fixed max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[28px] max-sm:border-b-0 p-5 bg-surface border border-border/80 shadow-2xl"
        >
          <div className="mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border" />
          <DialogHeader className="text-left pb-2">
            <DialogTitle className="text-lg font-bold text-foreground">
              More Options
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 pt-1">
            <Link
              href="/trips"
              onClick={() => setMoreSheetOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated hover:bg-border/40 text-foreground transition-colors font-medium text-sm"
            >
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Compass className="h-4 w-4" />
              </div>
              <span>Travel Plans & Itineraries</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMoreSheetOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated hover:bg-border/40 text-foreground transition-colors font-medium text-sm"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </div>
              <span>Account & Preferences</span>
            </Link>

            <div className="p-3 rounded-xl bg-surface-elevated flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </div>
                <span>Theme</span>
              </div>
              <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold",
                    theme === "dark"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold",
                    theme === "light"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  Light
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors font-medium text-sm text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Log out</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
