"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Plane,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
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
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border px-2 py-1 safe-pb"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-14">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors touch-manipulation",
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
