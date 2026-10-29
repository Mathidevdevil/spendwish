"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  PieChart,
  Receipt,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    icon: Compass,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string | null;
  isDemo?: boolean;
}

export function DesktopSidebar({
  isCollapsed,
  onToggleCollapse,
  userEmail,
  userName,
  avatarUrl,
  isDemo = false,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const displayName = userName || (userEmail ? userEmail.split("@")[0] : "Account");
  const initials = getInitials(userName, userEmail);

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 border-r border-border/70 bg-card z-30 transition-all duration-200 select-none",
        isCollapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      {/* Top Header / Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/70 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0 font-bold">
            <Wallet className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base leading-tight tracking-tight text-foreground truncate">
                Spendwise
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Fintech Engine
              </span>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated flex items-center justify-center transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col justify-between p-3 overflow-y-auto">
        <nav className="space-y-1" aria-label="Main Navigation">
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
                  "relative flex items-center gap-3 rounded-xl transition-all group font-medium text-xs sm:text-sm",
                  isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {/* Thin accent indicator on active */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-cyan-400" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-emerald-400" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />

                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated flex items-center justify-center transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom User Card */}
        <div className="pt-3 border-t border-border/70 mt-auto">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-surface-elevated group",
              isCollapsed && "justify-center p-1.5"
            )}
            title={isCollapsed ? displayName : undefined}
          >
            <Avatar className="h-8 w-8 rounded-full border border-border/80 shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-surface-elevated text-[11px] font-bold text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-emerald-400 transition-colors">
                    {displayName}
                  </p>
                  {isDemo ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      Demo
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate font-mono">
                  {userEmail || "user@spendwise.app"}
                </p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
