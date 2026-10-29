"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Plane,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { transactionModal } from "@/hooks/use-transaction-modal";

const LEFT_NAV_ITEMS = [
  {
    title: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Expenses",
    href: "/transactions",
    icon: Receipt,
  },
];

const RIGHT_NAV_ITEMS = [
  {
    title: "Budgets",
    href: "/budgets",
    icon: PieChart,
  },
  {
    title: "Travel",
    href: "/trips",
    icon: Plane,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border px-3 safe-pb"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {/* Left 2 Items: Home, Expenses */}
        {LEFT_NAV_ITEMS.map((item) => {
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
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 text-[11px] font-medium transition-colors touch-manipulation",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-transform",
                  isActive && "scale-110"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}

        {/* Center Floating Quick-Add Action */}
        <div className="flex items-center justify-center flex-1 h-full">
          <button
            type="button"
            onClick={() => transactionModal.open()}
            className="flex items-center justify-center -mt-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/35 hover:bg-primary/90 active:scale-90 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Quick Add Transaction"
            title="Quick Add Entry"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right 2 Items: Budgets, Travel */}
        {RIGHT_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 text-[11px] font-medium transition-colors touch-manipulation",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-transform",
                  isActive && "scale-110"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
