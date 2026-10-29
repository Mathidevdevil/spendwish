"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Plane,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: PieChart,
  },
  {
    title: "Travel Plans",
    href: "/trips",
    icon: Plane,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card/60 backdrop-blur-md z-30">
      <div className="flex h-16 items-center px-6 border-b border-border gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white shadow-md shadow-primary/20">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Spendwise
          </span>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Finance & Travel
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border/60">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-xs">
            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart AI Finance</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Parse voice or text receipts and get aggregated monthly insights.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
